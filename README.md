# AI OSS 개발

## 1. 오리엔테이션
### 과제1. git push 실습

안녕하세요. 동아대학교 21학번 **권도훈**입니다.  
컴퓨터 언어, 코딩, 수학에 관심을 가지고 꾸준히 학습하고 있습니다.

---

## 👤 자기소개
- **이름**: 권도훈
- **소속**: 동아대학교 (21학번)
- **생년월일**: 2002.03.08
- **관심 분야**: 컴퓨터 언어, 코딩, 수학

---

## 🛠 기술 스택
- Python
- C
- C++
- HTML
- 그 외 다양한 프로그래밍 도구와 언어 학습 중

---

## 🎯 학습 목표
- 문제 해결 중심의 코딩 역량 강화
- 자료구조/알고리즘과 수학적 사고력을 결합한 개발 능력 향상
- Python, C/C++ 기반의 실전 프로젝트 경험 확대
- AI 및 오픈소스 생태계 활용 능력 강화
- 꾸준한 기록과 협업으로 성장 과정 포트폴리오화

---

## 📫 연락처
- **이메일**: kdh691610@gmail.com

---

## 📊 DORA Metrics Dashboard

> DORA 4대 DevOps 지표를 GitHub Actions로 자동 수집하고 주간 보고서를 생성합니다.

![DORA Metrics Dashboard](assets/dashboard-preview.svg)

| 지표 | 설명 | 수집 방법 |
|------|------|-----------|
| 🚀 **Deployment Frequency** | 배포 빈도 (회/주) | GitHub Deployments / Releases API |
| ⏱ **Lead Time for Changes** | 첫 커밋 → 배포까지 소요 시간 | PR 커밋 + 배포 타임스탬프 |
| 🔧 **MTTR** | 인시던트 발생 → 해결까지 평균 시간 | `incident` / `hotfix` 라벨 이슈 |
| ❌ **Change Failure Rate** | 배포 후 장애 발생 비율 | 배포 실패 상태 + 인시던트 이슈 |

### 자동화 구조

```
push to main / PR merge / 매일 자정
        │
        ▼
.github/workflows/dora-metrics.yml
        │  ① collect_dora_metrics.py  ─ GitHub API 호출
        │  ② generate_report.py       ─ Markdown 주간 보고서 생성
        │  ③ data/metrics.json        ─ JSON 아티팩트 커밋 & 업로드
        ▼
매주 월요일 09:00 UTC
        │
        ▼
.github/workflows/weekly-report.yml
        └─ reports/weekly-report-YYYY-MM-DD.md 자동 생성
```

### 파일 구조

```
.github/workflows/
  dora-metrics.yml         # 매일 + push 트리거 수집 워크플로우
  weekly-report.yml        # 매주 월요일 보고서 워크플로우
scripts/
  collect_dora_metrics.py  # DORA 지표 수집 스크립트
  generate_report.py       # 주간 보고서 생성 스크립트
  requirements.txt         # Python 의존성
dashboard/
  index.html               # Chart.js 인터랙티브 대시보드
data/
  metrics.json             # 누적 지표 JSON (자동 갱신)
reports/
  latest-report.md         # 최신 주간 보고서
  weekly-report-*.md       # 날짜별 보고서 아카이브
assets/
  dashboard-preview.svg    # 대시보드 미리보기 이미지
```

### 최신 보고서

👉 [reports/latest-report.md](reports/latest-report.md)

### DORA 등급 기준

| 등급 | 배포 빈도 | 리드타임 | MTTR | 변경 실패율 |
|------|-----------|----------|------|------------|
| 🟢 Elite  | ≥ 1회/일 | < 1시간 | < 1시간 | ≤ 5%  |
| 🔵 High   | ≥ 1회/주 | < 1일   | < 1일   | ≤ 10% |
| 🟡 Medium | ≥ 1회/월 | < 1주   | < 1주   | ≤ 15% |
| 🔴 Low    | < 1회/월 | ≥ 1주   | ≥ 1주   | > 15% |

---


