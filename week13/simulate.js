const fs = require('fs');
const path = require('path');
const { runTwoWeekExperiment } = require('./src/experiment');
const { generateWeeklyReport, writeWeeklyReport } = require('./src/report');

const args = new Set(process.argv.slice(2));
const writeReport = args.has('--write-report');

const experiment = runTwoWeekExperiment();
const report = generateWeeklyReport({ experiment });

if (writeReport) {
  const reportPath = writeWeeklyReport({});
  const artifactDir = path.resolve(__dirname, 'reports');

  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(path.join(artifactDir, 'experiment-summary.json'), JSON.stringify(experiment, null, 2), 'utf8');
  console.log(`report written to ${reportPath}`);
}

console.log(report);