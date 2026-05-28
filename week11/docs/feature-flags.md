# Feature Flags 설계

이 문서는 앱에 3개 이상의 feature flag를 도입하고, 환경 변수와 대상 사용자 기준으로 토글하는 방법을 설명합니다.

## Feature Flags
- `newNavigation`
- `betaProfile`
- `trialBadge`

## 토글 기준
- 전역 환경 변수: `FEATURE_NEW_NAV_ENABLED`
- 대상 사용자 allowlist: `FEATURE_TARGET_USERS`, `FEATURE_BETA_USERS`, `FEATURE_TRIAL_USERS`
- 비율 기반 rollout: `FEATURE_BETA_PROFILE_ROLLOUT`, `FEATURE_TRIAL_BADGE_ROLLOUT`

## 우선순위
1. allowlist에 포함된 사용자가 가장 먼저 활성화된다.
2. allowlist가 없으면 environment toggle 또는 percentage rollout을 따른다.
3. rollout은 hash 기반으로 계산해서 같은 userId가 매번 같은 결과를 받는다.

## 예시
```bash
FEATURE_NEW_NAV_ENABLED=true
FEATURE_TARGET_USERS=alice,bob
FEATURE_BETA_USERS=carol,dave
FEATURE_BETA_PROFILE_ROLLOUT=25
FEATURE_TRIAL_USERS=ops1
FEATURE_TRIAL_BADGE_ROLLOUT=10
```

## 확인 방법
- `http://localhost:3000/?user=alice` 로 접속하면 allowlist 기준 flag 상태를 확인할 수 있다.
- `http://localhost:3000/api/decisions?user=alice` 에서 JSON 결과를 볼 수 있다.
