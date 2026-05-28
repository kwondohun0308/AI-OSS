const crypto = require('crypto');
const { loadWeek12Config, parseBoolean } = require('./config');
const { calculateOrderTotal, parseLegacyOrder } = require('./legacy-pricing');

const DEFAULT_VARIANTS = ['control', 'variant'];
const CANARY_STAGES = [1, 10, 50, 100];

function hashPercent(seed) {
  const digest = crypto.createHash('sha256').update(seed).digest();
  return digest.readUInt32BE(0) % 100;
}

function isTargetUser(userId, users) {
  return users.includes(String(userId));
}

function evaluateFeatureFlags({ userId = 'guest', env = process.env } = {}) {
  const config = loadWeek12Config(env);

  const flagEntries = [
    ['newDashboard', config.featureFlags.newDashboard, 'newDashboard'],
    ['betaToolbar', config.featureFlags.betaToolbar, 'betaToolbar'],
    ['loyaltyBadge', config.featureFlags.loyaltyBadge, 'loyaltyBadge'],
  ];

  return Object.fromEntries(flagEntries.map(([flagName, flagConfig, seed]) => {
    const targeted = isTargetUser(userId, flagConfig.users);
    const rolloutBucket = flagConfig.rollout > 0 ? hashPercent(`${userId}:${seed}`) : null;
    const rolloutEnabled = flagConfig.rollout > 0 && rolloutBucket < flagConfig.rollout;

    return [flagName, {
      enabled: targeted || flagConfig.enabled || rolloutEnabled,
      reason: targeted ? 'target-user' : flagConfig.enabled ? 'environment' : rolloutEnabled ? 'rollout' : 'disabled',
      users: [...flagConfig.users],
      rollout: flagConfig.rollout,
      bucket: rolloutBucket,
    }];
  }));
}

function assignVariant({ experimentKey, userId, variants = DEFAULT_VARIANTS } = {}) {
  if (!experimentKey) {
    throw new Error('experimentKey is required');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  const bucket = hashPercent(`${experimentKey}:${userId}`) % variants.length;

  return {
    experimentKey,
    userId,
    bucket,
    variant: variants[bucket],
    variants: [...variants],
  };
}

class EventTracker {
  constructor() {
    this.events = [];
  }

  track(type, payload = {}) {
    const event = {
      type,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    this.events.push(event);
    return event;
  }

  recordAssignment(payload) {
    return this.track('assignment', payload);
  }

  recordExposure(payload) {
    return this.track('exposure', payload);
  }

  recordConversion(payload) {
    return this.track('conversion', payload);
  }

  summary(experimentKey) {
    const scopedEvents = experimentKey
      ? this.events.filter((event) => event.experimentKey === experimentKey)
      : this.events;

    return scopedEvents.reduce((accumulator, event) => {
      const variant = event.variant || 'n/a';
      accumulator.total += 1;
      accumulator.byType[event.type] = (accumulator.byType[event.type] || 0) + 1;
      accumulator.byVariant[variant] = (accumulator.byVariant[variant] || 0) + 1;
      return accumulator;
    }, {
      total: 0,
      byType: {},
      byVariant: {},
    });
  }
}

function nextCanaryStage(currentPercent, stages = CANARY_STAGES) {
  const index = stages.indexOf(currentPercent);

  if (index === -1) {
    return stages[0];
  }

  return stages[Math.min(index + 1, stages.length - 1)];
}

function evaluateCanaryRollout({ currentPercent = 1, health = {}, env = process.env } = {}) {
  const config = loadWeek12Config(env);
  const maxErrorRate = Number(env.CANARY_MAX_ERROR_RATE || config.canary.maxErrorRate);
  const maxLatencyMs = Number(env.CANARY_MAX_LATENCY_MS || config.canary.maxLatencyMs);
  const healthy = parseBoolean(health.healthy, true)
    && Number(health.errorRate || 0) <= maxErrorRate
    && Number(health.latencyMs || 0) <= maxLatencyMs;

  if (!healthy) {
    return {
      action: 'rollback',
      currentPercent,
      nextPercent: CANARY_STAGES[0],
      stablePercent: CANARY_STAGES[0],
      healthy: false,
      thresholds: {
        maxErrorRate,
        maxLatencyMs,
      },
      health,
    };
  }

  if (currentPercent >= CANARY_STAGES[CANARY_STAGES.length - 1]) {
    return {
      action: 'complete',
      currentPercent,
      nextPercent: CANARY_STAGES[CANARY_STAGES.length - 1],
      stablePercent: CANARY_STAGES[CANARY_STAGES.length - 1],
      healthy: true,
      thresholds: {
        maxErrorRate,
        maxLatencyMs,
      },
      health,
    };
  }

  return {
    action: 'advance',
    currentPercent,
    nextPercent: nextCanaryStage(currentPercent),
    stablePercent: currentPercent,
    healthy: true,
    thresholds: {
      maxErrorRate,
      maxLatencyMs,
    },
    health,
  };
}

function simulateCanaryRollout({ stages = CANARY_STAGES, healthChecks = {}, env = process.env } = {}) {
  const steps = [];
  let stablePercent = stages[0];

  for (const [index, stage] of stages.entries()) {
    const health = healthChecks[stage] || healthChecks[String(stage)] || {};
    const step = evaluateCanaryRollout({ currentPercent: stage, health, env });

    steps.push({
      step: index + 1,
      stage,
      ...step,
    });

    if (step.action === 'rollback') {
      return {
        outcome: 'rollback',
        currentPercent: stage,
        nextPercent: step.nextPercent,
        stablePercent: step.stablePercent,
        steps,
      };
    }

    stablePercent = step.stablePercent;
  }

  return {
    outcome: 'complete',
    currentPercent: stages[stages.length - 1],
    nextPercent: stages[stages.length - 1],
    stablePercent,
    steps,
  };
}

function buildReleaseSnapshot({ userId, experimentKey, orderText, env = process.env, tracker } = {}) {
  const assignment = assignVariant({ experimentKey, userId });
  const flags = evaluateFeatureFlags({ userId, env });
  const canary = simulateCanaryRollout({
    env,
    healthChecks: Object.fromEntries(CANARY_STAGES.map((stage) => [stage, loadWeek12Config(env).canary.health])),
  });
  const order = parseLegacyOrder(orderText || loadWeek12Config(env).orderText);
  const pricing = calculateOrderTotal(order);

  if (tracker) {
    tracker.recordAssignment({ experimentKey, userId, variant: assignment.variant });
    tracker.recordExposure({ experimentKey, userId, variant: assignment.variant });
  }

  return {
    userId,
    experimentKey,
    flags,
    assignment,
    canary,
    order,
    pricing,
    trackerSummary: tracker ? tracker.summary(experimentKey) : null,
  };
}

module.exports = {
  DEFAULT_VARIANTS,
  CANARY_STAGES,
  hashPercent,
  isTargetUser,
  evaluateFeatureFlags,
  assignVariant,
  EventTracker,
  evaluateCanaryRollout,
  simulateCanaryRollout,
  buildReleaseSnapshot,
};