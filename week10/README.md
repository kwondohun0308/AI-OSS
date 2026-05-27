# Week10: 배포 자동화 과제

이 폴더는 과제 요구사항(프런트엔드 자동 배포 + PR 프리뷰, Docker 기반 배포 파이프라인 설계, 클라우드 배포 자동화 및 헬스체크/모니터링)을 담고 있습니다.

구성요소
- `frontend/` : 예제 정적 사이트 (배포 대상)
- `docs/` : 배포/파이프라인 설계 문서
- `aws/` : AWS ECS 배포 예제(태스크 정의, 헬스체크 및 CloudWatch 알람 스크립트)

현재 상태
- GitHub Actions 워크플로(.github/workflows)로 기본 배포 템플릿을 추가해두었습니다 (`deploy-gh-pages.yml`, `deploy-aws-ecr-ecs.yml`).
- 이 `week10` 폴더에는 과제 설명서와 예제 파일들을 포함합니다.

다음 단계
1. 레포지토리 시크릿을 설정하세요 (AWS 키 등). 자세한 내용은 `docs/` 참고.
2. 원하시면 Netlify/Vercel 연동 워크플로로 대체해 드립니다.
