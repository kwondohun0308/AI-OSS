#!/usr/bin/env python3
"""
Weekly DORA Report Generator
==============================
data/metrics.json 을 읽어 Markdown 형식의 주간 보고서를 생성합니다.
- reports/weekly-report-YYYY-MM-DD.md  (날짜별 보고서)
- reports/latest-report.md             (항상 최신으로 덮어쓰기)
"""
import json
from datetime import datetime, timezone
from pathlib import Path

# ── 포맷 헬퍼 ──────────────────────────────────────────────────────────────────

LEVEL_EMOJI = {
    "Elite":   "🟢",
    "High":    "🔵",
    "Medium":  "🟡",
    "Low":     "🔴",
    "Unknown": "⚪",
}


def badge(level: str) -> str:
    return f"{LEVEL_EMOJI.get(level, '⚪')} **{level}**"


def fmt_hours(h: float) -> str:
    if h == 0:
        return "N/A"
    if h < 1:
        return f"{h * 60:.0f}분"
    if h < 24:
        return f"{h:.1f}시간"
    return f"{h / 24:.1f}일"


def trend_arrow(history: list, key_path: list) -> str:
    """최근 2개 snapshot 비교 → 개선/악화 화살표 반환."""
    if len(history) < 2:
        return ""
    def get_val(snap: dict) -> float | None:
        cur = snap
        for k in key_path:
            cur = cur.get(k, {})
        return cur if isinstance(cur, (int, float)) else None

    prev = get_val(history[-2])
    curr = get_val(history[-1])
    if prev is None or curr is None:
        return ""
    # 낮을수록 좋은 지표 (lead_time, mttr, cfr)
    if key_path[0] in ("lead_time_for_changes", "mttr", "change_failure_rate"):
        return " ▼ 개선" if curr < prev else (" ▲ 악화" if curr > prev else " ─ 유지")
    # 높을수록 좋은 지표 (deployment_frequency)
    return " ▲ 개선" if curr > prev else (" ▼ 악화" if curr < prev else " ─ 유지")

# ── 보고서 생성 ────────────────────────────────────────────────────────────────

def generate_report(snapshot: dict, history: list) -> str:
    period = snapshot.get("period", {})
    df     = snapshot.get("deployment_frequency",  {})
    lt     = snapshot.get("lead_time_for_changes", {})
    mttr   = snapshot.get("mttr",                  {})
    cfr    = snapshot.get("change_failure_rate",   {})

    date_str = (snapshot.get("collected_at") or "")[:10] or \
               datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start    = period.get("start", "")[:10]
    end      = period.get("end",   "")[:10]

    # 트렌드 화살표
    t_df   = trend_arrow(history, ["deployment_frequency",  "per_week"])
    t_lt   = trend_arrow(history, ["lead_time_for_changes", "average_hours"])
    t_mttr = trend_arrow(history, ["mttr",                  "average_hours"])
    t_cfr  = trend_arrow(history, ["change_failure_rate",   "rate"])

    lines = [
        f"# 📊 DORA 주간 보고서 — {date_str}",
        "",
        f"> **측정 기간**: {start} ~ {end} ({period.get('days', 30)}일)",
        "",
        "---",
        "",
        "## 요약 테이블",
        "",
        "| 지표 | 값 | DORA 등급 | 추세 |",
        "|------|----|-----------|------|",
        f"| 🚀 배포 빈도 (Deployment Frequency) | {df.get('per_week', 0):.2f}회/주 | {badge(df.get('level','Unknown'))} |{t_df} |",
        f"| ⏱ 변경 리드타임 (Lead Time) | {fmt_hours(lt.get('average_hours', 0))} | {badge(lt.get('level','Unknown'))} |{t_lt} |",
        f"| 🔧 복구 시간 (MTTR) | {fmt_hours(mttr.get('average_hours', 0))} | {badge(mttr.get('level','Unknown'))} |{t_mttr} |",
        f"| ❌ 변경 실패율 (CFR) | {cfr.get('rate', 0):.1f}% | {badge(cfr.get('level','Unknown'))} |{t_cfr} |",
        "",
        "---",
        "",
        "## 세부 지표",
        "",
        "### 🚀 배포 빈도 (Deployment Frequency)",
        "",
        f"- **총 배포 횟수**: {df.get('total', 0)}회",
        f"- **일 평균**: {df.get('per_day', 0):.3f}회/일",
        f"- **주 평균**: {df.get('per_week', 0):.2f}회/주",
        f"- **데이터 출처**: `{df.get('source', 'deployments')}`",
        f"- **DORA 등급**: {badge(df.get('level','Unknown'))}",
        "",
        "### ⏱ 변경 리드타임 (Lead Time for Changes)",
        "",
        f"- **평균**: {fmt_hours(lt.get('average_hours', 0))}",
        f"- **중앙값**: {fmt_hours(lt.get('median_hours', 0))}",
        f"- **측정 PR 수**: {lt.get('samples', 0)}개",
        f"- **DORA 등급**: {badge(lt.get('level','Unknown'))}",
        "",
        "### 🔧 평균 복구 시간 (MTTR)",
        "",
        f"- **평균 복구 시간**: {fmt_hours(mttr.get('average_hours', 0))}",
        f"- **인시던트 수**: {mttr.get('samples', 0)}개",
        f"- **DORA 등급**: {badge(mttr.get('level','Unknown'))}",
        f"- **인시던트 라벨**: `incident`, `hotfix`, `rollback`",
        "",
        "### ❌ 변경 실패율 (Change Failure Rate)",
        "",
        f"- **실패율**: {cfr.get('rate', 0):.1f}%",
        f"- **실패 배포**: {cfr.get('failed', 0)}회 / 전체 {cfr.get('total', 0)}회",
        f"- **DORA 등급**: {badge(cfr.get('level','Unknown'))}",
        "",
        "---",
        "",
        "## DORA 등급 기준표",
        "",
        "| 등급 | 배포 빈도 | 리드타임 | MTTR | 변경 실패율 |",
        "|------|-----------|----------|------|------------|",
        "| 🟢 **Elite** | ≥ 1회/일 | < 1시간 | < 1시간 | ≤ 5% |",
        "| 🔵 **High**  | ≥ 1회/주 | < 1일   | < 1일   | ≤ 10% |",
        "| 🟡 **Medium**| ≥ 1회/월 | < 1주   | < 1주   | ≤ 15% |",
        "| 🔴 **Low**   | < 1회/월 | ≥ 1주   | ≥ 1주   | > 15% |",
        "",
        "---",
        "",
        f"*자동 생성: GitHub Actions · {snapshot.get('collected_at', '')}*",
    ]
    return "\n".join(lines)

# ── 메인 ───────────────────────────────────────────────────────────────────────

def main() -> None:
    metrics_path = Path("data/metrics.json")
    if not metrics_path.exists():
        print("ERROR: data/metrics.json 이 없습니다. collect_dora_metrics.py 를 먼저 실행하세요.")
        return

    history = json.loads(metrics_path.read_text(encoding="utf-8"))
    if isinstance(history, dict):
        history = [history]
    if not history:
        print("No metrics data found in data/metrics.json.")
        return

    latest    = history[-1]
    report_md = generate_report(latest, history)

    reports_dir = Path("reports")
    reports_dir.mkdir(exist_ok=True)

    date_str = (latest.get("collected_at") or datetime.now(timezone.utc).isoformat())[:10]

    # 날짜별 보고서
    dated_path = reports_dir / f"weekly-report-{date_str}.md"
    dated_path.write_text(report_md, encoding="utf-8")
    print(f"[Report] 저장 → {dated_path}")

    # 최신 보고서 (항상 덮어쓰기)
    latest_path = reports_dir / "latest-report.md"
    latest_path.write_text(report_md, encoding="utf-8")
    print(f"[Report] 업데이트 → {latest_path}")


if __name__ == "__main__":
    main()
