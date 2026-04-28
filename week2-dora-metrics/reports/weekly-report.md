# 주간 DORA 보고서

## 수집 기간
- 시작: 2026-04-21T00:00:00.000Z
- 종료: 2026-04-28T00:00:00.000Z

## 요약
| 지표 | 값 |
| --- | --- |
| Lead Time | 18.40시간 |
| Deployment Frequency | 6회/주 |
| MTTR | 3.10시간 |
| Change Failure Rate | 8.3% |

## 해석
- Lead Time은 PR 최초 커밋부터 머지까지의 흐름을 보여준다.
- Deployment Frequency는 변경이 얼마나 자주 릴리스되는지 보여준다.
- MTTR은 장애 발생 후 복구 속도를 확인하는 지표다.
- Change Failure Rate는 배포 품질과 안정성을 간접적으로 평가한다.

## 자동화 메모
- 실제 주간 실행에서는 GitHub Actions가 이 파일을 JSON 결과로부터 다시 생성한다.
- 수집 결과 JSON과 보고서 Markdown은 각각 아티팩트로 저장된다.

## 생성형 AI 사용 고지
이 보고서는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.
