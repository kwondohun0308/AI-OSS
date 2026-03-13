#!/usr/bin/env python3
"""
Sprint Metrics Collection
==========================
GitHub Issues API로 스프린트 지표를 수집합니다.
  - Velocity     : 스프린트별 완료 이슈 수
  - Cycle Time   : 이슈 생성 → 종료까지 소요 시간 (시간 단위)
  - Burndown     : 스프린트 기간 내 일별 잔여 이슈 수
결과는 data/sprint-metrics.json 에 저장됩니다.
"""
import json
import os
import sys
from datetime import datetime, timezone, timedelta, date
from pathlib import Path

import requests
from dateutil import parser as dateparser

# ── 환경 설정 ──────────────────────────────────────────────────────────────────
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO         = os.environ.get("REPO", "kwondohun0308/AI-OSS")
BASE         = "https://api.github.com"
HEADERS      = {
    "Authorization":        f"Bearer {GITHUB_TOKEN}",
    "Accept":               "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

# ── REST 헬퍼 ──────────────────────────────────────────────────────────────────

def gh_get(path: str, params: dict | None = None) -> list | dict:
    url    = f"{BASE}{path}" if path.startswith("/") else path
    params = dict(params or {})
    params.setdefault("per_page", 100)
    results: list = []
    while url:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, list):
            results.extend(data)
        else:
            return data
        url    = resp.links.get("next", {}).get("url")
        params = {}
    return results


def parse_dt(s: str | None) -> datetime | None:
    return dateparser.parse(s) if s else None

# ── 마일스톤 목록 조회 ─────────────────────────────────────────────────────────

def get_milestones() -> list[dict]:
    return gh_get(f"/repos/{REPO}/milestones", {"state": "all", "per_page": 50})

# ── 마일스톤별 이슈 조회 ───────────────────────────────────────────────────────

def get_issues_for_milestone(milestone_number: int) -> list[dict]:
    return gh_get(f"/repos/{REPO}/issues", {
        "milestone": milestone_number,
        "state":     "all",
        "per_page":  100,
    })

# ── Cycle Time 계산 ────────────────────────────────────────────────────────────

def calc_cycle_time(issues: list[dict]) -> list[float]:
    """종료된 이슈의 사이클 타임(시간) 리스트를 반환."""
    times: list[float] = []
    for iss in issues:
        if iss.get("state") != "closed":
            continue
        created  = parse_dt(iss.get("created_at"))
        closed   = parse_dt(iss.get("closed_at"))
        if created and closed:
            h = (closed - created).total_seconds() / 3600
            if h >= 0:
                times.append(round(h, 2))
    return times

# ── Burndown 데이터 생성 ───────────────────────────────────────────────────────

def build_burndown(issues: list[dict], start: date, end: date) -> list[dict]:
    """
    start ~ end 날짜 범위에서 일별 잔여 이슈 수를 반환.
    미래 날짜는 이상적인 번다운 선(선형)만 포함.
    """
    total    = len(issues)
    today    = datetime.now(timezone.utc).date()
    end_clip = min(end, today)  # 미래는 실제 데이터 없음

    burndown: list[dict] = []
    delta = (end - start).days or 1

    current = start
    while current <= end:
        # 실제 잔여 (오늘 이전 날짜만)
        if current <= end_clip:
            remaining = sum(
                1 for iss in issues
                if (parse_dt(iss.get("created_at")) or datetime.min.replace(tzinfo=timezone.utc)).date() <= current
                and (iss.get("state") != "closed" or
                     (parse_dt(iss.get("closed_at")) or datetime.max.replace(tzinfo=timezone.utc)).date() > current)
            )
            entry = {"date": current.isoformat(), "actual": remaining}
        else:
            entry = {"date": current.isoformat(), "actual": None}  # 미래

        # 이상적 번다운 (선형 감소)
        days_elapsed = (current - start).days
        ideal        = round(total * (1 - days_elapsed / delta))
        entry["ideal"] = max(0, ideal)
        burndown.append(entry)
        current += timedelta(days=1)
    return burndown

# ── 스프린트 지표 집계 ─────────────────────────────────────────────────────────

def collect_sprint(ms: dict) -> dict:
    ms_num  = ms["number"]
    issues  = get_issues_for_milestone(ms_num)
    closed  = [i for i in issues if i.get("state") == "closed"]
    cycle_t = calc_cycle_time(issues)

    # 스프린트 날짜 범위
    now      = datetime.now(timezone.utc)
    due_dt   = parse_dt(ms.get("due_on")) or (now + timedelta(weeks=8))
    # created_at으로 시작일 추정 (이슈 최초 생성일)
    created_dates = [parse_dt(i["created_at"]) for i in issues if i.get("created_at")]
    start_dt = min(created_dates) if created_dates else now - timedelta(weeks=8)
    start    = start_dt.date()
    end      = due_dt.date()

    burndown = build_burndown(issues, start, end)

    # 라벨 분포
    label_dist: dict[str, int] = {}
    for iss in issues:
        for lbl in iss.get("labels", []):
            name = lbl["name"]
            label_dist[name] = label_dist.get(name, 0) + 1

    avg_ct = round(sum(cycle_t) / len(cycle_t), 2) if cycle_t else None
    return {
        "name":              ms["title"],
        "milestone_number":  ms_num,
        "state":             ms["state"],
        "start_date":        start.isoformat(),
        "due_date":          end.isoformat(),
        "total_issues":      len(issues),
        "closed_issues":     len(closed),
        "open_issues":       len(issues) - len(closed),
        "velocity":          len(closed),
        "completion_rate":   round(len(closed) / len(issues) * 100, 1) if issues else 0,
        "avg_cycle_time_h":  avg_ct,
        "cycle_times_h":     cycle_t,
        "label_distribution": label_dist,
        "burndown":          burndown,
    }

# ── 보고서 생성 ────────────────────────────────────────────────────────────────

def generate_report(data: dict) -> str:
    now_str  = data["collected_at"][:10]
    sprints  = data["sprints"]
    lines    = [
        f"# 📋 Sprint 보고서 — {now_str}", "",
        "---", "",
    ]
    for sp in sprints:
        state_icon = "🏁" if sp["state"] == "closed" else "🔄"
        cycle_time_text = f"{sp['avg_cycle_time_h']:.1f}h" if sp["avg_cycle_time_h"] is not None else "N/A"
        lines += [
            f"## {state_icon} {sp['name']}",
            "",
            f"| 지표 | 값 |",
            f"|------|-----|",
            f"| 총 이슈 | {sp['total_issues']}개 |",
            f"| 완료 이슈 (Velocity) | {sp['velocity']}개 |",
            f"| 완료율 | {sp['completion_rate']}% |",
            f"| 평균 사이클 타임 | {cycle_time_text} |",
            f"| 기간 | {sp['start_date']} ~ {sp['due_date']} |",
            "",
        ]
    lines += ["---", "", f"*자동 생성: GitHub Actions · {now_str}*"]
    return "\n".join(lines)

# ── 메인 ───────────────────────────────────────────────────────────────────────

def main() -> None:
    if not GITHUB_TOKEN:
        print("ERROR: GITHUB_TOKEN 이 설정되지 않았습니다.", file=sys.stderr)
        sys.exit(1)

    print(f"[Sprint] {REPO} 스프린트 지표 수집 중...")
    milestones = get_milestones()
    # "Sprint"가 포함된 마일스톤만 대상
    sprint_ms  = [m for m in milestones if "Sprint" in m.get("title", "")]
    if not sprint_ms:
        sprint_ms = milestones  # Sprint 라벨 없으면 전체

    sprints: list[dict] = []
    for ms in sprint_ms:
        print(f"  → {ms['title']} (#{ms['number']}) 수집 중...")
        sp = collect_sprint(ms)
        sprints.append(sp)
        print(f"     총 {sp['total_issues']}이슈 / 완료 {sp['velocity']}개 / 평균CT {sp['avg_cycle_time_h']}h")

    output = {
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "repo":         REPO,
        "sprints":      sprints,
        "overall": {
            "total_issues":    sum(s["total_issues"] for s in sprints),
            "closed_issues":   sum(s["closed_issues"] for s in sprints),
            "total_velocity":  sum(s["velocity"] for s in sprints),
        },
    }

    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)
    path = data_dir / "sprint-metrics.json"
    path.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[Sprint] 저장 완료 → {path}")

    # Markdown 보고서
    reports_dir = Path("reports")
    reports_dir.mkdir(exist_ok=True)
    date_str    = output["collected_at"][:10]
    report_md   = generate_report(output)
    (reports_dir / f"sprint-report-{date_str}.md").write_text(report_md, encoding="utf-8")
    (reports_dir / "latest-sprint-report.md").write_text(report_md, encoding="utf-8")
    print(f"[Sprint] 보고서 → reports/sprint-report-{date_str}.md")


if __name__ == "__main__":
    main()
