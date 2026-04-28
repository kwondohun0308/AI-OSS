import fs from 'node:fs/promises';

const jsonPath = process.argv[2] || 'week2-dora-metrics/artifacts/dora-metrics.json';
const raw = await fs.readFile(jsonPath, 'utf8');
const data = JSON.parse(raw);

function formatHours(value) {
  if (value === null || Number.isNaN(value)) return '데이터 없음';
  return `${value.toFixed(2)}시간`;
}

function formatPercent(value) {
  if (value === null || Number.isNaN(value)) return '데이터 없음';
  return `${(value * 100).toFixed(1)}%`;
}

const report = `# 주간 DORA 보고서

## 수집 기간
- 시작: ${data.window.start}
- 종료: ${data.window.end}

## 요약
| 지표 | 값 |
| --- | --- |
| Lead Time | ${formatHours(data.metrics.leadTime.average)} |
| Deployment Frequency | ${data.metrics.deploymentFrequency.count}회/주 |
| MTTR | ${formatHours(data.metrics.mttr.average)} |
| Change Failure Rate | ${formatPercent(data.metrics.changeFailureRate.value)} |

## 해석
- Lead Time은 PR 머지 속도를 확인하는 핵심 지표다.
- Deployment Frequency는 배포 자동화 수준을 보여준다.
- MTTR은 장애 복구 체계를 점검하는 지표다.
- Change Failure Rate는 배포 품질을 요약한다.

## 자동화 메모
- 수집 결과는 JSON 아티팩트로 별도 저장된다.
- 동일 JSON을 기반으로 차트와 표를 다시 그릴 수 있다.
- 워크플로우는 주간 실행과 수동 실행을 모두 지원한다.

## 생성형 AI 사용 고지
이 보고서는 생성형 AI(GitHub Copilot)를 활용하여 작성되었습니다.
`;

await fs.mkdir('week2-dora-metrics/reports', { recursive: true });
await fs.writeFile('week2-dora-metrics/reports/weekly-report.md', report, 'utf8');
process.stdout.write(report);
