# Branch Protection Rules

이 문서는 GitHub 저장소에서 적용할 브랜치 보호 규칙의 권장값을 정리합니다.

## 대상 브랜치
- `main`

## 권장 설정
- Require a pull request before merging: enabled
- Require approvals: 1명 이상
- Require review from Code Owners: enabled
- Dismiss stale approvals when new commits are pushed: enabled
- Require status checks to pass before merging: enabled
- Require linear history: enabled
- Restrict who can push to matching branches: enabled
- Allow force pushes: disabled
- Allow deletions: disabled

## 협업 의도
- 직접 푸시보다 PR 리뷰를 기본 경로로 만든다.
- CODEOWNERS와 승인 요구를 통해 책임 범위를 명확하게 한다.
- 상태 검사와 선형 히스토리로 제출 품질을 유지한다.

## 생성형 AI 사용 고지
이 문서는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.