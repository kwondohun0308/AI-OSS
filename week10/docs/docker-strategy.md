# Docker 기반 배포 파이프라인 전략

이 문서는 Docker 기반 배포 파이프라인을 어떻게 설계할지 정리합니다.

권장 흐름
1. 소스 변경 감지: `main` 브랜치 push 또는 수동 실행
2. 이미지 빌드: GitHub Actions에서 `docker build` 실행
3. 이미지 검증: 컨테이너를 띄워 HTTP 헬스체크 수행
4. 레지스트리 푸시: GHCR 또는 ECR로 `sha`/`latest` 태그 푸시
5. 배포 환경 반영: ECS, Cloud Run, Kubernetes 중 하나에 반영
6. 모니터링: 헬스체크, 로그 수집, 알람 설정

핵심 설계 원칙
- 이미지 태그는 SHA 기반으로 추적 가능해야 한다.
- 배포 후 헬스체크에 실패하면 롤백 또는 재배포가 가능해야 한다.
- CI 단계에서 smoke test를 돌려 실제 런타임 이상을 조기에 찾는다.
- 운영 환경에서는 CPU, 메모리, 5xx 응답을 모니터링한다.

현재 레포지토리에서 참고할 것
- `.github/workflows/week9-docker.yml`
- `.github/workflows/deploy-aws-ecr-ecs.yml`

예상 제출 문구
- "Docker 이미지를 CI에서 빌드/푸시하고, 배포 후 헬스체크 및 모니터링을 수행하는 파이프라인을 설계하였다."
