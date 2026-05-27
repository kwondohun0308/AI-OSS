# Docker 기반 배포 파이프라인 전략

목표: CI에서 Docker 이미지를 빌드 → 레지스트리(GHCR/ECR)에 푸시 → 배포 환경에서 컨테이너로 롤링/재배포

권장 단계
1. 빌드: GitHub Actions에서 `docker build` (다중 플랫폼 필요 시 buildx 사용).
2. 스캔: 이미지에 대한 취약점 스캔(nikto/snyk/Trivy).
3. 레지스트리 푸시: GHCR 또는 AWS ECR에 태그(sha, latest)로 푸시.
4. 배포 트리거: 이미지 푸시 후 배포 워크플로(예: ECS 업데이트, Kubernetes rolling update, or Cloud Run deploy).
5. 헬스체크/스모크 테스트: 새 배포에 대해 HTTP 헬스체크를 실행하고 실패 시 롤백.
6. 모니터링: CloudWatch/Stackdriver + 알람(예: 높은 5xx 비율, CPU 상승) 설정.

롤링 전략 예시
- ECS: `force-new-deployment`로 새 태스크 정의를 등록하고 서비스 업데이트.
- Kubernetes: `kubectl set image`와 readinessProbe, livenessProbe를 활용해 롤링 업데이트.
