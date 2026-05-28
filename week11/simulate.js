const assert = require('assert');
const { evaluateFeatureFlags } = require('./feature-flags');
const { assignVariant, EventTracker } = require('./ab-test');
const { simulateCanaryRollout } = require('./canary');

const env = {
  FEATURE_NEW_NAV_ENABLED: 'true',
  FEATURE_TARGET_USERS: 'alice',
  FEATURE_BETA_USERS: 'bob',
  FEATURE_BETA_PROFILE_ROLLOUT: '0',
  FEATURE_TRIAL_USERS: 'carol',
  FEATURE_TRIAL_BADGE_ROLLOUT: '0',
};

const flags = evaluateFeatureFlags({ userId: 'alice', env });
assert.equal(flags.newNavigation.enabled, true);
assert.equal(flags.newNavigation.reason, 'target-user');
assert.equal(flags.betaProfile.enabled, false);
assert.equal(flags.trialBadge.enabled, false);

const firstAssignment = assignVariant({ experimentKey: 'pricing-copy', userId: 'alice' });
const secondAssignment = assignVariant({ experimentKey: 'pricing-copy', userId: 'alice' });
assert.equal(firstAssignment.variant, secondAssignment.variant);
assert.equal(['control', 'variant'].includes(firstAssignment.variant), true);

const tracker = new EventTracker();
tracker.recordAssignment(firstAssignment);
tracker.recordExposure(firstAssignment);
tracker.recordConversion(firstAssignment);
assert.equal(tracker.summary('pricing-copy').total, 3);
assert.equal(tracker.summary('pricing-copy').byType.assignment, 1);
assert.equal(tracker.summary('pricing-copy').byType.exposure, 1);
assert.equal(tracker.summary('pricing-copy').byType.conversion, 1);

const healthyPlan = simulateCanaryRollout({
  stages: [1, 10, 50, 100],
  healthChecks: {
    1: { healthy: true, errorRate: 0.01, latencyMs: 120 },
    10: { healthy: true, errorRate: 0.01, latencyMs: 120 },
    50: { healthy: true, errorRate: 0.01, latencyMs: 120 },
    100: { healthy: true, errorRate: 0.01, latencyMs: 120 },
  },
});
assert.equal(healthyPlan.outcome, 'complete');
assert.equal(healthyPlan.steps.length, 4);

const rollbackPlan = simulateCanaryRollout({
  stages: [1, 10, 50, 100],
  healthChecks: {
    1: { healthy: false, errorRate: 0.5, latencyMs: 999 },
  },
});
assert.equal(rollbackPlan.outcome, 'rollback');
assert.equal(rollbackPlan.steps[0].action, 'rollback');

console.log('week11 simulation ok');
