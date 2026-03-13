#!/usr/bin/env python3
"""
DORA Metrics Collection Script
================================
GitHub REST API를 통해 DORA 4대 지표를 수집하고
data/metrics.json에 누적 저장합니다.

지표:
  1. Deployment Frequency  - 배포 빈도 (회/주)
  2. Lead Time for Changes - 변경 리드타임 (시간)
  3. MTTR                  - 평균 복구 시간 (시간)
  4. Change Failure Rate   - 변경 실패율 (%)
"""
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
from dateutil import parser as dateparser

# ── 환경 변수 ──────────────────────────────────────────────────────────────────
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO         = os.environ.get("REPO", "")          # e.g. "owner/repo"
BASE         = "https://api.github.com"
HEADERS      = {
    "Authorization":        f"Bearer {GITHUB_TOKEN}",
    "Accept":               "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}
PERIOD_DAYS = 30   # 측정 기간 (일)

# ── 공통 헬퍼 ──────────────────────────────────────────────────────────────────

def gh_get(path: str, params: dict | None = None):
    """GitHub API 페이지네이션 처리 (항상 list 반환)."""
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
            return data          # 단일 객체 (페이지네이션 없음)
        url    = resp.links.get("next", {}).get("url")
        params = {}              # next URL에 이미 인코딩돼 있음
    return results


def parse_dt(s: str | None) -> datetime | None:
    return dateparser.parse(s) if s else None

# ── 데이터 수집 ────────────────────────────────────────────────────────────────

def fetch_deployments(since: datetime) -> list:
    """GitHub Deployments API에서 배포 이력 조회."""
    all_deploys: list = []
    # production 환경 우선, 없으면 전체
    for env in ("production", ""):
        params = {"environment": env} if env else {}
        deploys = gh_get(f"/repos/{REPO}/deployments", params)
        if deploys:
            all_deploys = deploys
            break
    return [d for d in all_deploys if (dt := parse_dt(d.get("created_at"))) and dt >= since]


def fetch_releases(since: datetime) -> list:
    """배포 이벤트가 없을 때 GitHub Releases를 대체 지표로 사용."""
    releases = gh_get(f"/repos/{REPO}/releases")
    return [r for r in releases if (dt := parse_dt(r.get("published_at"))) and dt >= since]


def fetch_pushes_to_main(since: datetime) -> list:
    """Releases/Deployments도 없을 때 main 브랜치 push를 최후 대체 지표로 사용."""
    commits = gh_get(f"/repos/{REPO}/commits", {"sha": "main", "since": since.isoformat()})
    return commits


def fetch_merged_prs(since: datetime) -> list:
    """기간 내 Merge된 PR 목록."""
    prs = gh_get(f"/repos/{REPO}/pulls", {
        "state":     "closed",
        "sort":      "updated",
        "direction": "desc",
    })
    return [
        pr for pr in prs
        if pr.get("merged_at") and (dt := parse_dt(pr["merged_at"])) and dt >= since
    ]


def fetch_pr_commits(pr_number: int) -> list:
    return gh_get(f"/repos/{REPO}/pulls/{pr_number}/commits")


def fetch_incidents(since: datetime) -> list:
    """'incident', 'hotfix', 'rollback' 라벨이 달린 종결 이슈 수집."""
    seen: set = set()
    result:  list = []
    for label in ("incident", "hotfix", "rollback"):
        issues = gh_get(f"/repos/{REPO}/issues", {
            "state":  "closed",
            "labels": label,
            "since":  since.isoformat(),
        })
        for issue in issues:
            if issue["id"] not in seen:
                seen.add(issue["id"])
                result.append(issue)
    return result


def fetch_deployment_statuses(deploy_id: int) -> list:
    return gh_get(f"/repos/{REPO}/deployments/{deploy_id}/statuses")

# ── DORA 등급 분류 ─────────────────────────────────────────────────────────────

_DORA_LEVELS = {
    "deployment_frequency": [
        ("Elite",  lambda v: v >= 1.0),     # ≥ 1회/일
        ("High",   lambda v: v >= 1 / 7),   # ≥ 1회/주
        ("Medium", lambda v: v >= 1 / 30),  # ≥ 1회/월
        ("Low",    lambda v: True),
    ],
    "lead_time": [
        ("Elite",  lambda v: v < 1),        # < 1시간
        ("High",   lambda v: v < 24),       # < 1일
        ("Medium", lambda v: v < 24 * 7),   # < 1주
        ("Low",    lambda v: True),
    ],
    "mttr": [
        ("Elite",  lambda v: v < 1),
        ("High",   lambda v: v < 24),
        ("Medium", lambda v: v < 24 * 7),
        ("Low",    lambda v: True),
    ],
    "cfr": [
        ("Elite",  lambda v: v <= 5),       # ≤ 5 %
        ("High",   lambda v: v <= 10),      # ≤ 10 %
        ("Medium", lambda v: v <= 15),      # ≤ 15 %
        ("Low",    lambda v: True),
    ],
}


def dora_level(metric: str, value: float) -> str:
    for name, test in _DORA_LEVELS[metric]:
        if test(value):
            return name
    return "Low"

# ── 지표 계산 ──────────────────────────────────────────────────────────────────

def calc_deployment_frequency(deploys: list, releases: list,
                               pushes: list, days: int) -> dict:
    # 우선순위: deployments > releases > pushes
    if deploys:
        events, source = deploys, "deployments"
    elif releases:
        events, source = releases, "releases"
    else:
        events, source = pushes, "commits_to_main"

    total   = len(events)
    per_day = total / days if days else 0.0
    return {
        "total":    total,
        "per_day":  round(per_day, 3),
        "per_week": round(per_day * 7, 2),
        "level":    dora_level("deployment_frequency", per_day),
        "source":   source,
    }


def calc_lead_time(prs: list) -> dict:
    hours_list: list = []
    for pr in prs:
        try:
            commits = fetch_pr_commits(pr["number"])
        except Exception:
            continue
        if not commits:
            continue
        dates = [parse_dt(c["commit"]["author"]["date"]) for c in commits]
        dates = [d for d in dates if d]
        if not dates:
            continue
        first  = min(dates)
        merged = parse_dt(pr["merged_at"])
        h = (merged - first).total_seconds() / 3600
        if h >= 0:
            hours_list.append(h)

    if not hours_list:
        return {"average_hours": 0, "median_hours": 0,
                "level": "Unknown", "samples": 0}

    avg    = sum(hours_list) / len(hours_list)
    s      = sorted(hours_list)
    n      = len(s)
    median = s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2
    return {
        "average_hours": round(avg, 2),
        "median_hours":  round(median, 2),
        "level":         dora_level("lead_time", avg),
        "samples":       n,
    }


def calc_mttr(incidents: list) -> dict:
    times: list = []
    for issue in incidents:
        c  = parse_dt(issue.get("created_at"))
        cl = parse_dt(issue.get("closed_at"))
        if c and cl:
            h = (cl - c).total_seconds() / 3600
            if h >= 0:
                times.append(h)

    if not times:
        return {"average_hours": 0, "level": "Unknown", "samples": 0}

    avg = sum(times) / len(times)
    return {
        "average_hours": round(avg, 2),
        "level":         dora_level("mttr", avg),
        "samples":       len(times),
    }


def calc_change_failure_rate(deploys: list, incidents: list) -> dict:
    total = len(deploys)
    if total == 0:
        return {"rate": 0.0, "failed": 0, "total": 0, "level": "Unknown"}

    # 배포 상태(failure/error) 먼저 확인
    failed = 0
    for d in deploys:
        try:
            statuses = fetch_deployment_statuses(d["id"])
            if any(s["state"] in ("failure", "error") for s in statuses):
                failed += 1
        except Exception:
            pass

    # 배포 실패 기록이 없으면 인시던트 수를 대체 지표로 사용
    if failed == 0 and incidents:
        failed = min(len(incidents), total)

    rate = round(failed / total * 100, 2)
    return {
        "rate":   rate,
        "failed": failed,
        "total":  total,
        "level":  dora_level("cfr", rate),
    }

# ── 메인 ───────────────────────────────────────────────────────────────────────

def main() -> None:
    if not GITHUB_TOKEN:
        print("ERROR: GITHUB_TOKEN 환경변수가 설정되지 않았습니다.", file=sys.stderr)
        sys.exit(1)
    if not REPO:
        print("ERROR: REPO 환경변수가 설정되지 않았습니다. (형식: owner/repo)", file=sys.stderr)
        sys.exit(1)

    now   = datetime.now(timezone.utc)
    since = now - timedelta(days=PERIOD_DAYS)
    print(f"[DORA] {REPO} — 수집 기간: {since.date()} ~ {now.date()}")

    print("[DORA] 배포 이벤트 조회 중...")
    deploys  = fetch_deployments(since)
    releases = fetch_releases(since) if not deploys else []
    pushes   = fetch_pushes_to_main(since) if not deploys and not releases else []
    print(f"       deployments={len(deploys)}, releases={len(releases)}, pushes={len(pushes)}")

    print("[DORA] 병합된 PR 조회 중...")
    prs = fetch_merged_prs(since)
    print(f"       merged PRs={len(prs)}")

    print("[DORA] 인시던트 이슈 조회 중...")
    incidents = fetch_incidents(since)
    print(f"       incidents={len(incidents)}")

    # ── 지표 계산 ──────────────────────────────────────────────────────────────
    df   = calc_deployment_frequency(deploys, releases, pushes, PERIOD_DAYS)
    lt   = calc_lead_time(prs)
    mttr = calc_mttr(incidents)
    cfr  = calc_change_failure_rate(deploys, incidents)

    snapshot = {
        "collected_at": now.isoformat(),
        "period": {
            "start": since.isoformat(),
            "end":   now.isoformat(),
            "days":  PERIOD_DAYS,
        },
        "deployment_frequency":  df,
        "lead_time_for_changes": lt,
        "mttr":                  mttr,
        "change_failure_rate":   cfr,
    }

    # ── 저장 ───────────────────────────────────────────────────────────────────
    data_dir     = Path("data")
    data_dir.mkdir(exist_ok=True)
    metrics_path = data_dir / "metrics.json"

    history: list = []
    if metrics_path.exists():
        try:
            existing = json.loads(metrics_path.read_text(encoding="utf-8"))
            history  = existing if isinstance(existing, list) else [existing]
        except json.JSONDecodeError:
            pass

    history.append(snapshot)
    history = history[-52:]      # 최근 52회 (약 1년치) 보관

    metrics_path.write_text(
        json.dumps(history, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"[DORA] 저장 완료 → {metrics_path}  (누적 {len(history)}개)")
    print(json.dumps(snapshot, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
