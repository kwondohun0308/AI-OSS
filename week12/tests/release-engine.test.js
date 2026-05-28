const {
  evaluateFeatureFlags,
  assignVariant,
  EventTracker,
  evaluateCanaryRollout,
  simulateCanaryRollout,
  buildReleaseSnapshot,
} = require('../src/release-engine');

describe('release engine', () => {
  test('feature flags respect allowlists and rollouts', () => {
    const flags = evaluateFeatureFlags({
      userId: 'alice',
      env: {
        FEATURE_NEW_DASHBOARD_USERS: 'alice',
        FEATURE_BETA_TOOLBAR_ROLLOUT: '100',
        FEATURE_LOYALTY_BADGE_ENABLED: 'true',
      },
    });

    expect(flags.newDashboard.enabled).toBe(true);
    expect(flags.newDashboard.reason).toBe('target-user');
    expect(flags.betaToolbar.enabled).toBe(true);
    expect(flags.loyaltyBadge.enabled).toBe(true);
  });

  test('feature flags can be disabled by default', () => {
    const flags = evaluateFeatureFlags({
      userId: 'nobody',
      env: {},
    });

    expect(flags.newDashboard.enabled).toBe(false);
    expect(flags.newDashboard.reason).toBe('disabled');
  });

  test('assignment stays stable for the same user and experiment', () => {
    const first = assignVariant({ experimentKey: 'pricing-copy', userId: 'alice' });
    const second = assignVariant({ experimentKey: 'pricing-copy', userId: 'alice' });

    expect(first.variant).toBe(second.variant);
    expect(['control', 'variant']).toContain(first.variant);
  });

  test('assignment rejects missing inputs', () => {
    expect(() => assignVariant({ userId: 'alice' })).toThrow('experimentKey is required');
    expect(() => assignVariant({ experimentKey: 'pricing-copy' })).toThrow('userId is required');
  });

  test('event tracker summarizes by type and variant', () => {
    const tracker = new EventTracker();
    const assignment = assignVariant({ experimentKey: 'pricing-copy', userId: 'alice' });

    tracker.recordAssignment({ experimentKey: 'pricing-copy', userId: 'alice', variant: assignment.variant });
    tracker.recordExposure({ experimentKey: 'pricing-copy', userId: 'alice', variant: assignment.variant });
    tracker.recordConversion({ experimentKey: 'pricing-copy', userId: 'alice', variant: assignment.variant });

    expect(tracker.summary('pricing-copy')).toEqual({
      total: 3,
      byType: {
        assignment: 1,
        exposure: 1,
        conversion: 1,
      },
      byVariant: {
        [assignment.variant]: 3,
      },
    });
  });

  test('canary advances when health is good', () => {
    const rollout = simulateCanaryRollout({
      healthChecks: {
        1: { healthy: true, errorRate: 0.01, latencyMs: 120 },
        10: { healthy: true, errorRate: 0.01, latencyMs: 120 },
        50: { healthy: true, errorRate: 0.01, latencyMs: 120 },
        100: { healthy: true, errorRate: 0.01, latencyMs: 120 },
      },
    });

    expect(rollout.outcome).toBe('complete');
    expect(rollout.steps).toHaveLength(4);
  });

  test('canary completes at the final stage', () => {
    const step = evaluateCanaryRollout({
      currentPercent: 100,
      health: { healthy: true, errorRate: 0.01, latencyMs: 120 },
    });

    expect(step.action).toBe('complete');
    expect(step.nextPercent).toBe(100);
  });

  test('canary uses the fallback stage for unknown percentages', () => {
    const step = evaluateCanaryRollout({
      currentPercent: 3,
      health: { healthy: true, errorRate: 0.01, latencyMs: 120 },
    });

    expect(step.action).toBe('advance');
    expect(step.nextPercent).toBe(1);
  });

  test('canary rolls back on failure', () => {
    const step = evaluateCanaryRollout({
      currentPercent: 10,
      health: { healthy: false, errorRate: 0.5, latencyMs: 999 },
    });

    expect(step.action).toBe('rollback');
    expect(step.nextPercent).toBe(1);
  });

  test('release snapshot combines the moving parts', () => {
    const tracker = new EventTracker();
    const snapshot = buildReleaseSnapshot({
      userId: 'alice',
      experimentKey: 'pricing-copy',
      orderText: 'SKU-1|price=1000|qty=2|coupon=SAVE10',
      env: {
        FEATURE_NEW_DASHBOARD_USERS: 'alice',
        CANARY_HEALTH_OK: 'true',
        CANARY_ERROR_RATE: '0.01',
        CANARY_LATENCY_MS: '120',
      },
      tracker,
    });

    expect(snapshot.flags.newDashboard.enabled).toBe(true);
    expect(snapshot.pricing.finalTotal).toBe(1800);
    expect(snapshot.trackerSummary.total).toBe(2);
  });

  test('release snapshot can be collected without a tracker', () => {
    const snapshot = buildReleaseSnapshot({
      userId: 'bob',
      experimentKey: 'pricing-copy',
      orderText: 'SKU-1|price=1000|qty=2',
      env: {},
    });

    expect(snapshot.trackerSummary).toBeNull();
  });
});