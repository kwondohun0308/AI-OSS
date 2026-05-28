const {
  parseBoolean,
  parseInteger,
  parseCsv,
  parsePercent,
  loadWeek12Config,
} = require('../src/config');

describe('config helpers', () => {
  test('parseBoolean handles common truthy and falsy values', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('on')).toBe(true);
    expect(parseBoolean('0')).toBe(false);
    expect(parseBoolean(undefined, true)).toBe(true);
  });

  test('parseInteger and parsePercent clamp safely', () => {
    expect(parseInteger('42')).toBe(42);
    expect(parseInteger('nope', 7)).toBe(7);
    expect(parsePercent('120')).toBe(100);
    expect(parsePercent('-20')).toBe(0);
  });

  test('parseCsv trims empty entries', () => {
    expect(parseCsv(' alice, bob , ,carol ')).toEqual(['alice', 'bob', 'carol']);
  });

  test('loadWeek12Config reads env aliases and defaults', () => {
    const config = loadWeek12Config({
      WEEK12_USER_ID: 'alice',
      WEEK12_EXPERIMENT_KEY: 'checkout-copy',
      WEEK12_ORDER_TEXT: 'SKU-1|price=1500|qty=2',
      FEATURE_NEW_DASHBOARD_ENABLED: 'true',
      FEATURE_BETA_TOOLBAR_USERS: 'bob, carol',
      FEATURE_BETA_TOOLBAR_ROLLOUT: '25',
      FEATURE_LOYALTY_BADGE_USERS: 'dave',
      CANARY_PERCENT: '10',
    });

    expect(config.userId).toBe('alice');
    expect(config.experimentKey).toBe('checkout-copy');
    expect(config.featureFlags.newDashboard.enabled).toBe(true);
    expect(config.featureFlags.betaToolbar.users).toEqual(['bob', 'carol']);
    expect(config.featureFlags.betaToolbar.rollout).toBe(25);
    expect(config.canary.currentPercent).toBe(10);
  });

  test('loadWeek12Config uses safe defaults when env is empty', () => {
    const config = loadWeek12Config({});

    expect(config.userId).toBe('guest');
    expect(config.experimentKey).toBe('pricing-copy');
    expect(config.canary.health.healthy).toBe(true);
  });
});