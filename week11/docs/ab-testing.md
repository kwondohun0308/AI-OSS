# A/B Testing 설계

이 문서는 2개 variant로 구성된 A/B 테스트와 이벤트 추적을 정리합니다.

## 기본 원칙
- variant는 `control`과 `variant` 두 개만 사용한다.
- 동일한 `userId + experimentKey` 조합은 항상 같은 variant를 받는다.
- 이벤트는 assignment, exposure, conversion으로 분리해 추적한다.

## 할당 로직
- `sha256(experimentKey:userId)` 해시를 사용한다.
- 해시값을 0~1 범위의 bucket으로 바꿔 variant를 결정한다.
- bucket이 바뀌지 않기 때문에 재실행해도 결과가 일관된다.

## 이벤트 추적
- `assignment`: 실험에 배정된 순간 기록
- `exposure`: 실제 UI가 노출된 순간 기록
- `conversion`: 사용자가 목표 행동을 수행한 순간 기록

## 확인 예시
```bash
curl "http://localhost:3000/api/decisions?user=alice&experiment=pricing-copy"
curl "http://localhost:3000/api/events"
```

## 검증 포인트
- 같은 사용자는 매번 같은 variant를 받는다.
- experimentKey를 바꾸면 bucket이 독립적으로 계산된다.
- event summary는 variant별로 누적 카운트를 보여준다.
