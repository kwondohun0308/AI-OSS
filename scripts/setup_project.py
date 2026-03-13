#!/usr/bin/env python3
"""
GitHub Project Setup Script
==============================
라벨 / 마일스톤 / 이슈 / GitHub Projects v2 (칸반 보드)를 일괄 생성합니다.

사용법:
    Windows:  set GITHUB_TOKEN=ghp_...  &&  python scripts/setup_project.py
    Mac/Linux: GITHUB_TOKEN=ghp_... python scripts/setup_project.py

필요 권한: repo, project (classic or beta)
"""
import json
import os
import sys
import time
import requests

# ── 환경 설정 ──────────────────────────────────────────────────────────────────
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO         = os.environ.get("REPO", "kwondohun0308/AI-OSS")
BASE         = "https://api.github.com"
GQL_URL      = "https://api.github.com/graphql"

REST_HEADERS = {
    "Authorization":        f"Bearer {GITHUB_TOKEN}",
    "Accept":               "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}
GQL_HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Content-Type":  "application/json",
}

# ── 라벨 정의 ──────────────────────────────────────────────────────────────────
LABELS = [
    # 타입
    {"name": "type:bug",          "color": "d73a4a", "description": "버그 수정"},
    {"name": "type:feature",      "color": "0075ca", "description": "새 기능 추가"},
    {"name": "type:enhancement",  "color": "a2eeef", "description": "기존 기능 개선"},
    {"name": "type:docs",         "color": "e4e669", "description": "문서화"},
    {"name": "type:chore",        "color": "ededed", "description": "유지보수/설정"},
    # 우선순위
    {"name": "priority:critical", "color": "b60205", "description": "즉시 처리 필요"},
    {"name": "priority:high",     "color": "d93f0b", "description": "높은 우선순위"},
    {"name": "priority:medium",   "color": "e4e669", "description": "보통 우선순위"},
    {"name": "priority:low",      "color": "0e8a16", "description": "낮은 우선순위"},
    # 상태 (칸반 보드와 동기화)
    {"name": "status:backlog",     "color": "c5def5", "description": "미할당 백로그"},
    {"name": "status:todo",        "color": "bfd4f2", "description": "이번 스프린트 예정"},
    {"name": "status:in-progress", "color": "fef2c0", "description": "현재 진행 중"},
    {"name": "status:review",      "color": "d4c5f9", "description": "리뷰/테스트 중"},
    {"name": "status:done",        "color": "cae8ca", "description": "완료"},
    # 컴포넌트
    {"name": "component:frontend", "color": "1d76db", "description": "Streamlit UI"},
    {"name": "component:backend",  "color": "0052cc", "description": "Python 백엔드"},
    {"name": "component:data",     "color": "5319e7", "description": "데이터 파이프라인"},
    {"name": "component:infra",    "color": "fbca04", "description": "Docker/인프라"},
    # 스프린트
    {"name": "sprint:1", "color": "f9d0c4", "description": "Sprint 1 (W1~W8)"},
    {"name": "sprint:2", "color": "ffddd2", "description": "Sprint 2 (W9~W16)"},
]

# ── 마일스톤 정의 ──────────────────────────────────────────────────────────────
MILESTONES = [
    {
        "title":       "Sprint 1 — W1~W8 민원 검색 MVP",
        "description": "크롤러 구축, FAISS 검색 MVP, Streamlit UI 기초 구현",
        "due_on":      "2026-05-08T00:00:00Z",
    },
    {
        "title":       "Sprint 2 — W9~W16 LLM 고도화 및 배포",
        "description": "sLLM 답변 생성, 모델 최적화, Docker 배포 패키지",
        "due_on":      "2026-07-03T00:00:00Z",
    },
]

# ── 이슈 정의 (12개) ───────────────────────────────────────────────────────────
ISSUES = [
    # ── Sprint 1 ────────────────────────────────────────────────────────────
    {
        "title": "[Feature] 개발 환경 세팅 및 Docker 기반 초기 구성",
        "body": (
            "## 목표\nDocker Compose 기반 개발 환경을 구성하고 GitHub CI 파이프라인을 연결합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] Docker Compose 작성 (Python + PostgreSQL + FAISS)\n"
            "- [ ] `.env.example` 작성\n"
            "- [ ] GitHub Actions CI 기본 설정\n"
            "- [ ] README 개발 환경 섹션 작성"
        ),
        "labels":         ["type:feature", "priority:high",   "sprint:1", "component:infra",    "status:todo"],
        "milestone_index": 0,
        "initial_status":  "To Do",
    },
    {
        "title": "[Feature] 민원 데이터 수집 크롤러 구현",
        "body": (
            "## 목표\n공공기관 민원 Q&A 데이터를 수집하는 크롤러를 구현합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] 대상 사이트 URL 목록 정의\n"
            "- [ ] requests + BeautifulSoup 기반 크롤러 작성\n"
            "- [ ] 수집 결과 JSON/CSV 저장\n"
            "- [ ] 크롤링 스케줄러 설정"
        ),
        "labels":         ["type:feature", "priority:high",   "sprint:1", "component:data",     "status:in-progress"],
        "milestone_index": 0,
        "initial_status":  "In Progress",
    },
    {
        "title": "[Feature] 텍스트 비식별화 파이프라인 구현",
        "body": (
            "## 목표\n수집된 민원 데이터에서 개인정보를 비식별화합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] 이름/전화번호/주민번호 패턴 정규식 정의\n"
            "- [ ] NER 기반 개인정보 감지 모듈 구현\n"
            "- [ ] 비식별화 결과 검증 테스트 작성"
        ),
        "labels":         ["type:feature", "priority:high",   "sprint:1", "component:data",     "status:backlog"],
        "milestone_index": 0,
        "initial_status":  "Backlog",
    },
    {
        "title": "[Feature] FAISS 벡터 인덱스 빌드 및 유사 민원 검색 MVP",
        "body": (
            "## 목표\nFAISS를 사용하여 의미 기반 유사 민원 검색 MVP를 구현합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] 임베딩 모델 선택 (sentence-transformers)\n"
            "- [ ] FAISS 인덱스 빌드 스크립트 작성\n"
            "- [ ] Top-K 유사 민원 검색 API 구현\n"
            "- [ ] 검색 정확도 평가 (Precision@K)"
        ),
        "labels":         ["type:feature", "priority:high",   "sprint:1", "component:backend",  "status:backlog"],
        "milestone_index": 0,
        "initial_status":  "Backlog",
    },
    {
        "title": "[Feature] Streamlit 기반 UI 기초 구현",
        "body": (
            "## 목표\n담당자가 민원 요지를 입력하고 유사 사례를 조회하는 기초 UI를 구현합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] Streamlit 레이아웃 설계\n"
            "- [ ] 민원 입력 폼 구현\n"
            "- [ ] 유사 민원 결과 표시 컴포넌트\n"
            "- [ ] 페이지 라우팅 설정"
        ),
        "labels":         ["type:feature", "priority:medium", "sprint:1", "component:frontend", "status:backlog"],
        "milestone_index": 0,
        "initial_status":  "Backlog",
    },
    {
        "title": "[Bug] 크롤러 한글 인코딩 오류 수정",
        "body": (
            "## 문제\n"
            "EUC-KR 인코딩 사이트 크롤링 시 `UnicodeDecodeError` 발생.\n\n"
            "## 재현 방법\n"
            "1. EUC-KR 인코딩 공공기관 사이트 크롤링 실행\n"
            "2. `UnicodeDecodeError: 'utf-8' codec can't decode byte` 에러 발생\n\n"
            "## 기대 동작\n모든 인코딩의 페이지를 정상적으로 파싱\n\n"
            "## 수정 방법\n`chardet` 라이브러리로 인코딩 자동 감지 후 디코딩"
        ),
        "labels":         ["type:bug",     "priority:high",   "sprint:1", "component:data",     "status:backlog"],
        "milestone_index": 0,
        "initial_status":  "Backlog",
    },
    # ── Sprint 2 ────────────────────────────────────────────────────────────
    {
        "title": "[Feature] sLLM 기반 답변 초안 자동 생성 MVP",
        "body": (
            "## 목표\nOllama 기반 sLLM을 사용하여 민원 답변 초안을 자동 생성합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] Ollama 연동 모듈 구현\n"
            "- [ ] 기본 프롬프트 설계\n"
            "- [ ] FastAPI 엔드포인트 구현\n"
            "- [ ] 답변 생성 MVP 테스트"
        ),
        "labels":         ["type:feature",     "priority:high",   "sprint:2", "component:backend",  "status:backlog"],
        "milestone_index": 1,
        "initial_status":  "Backlog",
    },
    {
        "title": "[Feature] 프롬프트 템플릿 고도화 (요지-근거-안내 구조)",
        "body": (
            "## 목표\n기관 양식에 맞는 구조화된 답변을 생성하는 프롬프트 템플릿을 고도화합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] 요지-근거-안내 구조 프롬프트 설계\n"
            "- [ ] Few-shot 예시 데이터셋 구축\n"
            "- [ ] A/B 프롬프트 비교 실험\n"
            "- [ ] 최종 템플릿 문서화"
        ),
        "labels":         ["type:enhancement", "priority:medium", "sprint:2", "component:backend",  "status:backlog"],
        "milestone_index": 1,
        "initial_status":  "Backlog",
    },
    {
        "title": "[Feature] ONNX/TensorRT 모델 최적화",
        "body": (
            "## 목표\n임베딩 모델을 ONNX로 변환하고 추론 속도를 개선합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] 임베딩 모델 ONNX 변환\n"
            "- [ ] ONNX Runtime 추론 파이프라인 구현\n"
            "- [ ] (선택) TensorRT 적용\n"
            "- [ ] 최적화 전후 벤치마크 비교"
        ),
        "labels":         ["type:enhancement", "priority:medium", "sprint:2", "component:backend",  "status:backlog"],
        "milestone_index": 1,
        "initial_status":  "Backlog",
    },
    {
        "title": "[Feature] 담당자 수정/복사 워크플로우 구현",
        "body": (
            "## 목표\n생성된 답변 초안을 담당자가 수정하고 복사할 수 있는 워크플로우를 구현합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] 인라인 편집 UI 구현\n"
            "- [ ] 클립보드 복사 기능\n"
            "- [ ] 수정 이력 저장 (PostgreSQL)\n"
            "- [ ] 최종 답변 내보내기 (DOCX)"
        ),
        "labels":         ["type:feature",     "priority:medium", "sprint:2", "component:frontend", "status:backlog"],
        "milestone_index": 1,
        "initial_status":  "Backlog",
    },
    {
        "title": "[Feature] 접근권한 분리 및 감사 로그 시스템",
        "body": (
            "## 목표\n담당자 역할별 접근권한을 분리하고 운영 감사 로그를 구현합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] 역할 정의 (admin / operator / viewer)\n"
            "- [ ] JWT 기반 인증 구현\n"
            "- [ ] 감사 로그 스키마 설계 (PostgreSQL)\n"
            "- [ ] 로그 조회 UI 구현"
        ),
        "labels":         ["type:feature",     "priority:high",   "sprint:2", "component:backend",  "status:backlog"],
        "milestone_index": 1,
        "initial_status":  "Backlog",
    },
    {
        "title": "[Feature] Docker 배포 패키지 마감 및 운영 문서화",
        "body": (
            "## 목표\n폐쇄망 환경에서 배포 가능한 Docker 패키지를 완성하고 운영 문서를 작성합니다.\n\n"
            "## 작업 항목\n"
            "- [ ] 멀티 스테이지 Dockerfile 최적화\n"
            "- [ ] docker-compose.prod.yml 작성\n"
            "- [ ] 오프라인 이미지 패키징 스크립트\n"
            "- [ ] 운영 매뉴얼 작성 (설치/백업/복구)"
        ),
        "labels":         ["type:feature",     "priority:high",   "sprint:2", "component:infra",    "status:backlog"],
        "milestone_index": 1,
        "initial_status":  "Backlog",
    },
]

# ── REST API 헬퍼 ──────────────────────────────────────────────────────────────

def rest(method: str, path: str, **kwargs):
    url  = f"{BASE}{path}" if path.startswith("/") else path
    resp = requests.request(method, url, headers=REST_HEADERS, timeout=30, **kwargs)
    if resp.status_code in (422,):
        return resp   # 처리는 호출 측에서
    resp.raise_for_status()
    return resp


def gql(query: str, variables: dict | None = None) -> dict:
    payload = {"query": query, "variables": variables or {}}
    resp    = requests.post(GQL_URL, headers=GQL_HEADERS, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if "errors" in data:
        raise RuntimeError(f"GraphQL errors: {data['errors']}")
    return data.get("data", {})

# ── 1. 라벨 생성 ───────────────────────────────────────────────────────────────

def create_labels() -> None:
    print("\n[1/5] 라벨 생성 중...")
    existing = {lb["name"] for lb in rest("GET", f"/repos/{REPO}/labels?per_page=100").json()}
    created = skipped = 0
    for lb in LABELS:
        if lb["name"] in existing:
            skipped += 1
            continue
        resp = rest("POST", f"/repos/{REPO}/labels", json=lb)
        if resp.status_code == 422:
            skipped += 1
        else:
            print(f"  + {lb['name']}")
            created += 1
        time.sleep(0.3)
    print(f"  → 생성 {created}개, 스킵 {skipped}개")

# ── 2. 마일스톤 생성 ───────────────────────────────────────────────────────────

def create_milestones() -> list[int]:
    """마일스톤을 생성하고 번호 리스트 반환."""
    print("\n[2/5] 마일스톤 생성 중...")
    existing = {m["title"]: m["number"]
                for m in rest("GET", f"/repos/{REPO}/milestones?state=all&per_page=50").json()}
    numbers: list[int] = []
    for ms in MILESTONES:
        if ms["title"] in existing:
            n = existing[ms["title"]]
            print(f"  ↩ 이미 존재: '{ms['title']}' (#{n})")
            numbers.append(n)
            continue
        r = rest("POST", f"/repos/{REPO}/milestones", json=ms).json()
        print(f"  + 마일스톤 #{r['number']}: {ms['title']}")
        numbers.append(r["number"])
        time.sleep(0.3)
    return numbers

# ── 3. 이슈 생성 ───────────────────────────────────────────────────────────────

def create_issues(milestone_numbers: list[int]) -> list[dict]:
    """이슈를 생성하고 {number, node_id, initial_status} 리스트 반환."""
    print("\n[3/5] 이슈 생성 중...")
    # 기존 이슈 제목 목록 (중복 방지)
    existing_titles: set[str] = set()
    page = 1
    while True:
        batch = rest("GET", f"/repos/{REPO}/issues?state=all&per_page=100&page={page}").json()
        if not batch:
            break
        for iss in batch:
            existing_titles.add(iss["title"])
        page += 1

    created_issues: list[dict] = []
    for issue in ISSUES:
        if issue["title"] in existing_titles:
            print(f"  ↩ 이미 존재: {issue['title']}")
            # node_id를 못 가져오므로 프로젝트 추가는 스킵
            continue
        ms_num = milestone_numbers[issue["milestone_index"]]
        payload = {
            "title":     issue["title"],
            "body":      issue["body"],
            "labels":    issue["labels"],
            "milestone": ms_num,
        }
        r = rest("POST", f"/repos/{REPO}/issues", json=payload).json()
        print(f"  + #{r['number']}: {issue['title']}")
        created_issues.append({
            "number":         r["number"],
            "node_id":        r["node_id"],
            "initial_status": issue["initial_status"],
        })
        time.sleep(0.5)   # 연속 요청 속도 제한 방지
    return created_issues

# ── 4. GitHub Project v2 생성 ─────────────────────────────────────────────────

def get_user_node_id(login: str) -> str:
    data = gql("query($login:String!){user(login:$login){id}}", {"login": login})
    return data["user"]["id"]


def get_repo_node_id() -> str:
    owner, name = REPO.split("/")
    return rest("GET", f"/repos/{REPO}").json()["node_id"]


def create_project(owner_id: str, title: str) -> dict:
    mutation = """
    mutation($ownerId:ID!, $title:String!) {
      createProjectV2(input:{ownerId:$ownerId, title:$title}) {
        projectV2 { id number url }
      }
    }"""
    data = gql(mutation, {"ownerId": owner_id, "title": title})
    return data["createProjectV2"]["projectV2"]


def link_repo(project_id: str, repo_id: str) -> None:
    mutation = """
    mutation($projectId:ID!, $repositoryId:ID!) {
      linkProjectV2ToRepository(input:{projectId:$projectId, repositoryId:$repositoryId}) {
        repository { name }
      }
    }"""
    gql(mutation, {"projectId": project_id, "repositoryId": repo_id})


def create_sprint_status_field(project_id: str) -> dict:
    """5단계 칸반 상태 필드 생성 → {field_id, options: {name: id}}"""
    mutation = """
    mutation($projectId:ID!) {
      createProjectV2Field(input:{
        projectId: $projectId,
        dataType: SINGLE_SELECT,
        name: "Sprint Status",
        singleSelectOptions: [
          {name:"Backlog",     color:GRAY,   description:"미할당 백로그"},
          {name:"To Do",       color:BLUE,   description:"이번 스프린트 예정"},
          {name:"In Progress", color:YELLOW, description:"현재 진행 중"},
          {name:"Review",      color:PURPLE, description:"리뷰/테스트 중"},
          {name:"Done",        color:GREEN,  description:"완료"}
        ]
      }){
        projectV2Field {
          ... on ProjectV2SingleSelectField {
            id name
            options { id name }
          }
        }
      }
    }"""
    data    = gql(mutation, {"projectId": project_id})
    field   = data["createProjectV2Field"]["projectV2Field"]
    options = {opt["name"]: opt["id"] for opt in field["options"]}
    return {"field_id": field["id"], "options": options}


def add_issue_to_project(project_id: str, issue_node_id: str) -> str:
    mutation = """
    mutation($projectId:ID!, $contentId:ID!) {
      addProjectV2ItemById(input:{projectId:$projectId, contentId:$contentId}) {
        item { id }
      }
    }"""
    data = gql(mutation, {"projectId": project_id, "contentId": issue_node_id})
    return data["addProjectV2ItemById"]["item"]["id"]


def set_item_status(project_id: str, item_id: str, field_id: str, option_id: str) -> None:
    mutation = """
    mutation($projectId:ID!, $itemId:ID!, $fieldId:ID!, $optionId:String!) {
      updateProjectV2ItemFieldValue(input:{
        projectId:$projectId, itemId:$itemId, fieldId:$fieldId,
        value:{singleSelectOptionId:$optionId}
      }){ projectV2Item { id } }
    }"""
    gql(mutation, {
        "projectId": project_id, "itemId": item_id,
        "fieldId": field_id, "optionId": option_id,
    })


def setup_project(created_issues: list[dict]) -> None:
    print("\n[4/5] GitHub Project v2 생성 중...")
    owner      = REPO.split("/")[0]
    owner_id   = get_user_node_id(owner)
    repo_id    = get_repo_node_id()
    project    = create_project(owner_id, "민원한눈 — 스프린트 칸반 보드")
    print(f"  + 프로젝트 생성됨: {project['url']}")
    link_repo(project["id"], repo_id)
    print("  + 리포지토리 연결 완료")
    field_info = create_sprint_status_field(project["id"])
    print(f"  + 'Sprint Status' 필드 생성 (5단계 칸반)")

    print("\n[5/5] 이슈 → 프로젝트 추가 및 초기 상태 설정 중...")
    for iss in created_issues:
        try:
            item_id   = add_issue_to_project(project["id"], iss["node_id"])
            option_id = field_info["options"].get(iss["initial_status"])
            if option_id:
                set_item_status(project["id"], item_id, field_info["field_id"], option_id)
            print(f"  + #{iss['number']} → {iss['initial_status']}")
            time.sleep(0.4)
        except Exception as e:
            print(f"  ! #{iss['number']} 추가 실패: {e}")
    print(f"\n  ✅ 칸반 보드: {project['url']}")

# ── 메인 ───────────────────────────────────────────────────────────────────────

def main() -> None:
    if not GITHUB_TOKEN:
        print("ERROR: GITHUB_TOKEN 이 설정되지 않았습니다.", file=sys.stderr)
        sys.exit(1)
    print(f"=== GitHub Project Setup: {REPO} ===")

    create_labels()
    milestone_numbers = create_milestones()
    created_issues    = create_issues(milestone_numbers)

    if created_issues:
        setup_project(created_issues)
    else:
        print("\n[!] 새로 생성된 이슈가 없어 프로젝트 보드 자동 추가를 건너뜁니다.")
        print("    이슈가 이미 존재하면 GitHub UI에서 직접 프로젝트에 추가하세요.")

    print("\n=== 완료 ===")
    print(f"라벨: https://github.com/{REPO}/labels")
    print(f"마일스톤: https://github.com/{REPO}/milestones")
    print(f"이슈: https://github.com/{REPO}/issues")
    print(f"프로젝트: https://github.com/{REPO.split('/')[0]}")


if __name__ == "__main__":
    main()
