# 프런트엔드 자동 배포 및 PR 프리뷰

이 문서는 GitHub Pages 또는 Vercel/Netlify를 이용해 정적 프런트엔드를 자동 배포하고, PR마다 미리보기 환경을 구성하는 방법을 정리합니다.

권장 구성
- 정적 사이트: `week10/frontend/index.html`
- 배포 대상: GitHub Pages 또는 Vercel/Netlify
- PR 프리뷰: PR마다 별도 URL 또는 별도 경로를 생성

GitHub Pages 방식
- `main` 브랜치의 정적 파일을 `gh-pages` 브랜치로 배포
- PR이 열리면 `pr-<number>/` 경로로 프리뷰를 생성
- 장점: GitHub Actions와 바로 연결 가능

Vercel/Netlify 방식
- PR이 생성되면 플랫폼이 자동으로 Preview URL을 발급
- 장점: 별도 프리뷰 인프라를 직접 만들지 않아도 됨
- 단점: 플랫폼 토큰 또는 GitHub 연동 설정이 필요

예상 제출 문구
- "GitHub Pages 또는 Vercel/Netlify를 사용해 프런트엔드를 자동 배포하고 PR 프리뷰를 구성하였다."
