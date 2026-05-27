# Week10: 배포 자동화 과제

이 폴더는 AWS 없이도 제출 가능한 형태로 정리한 과제 패키지입니다.

핵심 범위
- GitHub Pages 또는 Vercel/Netlify 기반 프런트엔드 자동 배포
- PR 프리뷰 환경 구성
- Docker 기반 배포 파이프라인 전략

구성요소
- `frontend/` : 예제 정적 사이트(배포 대상)
- `docs/` : 제출용 배포 전략 문서
- `aws/` : AWS 예제 파일(선택 사항, 필요 시 참고)

제출 포인트
- `docs/frontend-pr-preview.md`
- `docs/docker-strategy.md`
- `docs/submission-guide.md`

현재 상태
- GitHub Pages 배포 워크플로와 PR 프리뷰 템플릿이 존재합니다.
- Docker 배포 파이프라인 전략 문서가 포함되어 있습니다.
- Vercel/Netlify를 쓸 경우 대체 방안도 문서에 포함했습니다.

다음 단계
1. GitHub Pages를 쓸 경우 `gh-pages` 브랜치 소스를 설정하세요.
2. Vercel/Netlify를 쓸 경우 해당 플랫폼 토큰으로 PR 프리뷰를 연결하세요.
3. 원하시면 `aws/` 폴더는 그대로 두고 제출에는 `docs/`만 사용해도 됩니다.
