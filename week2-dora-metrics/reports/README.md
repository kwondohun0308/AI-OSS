# 주간 보고서

이 폴더에는 GitHub Actions 워크플로우가 생성한 주간 DORA 보고서가 저장된다.

## 산출 방식
- `week2-dora-metrics/scripts/collect-dora-metrics.mjs`가 JSON을 만든다.
- `week2-dora-metrics/scripts/generate-weekly-report.mjs`가 Markdown 보고서를 만든다.
- 워크플로우 실행 후 생성된 보고서는 아티팩트로 업로드된다.

## 생성형 AI 사용 고지
이 문서는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.
