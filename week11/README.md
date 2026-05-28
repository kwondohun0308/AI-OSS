# Week11: Feature Flags, A/B Testing, Canary Rollout

이 폴더는 앱 릴리스 안정화 과제를 위한 실행 가능한 샘플입니다.

핵심 구성
- Feature Flag 3개 이상을 환경 변수와 대상 사용자 기준으로 토글
- A/B 테스트 2개 variant를 결정론적으로 할당하고 이벤트 추적
- Canary 1%-10%-50%-100% 롤아웃과 자동 롤백 시나리오 검증

파일 구성
- `app.js`: 샘플 HTTP 앱 및 데모 페이지
- `feature-flags.js`: 환경 변수/대상 사용자 기반 feature flag 평가
- `ab-test.js`: 2-variant A/B 테스트와 이벤트 트래킹
- `canary.js`: canary rollout 단계와 헬스체크 기반 롤백
- `docs/`: 과제 설명 문서
- `.env.example`: 로컬 실행용 환경 변수 예시

실행 방법
```bash
cd week11
npm start
```

브라우저 예시
- `http://localhost:3000/?user=alice&experiment=pricing-copy`
- `http://localhost:3000/api/decisions?user=alice&experiment=pricing-copy`
- `http://localhost:3000/health`
- `http://localhost:3000/api/events`

환경 변수 예시
```bash
FEATURE_NEW_NAV_ENABLED=true
FEATURE_TARGET_USERS=alice,bob
FEATURE_BETA_USERS=carol,dave
FEATURE_BETA_PROFILE_ROLLOUT=25
FEATURE_TRIAL_USERS=ops1
FEATURE_TRIAL_BADGE_ROLLOUT=10
CANARY_HEALTH_OK=true
CANARY_ERROR_RATE=0.01
CANARY_LATENCY_MS=120
```

검증 포인트
1. 같은 `user`와 `experiment`는 항상 같은 variant를 받습니다.
2. allowlist에 들어간 사용자는 feature flag가 우선 활성화됩니다.
3. canary health가 threshold를 넘으면 `/health`가 실패 응답을 반환합니다.
