# Contributing Guide

이 저장소는 학습용 과제와 협업 규칙을 함께 정리하는 워크스페이스입니다. 작업 시 아래 규칙을 따릅니다.

## 브랜치 전략
- `main`: 배포 또는 제출 기준 브랜치
- `feature/*`: 기능, 문서, 과제 산출물 작업 브랜치
- `hotfix/*`: 제출 직전 긴급 수정 브랜치

## 커밋 규칙
Conventional Commits를 사용합니다.

- `feat`: 새 기능 또는 새 문서 구조 추가
- `fix`: 오류 수정
- `docs`: 문서만 변경
- `chore`: 설정, 메타 파일, 비기능 작업
- `refactor`: 동작 변화 없는 구조 개선

예시:
```text
docs(week4): add PR workflow guide
chore(github): add CODEOWNERS and PR template
feat(week4): document branch protection rules
```

## PR 규칙
- PR 제목은 변경 의도를 드러내는 명령형으로 작성합니다.
- PR 본문에는 변경 요약, 검증 결과, 관련 이슈/과제 맥락을 포함합니다.
- 리뷰가 필요한 변경은 Draft PR로 먼저 열 수 있습니다.
- 리뷰 코멘트는 `[MUST]`와 `[SHOULD]` 태그를 사용해 우선순위를 분리합니다.

## 체크리스트
- feature 브랜치에서 작업했는가
- 커밋 메시지가 Conventional Commits를 따르는가
- PR 템플릿을 채웠는가
- 검증 방법을 명시했는가
- 관련 문서와 README가 함께 갱신되었는가

## 생성형 AI 사용 고지
이 문서는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.