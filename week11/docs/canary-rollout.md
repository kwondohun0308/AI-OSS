# Canary Rollout 설계

이 문서는 1%-10%-50%-100% rollout과 헬스체크 기반 자동 롤백 시나리오를 설명합니다.

## Rollout 단계
1. 1%: 가장 작은 트래픽으로 새 버전을 검증한다.
2. 10%: 초기 이상이 없으면 트래픽을 늘린다.
3. 50%: 운영 신호를 더 넓게 확인한다.
4. 100%: 문제가 없을 때 전체 트래픽으로 전환한다.

## 헬스체크 기준
- `healthy`가 false이면 즉시 롤백
- `errorRate`가 `maxErrorRate`를 초과하면 롤백
- `latencyMs`가 `maxLatencyMs`를 초과하면 롤백

## 자동 롤백 시나리오
```bash
CANARY_HEALTH_OK=false npm start
```

이 경우 `/health`는 실패 응답을 반환하고, canary simulation은 마지막 안정 stage로 돌아간 것으로 계산한다.

## 성공 시나리오
```bash
CANARY_HEALTH_OK=true CANARY_ERROR_RATE=0.01 CANARY_LATENCY_MS=120 npm start
```

이 경우 1% -> 10% -> 50% -> 100% 순으로 advance 된다.

## 실무 적용 포인트
- 배포 직후 `/health` 또는 readiness check를 연동한다.
- 알람은 5xx 비율, timeout, latency를 기준으로 둔다.
- 실패가 감지되면 이전 stable release로 자동 되돌린다.
