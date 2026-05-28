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

function parseCsv(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
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

function loadWeek12Config(env = process.env) {
  return {
    userId: env.WEEK12_USER_ID || 'guest',
    experimentKey: env.WEEK12_EXPERIMENT_KEY || 'pricing-copy',
    orderText:
      env.WEEK12_ORDER_TEXT || 'SKU-001|price=1200|qty=2|coupon=SAVE10|customerType=standard',
    featureFlags: {
      newDashboard: {
        enabled: parseBoolean(env.FEATURE_NEW_DASHBOARD_ENABLED, false),
        users: parseCsv(env.FEATURE_NEW_DASHBOARD_USERS),
        rollout: parsePercent(env.FEATURE_NEW_DASHBOARD_ROLLOUT, 0),
      },
      betaToolbar: {
        enabled: parseBoolean(env.FEATURE_BETA_TOOLBAR_ENABLED, false),
        users: parseCsv(env.FEATURE_BETA_TOOLBAR_USERS),
        rollout: parsePercent(env.FEATURE_BETA_TOOLBAR_ROLLOUT, 0),
      },
      loyaltyBadge: {
        enabled: parseBoolean(env.FEATURE_LOYALTY_BADGE_ENABLED, false),
        users: parseCsv(env.FEATURE_LOYALTY_BADGE_USERS),
        rollout: parsePercent(env.FEATURE_LOYALTY_BADGE_ROLLOUT, 0),
      },
    },
    canary: {
      currentPercent: parsePercent(env.CANARY_PERCENT, 1),
      maxErrorRate: Number(env.CANARY_MAX_ERROR_RATE || 0.02),
      maxLatencyMs: Number(env.CANARY_MAX_LATENCY_MS || 250),
      health: {
        healthy: parseBoolean(env.CANARY_HEALTH_OK, true),
        errorRate: Number(env.CANARY_ERROR_RATE || 0),
        latencyMs: Number(env.CANARY_LATENCY_MS || 120),
      },
    },
  };
}

module.exports = {
  parseBoolean,
  parseInteger,
  parseCsv,
  parsePercent,
  loadWeek12Config,
};