# Netlify / Vercel 연동 (선택 사항)

Netlify 또는 Vercel을 사용하면 PR마다 자동으로 Preview 배포를 생성해주어 리뷰에 편리합니다.

Netlify 간단 설정
- Netlify 사이트를 생성하고 GitHub 리포지토리를 연결합니다.
- Netlify에 `NETLIFY_AUTH_TOKEN`을 생성하여 레포지토리 시크릿으로 추가하면, CI 워크플로에서 Netlify API를 호출해 수동 배포를 트리거할 수 있습니다.

Vercel 간단 설정
- Vercel 프로젝트를 생성하고 GitHub 연동. Vercel은 PR마다 Preview를 자동으로 생성합니다(앱 권한 필요).

원하면 이 리포지토리에 Netlify/GitHub Actions 연동 예제 워크플로를 추가해 드립니다.
