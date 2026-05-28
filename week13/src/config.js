function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function parseInteger(value, defaultValue = 0) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function parsePercent(value, defaultValue = 0) {
  const parsed = parseInteger(value, defaultValue);

  if (parsed < 0) {
    return 0;
  }

  if (parsed > 100) {
    return 100;
  }

  return parsed;
}

function parseCsv(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function loadWeek13Config(env = process.env) {
  return {
    userId: env.WEEK13_USER_ID || 'guest',
    experimentKey: env.WEEK13_EXPERIMENT_KEY || 'homepage-cta',
    featureFlag: {
      enabled: parseBoolean(env.FEATURE_EXPERIMENT_ENABLED, true),
      targetUsers: parseCsv(env.FEATURE_EXPERIMENT_TARGET_USERS),
      rollout: parsePercent(env.FEATURE_EXPERIMENT_ROLLOUT, 50),
    },
    rolloutSchedule: [
      parsePercent(env.WEEK13_WEEK1_ROLLOUT, 20),
      parsePercent(env.WEEK13_WEEK2_ROLLOUT, 60),
    ],
    thresholds: {
      minSatisfactionLift: Number(env.WEEK13_MIN_SATISFACTION_LIFT || 0.15),
      minActivationLift: Number(env.WEEK13_MIN_ACTIVATION_LIFT || 0.03),
      maxTicketDelta: Number(env.WEEK13_MAX_TICKET_DELTA || 0.05),
    },
    reportPath: env.WEEK13_REPORT_PATH || 'reports/weekly-report.md',
    issueBoardUrl: env.WEEK13_PROJECT_URL || 'https://github.com/kwondohun0308/AI-OSS/projects',
  };
}

module.exports = {
  parseBoolean,
  parseInteger,
  parsePercent,
  parseCsv,
  loadWeek13Config,
};