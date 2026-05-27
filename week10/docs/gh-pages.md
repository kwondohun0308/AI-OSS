# GitHub Pages 자동 배포 (설정 요약)

요구: 정적 파일을 `docs/` 또는 `frontend/`로 구성하고, `.github/workflows/deploy-gh-pages.yml`를 활성화합니다.

워크플로 작동 방식 (요약)
- `push` to `main` : `docs/` 내용을 `gh-pages` 브랜치에 강제 푸시하여 사이트를 업데이트합니다.
- `pull_request` : PR이 열리면 `gh-pages/pr-<num>/`에 복사하여 프리뷰 페이지를 생성하고 PR에 링크를 남깁니다.

프리뷰 URL 예시:
`https://<username>.github.io/<repo>/pr-<PR_NUMBER>/`

팁: 브랜치 보호 설정에서 `gh-pages`에 대한 제약이 있으면 Actions가 푸시하지 못할 수 있습니다. 이 경우 `GH_PAGES_TOKEN`을 만들어 사용하거나 관리자 설정을 조정하세요.
