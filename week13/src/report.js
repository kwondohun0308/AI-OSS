const fs = require('fs');
const path = require('path');
const { runTwoWeekExperiment } = require('./experiment');
const { getPersonas } = require('./personas');
const { loadWeek13Config } = require('./config');

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function topFeedbackSamples(feedback, count = 5) {
  return feedback
    .slice()
    .sort((left, right) => right.satisfaction - left.satisfaction)
    .slice(0, count)
    .map((record) => `- ${record.personaName} (${record.archetype}): ${record.comment}`)
    .join('\n');
}

function generateWeeklyReport({ env = process.env, experiment } = {}) {
  const config = loadWeek13Config(env);
  const report = experiment || runTwoWeekExperiment({ env, personas: getPersonas() });

  return `# Week13 Experiment Report

## Decision
- ${report.decision.decision}

## Summary
- Experiment: ${report.experimentKey}
- Personas: ${report.personas.length}
- Feedback entries: ${report.feedback.length}
- Rollouts: week1 ${report.rollouts[0]}%, week2 ${report.rollouts[1]}%

## Metrics
| Metric | Control | Treatment | Lift |
| --- | ---: | ---: | ---: |
| Activation | ${formatPercent(report.summary.control.activation)} | ${formatPercent(report.summary.treatment.activation)} | ${formatPercent(report.summary.lift.activation)} |
| Satisfaction | ${report.summary.control.satisfaction.toFixed(2)} | ${report.summary.treatment.satisfaction.toFixed(2)} | ${report.summary.lift.satisfaction.toFixed(2)} |
| Retention | ${formatPercent(report.summary.control.retention)} | ${formatPercent(report.summary.treatment.retention)} | ${formatPercent(report.summary.lift.retention)} |
| Support tickets | ${report.summary.control.supportTickets.toFixed(2)} | ${report.summary.treatment.supportTickets.toFixed(2)} | ${report.summary.lift.supportTickets.toFixed(2)} |

## Top Feedback
${topFeedbackSamples(report.feedback)}

## Rationale
${report.decision.rationale.map((item) => `- ${item}`).join('\n')}

## GitHub Operations
- Backlog board: ${config.issueBoardUrl}
- Weekly automation: GitHub Actions schedule + workflow_dispatch
- Source of truth: docs/backlog.md and docs/decision.md

## Pivot / Persevere
- Final decision: ${report.decision.decision}
- Recommended next step: ${report.decision.decision === 'Persevere' ? 'expand rollout and keep measuring' : 'pivot the experiment hypothesis and retest'}
`;
}

function writeWeeklyReport({ env = process.env, outputPath, experiment } = {}) {
  const config = loadWeek13Config(env);
  const report = generateWeeklyReport({ env, experiment });
  const resolvedPath = path.resolve(process.cwd(), outputPath || config.reportPath);

  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  fs.writeFileSync(resolvedPath, report, 'utf8');

  return resolvedPath;
}

module.exports = {
  formatPercent,
  topFeedbackSamples,
  generateWeeklyReport,
  writeWeeklyReport,
};