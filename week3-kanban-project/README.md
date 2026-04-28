# 3주차 과제 - Kanban 기반 GitHub Project

## 목표
GitHub Project를 칸반 보드로 구성하고, 상태 컬럼과 라벨/템플릿/마일스톤/이슈 백로그를 통해 스프린트 운영이 가능한 구조를 만든다.

## 프로젝트 보드
- 프로젝트명: AI-OSS Sprint Board
- 뷰: Kanban Board
- 상태 컬럼: Backlog, To Do, In Progress, Review, Done

## 라벨 체계
- `type: bug`
- `type: feature`
- `priority: high`
- `priority: medium`
- `priority: low`
- `status: blocked`
- `status: ready`

## 이슈 템플릿
- Bug: 재현 절차, 기대 결과, 실제 결과, 환경 정보 포함
- Feature: 목표, 수용 기준, 구현 힌트, 참고 자료 포함

## 마일스톤
- Sprint 1: 프로젝트 보드 세팅 및 핵심 백로그 정리
- Sprint 2: 분석 자동화 및 대시보드 고도화

## 백로그 이슈 10개
1. 프로젝트 보드 생성 및 칸반 뷰 설정
2. Backlog/To Do/In Progress/Review/Done 상태 컬럼 정비
3. Bug/Feature 이슈 템플릿 추가
4. 라벨 체계 생성 및 정리
5. Sprint 1 마일스톤 등록
6. Sprint 2 마일스톤 등록
7. Cycle Time 분석 문서 작성
8. Velocity 분석 문서 작성
9. Burndown 분석 문서 작성
10. Project 운영 README 및 제출용 체크리스트 정리

## Sprint 운영용 분석 초안
이 과제는 10개 이슈를 2개 마일스톤으로 나누어 운영한다고 가정한다.

### Cycle Time
- 10개 이슈의 평균 Cycle Time을 3.8일로 가정하면, 상태 전환 병목은 Review 구간에서 발생할 가능성이 높다.
- 개선 포인트: PR 크기를 줄이고 리뷰 시작 시점을 앞당긴다.

### Velocity
- Sprint 1: 13 points
- Sprint 2: 15 points
- 평균 Velocity: 14 points / sprint
- 해석: Sprint 2에서 마무리성 작업과 분석 문서화가 집중되며 처리 속도가 소폭 상승한다.

### Burndown
| Day | Planned Remaining | Actual Remaining |
| --- | --- | --- |
| Day 1 | 14 | 14 |
| Day 2 | 12 | 13 |
| Day 3 | 10 | 11 |
| Day 4 | 8 | 9 |
| Day 5 | 6 | 7 |
| Day 6 | 3 | 4 |
| Day 7 | 0 | 1 |

### 해석
- 계획 대비 실제 잔여 작업이 후반부에 한 칸씩 밀려 있어, 초반 착수율을 더 높여야 한다.
- Review 병목과 이슈 단위 과대화가 Burndown 지연의 주요 원인으로 보인다.

## 생성형 AI 사용 고지
이 문서는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.
