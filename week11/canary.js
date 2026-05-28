const CANARY_STAGES = [1, 10, 50, 100];
const DEFAULT_STAGES = [...CANARY_STAGES];

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nextStage(currentPercent) {
  const index = CANARY_STAGES.indexOf(currentPercent);

  if (index === -1) {
    return CANARY_STAGES[0];
  }

  return CANARY_STAGES[Math.min(index + 1, CANARY_STAGES.length - 1)];
}

function evaluateCanaryRollout({ currentPercent = 1, health = {}, env = process.env } = {}) {
  const maxErrorRate = parseNumber(env.CANARY_MAX_ERROR_RATE, 0.02);
  const maxLatencyMs = parseNumber(env.CANARY_MAX_LATENCY_MS, 250);
  const healthy =
    health.healthy !== false &&
    parseNumber(health.errorRate, 0) <= maxErrorRate &&
    parseNumber(health.latencyMs, 0) <= maxLatencyMs;

  const nextPercent = nextStage(currentPercent);

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
    nextPercent,
    stablePercent: currentPercent,
    healthy: true,
    thresholds: {
      maxErrorRate,
      maxLatencyMs,
    },
    health,
  };
}

function normalizeHealthChecks(healthChecks, stages) {
  if (Array.isArray(healthChecks)) {
    return Object.fromEntries(stages.map((stage, index) => [stage, healthChecks[index] || {}]));
  }

  return healthChecks || {};
}

function simulateCanaryRollout({ stages = DEFAULT_STAGES, healthChecks = {}, env = process.env } = {}) {
  const rolloutStages = stages.length > 0 ? stages : DEFAULT_STAGES;
  const normalizedHealthChecks = normalizeHealthChecks(healthChecks, rolloutStages);
  const steps = [];
  let currentPercent = rolloutStages[0];
  let stablePercent = rolloutStages[0];

  for (const stage of rolloutStages) {
    const health = normalizedHealthChecks[stage] || normalizedHealthChecks[String(stage)] || {};
    const step = evaluateCanaryRollout({ currentPercent: stage, health, env });
    steps.push({
      step: steps.length + 1,
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
    currentPercent = step.nextPercent;
  }

  return {
    outcome: 'complete',
    currentPercent,
    nextPercent: rolloutStages[rolloutStages.length - 1],
    stablePercent,
    steps,
  };
}

function simulateCanaryPlan(options = {}) {
  return simulateCanaryRollout(options);
}

module.exports = {
  CANARY_STAGES,
  DEFAULT_STAGES,
  evaluateCanaryRollout,
  simulateCanaryRollout,
  simulateCanaryPlan,
};
