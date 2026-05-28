const fs = require('fs');
const path = require('path');
const { generateWeeklyReport, writeWeeklyReport, topFeedbackSamples } = require('../src/report');
const { runTwoWeekExperiment } = require('../src/experiment');

describe('report generation', () => {
  test('generates a report with decision and metrics', () => {
    const report = generateWeeklyReport({ experiment: runTwoWeekExperiment() });

    expect(report).toContain('Week13 Experiment Report');
    expect(report).toContain('Persevere');
    expect(report).toContain('Top Feedback');
  });

  test('generates a report from the default experiment when not provided', () => {
    const report = generateWeeklyReport();

    expect(report).toContain('Week13 Experiment Report');
    expect(report).toContain('Persevere');
  });

  test('writes a weekly report artifact', () => {
    const outputPath = path.join(__dirname, '..', 'reports', 'weekly-report.md');
    const writtenPath = writeWeeklyReport({ outputPath });

    expect(writtenPath).toBe(path.resolve(outputPath));
    expect(fs.existsSync(writtenPath)).toBe(true);
    expect(fs.readFileSync(writtenPath, 'utf8')).toContain('Week13 Experiment Report');
  });

  test('top feedback samples return ordered highlights', () => {
    const samples = topFeedbackSamples([
      { personaName: 'A', archetype: 'One', satisfaction: 3.8, comment: 'first' },
      { personaName: 'B', archetype: 'Two', satisfaction: 4.8, comment: 'second' },
    ]);

    expect(samples).toContain('B (Two)');
    expect(samples.split('\n')).toHaveLength(2);
  });
});