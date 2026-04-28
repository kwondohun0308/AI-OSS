# 4주차 과제 - PR 협업 워크플로

이 폴더는 Feature 브랜치 전략과 Conventional Commits를 기준으로 PR 협업 규칙을 정리한 4주차 과제 산출물입니다.

## 목표
- Feature 브랜치에서 작업하고, Conventional Commits로 변경 이력을 남긴다.
- PR 템플릿, CODEOWNERS, 브랜치 보호 규칙, 리뷰 가이드를 정리한다.
- [MUST]/[SHOULD] 태그를 사용해 구조화된 리뷰 피드백 기준을 만든다.

## 포함 문서
- `CONTRIBUTING.md`: 브랜치/커밋/PR 협업 규칙
- `docs/review-guide.md`: 리뷰 작성 기준과 예시
- `docs/branch-protection.md`: GitHub 브랜치 보호 규칙 권장안
- `.github/pull_request_template.md`: PR 작성 템플릿
- `.github/CODEOWNERS`: 코드/문서 기본 오너 설정

## 작업 기준
1. `feature/` 접두어 브랜치에서 작업한다.
2. 커밋 메시지는 `type(scope): subject` 형식으로 작성한다.
3. PR 본문에는 변경 요약, 검증 방법, 리뷰 포인트를 포함한다.
4. 리뷰 코멘트는 `[MUST]` 또는 `[SHOULD]` 태그로 시작한다.

## 생성형 AI 사용 고지
이 문서는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.