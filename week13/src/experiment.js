const crypto = require('crypto');
const { loadWeek13Config } = require('./config');
const { getPersonas } = require('./personas');

const VARIANTS = ['control', 'treatment'];

function hashNumber(seed) {
  const digest = crypto.createHash('sha256').update(seed).digest();
  return digest.readUInt32BE(0);
}

function hashPercent(seed) {
  return hashNumber(seed) % 100;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function stableAssignment({ experimentKey, userId, variants = VARIANTS } = {}) {
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

function isFlagActiveForUser({ userId, flag, env = process.env } = {}) {
  const config = flag || loadWeek13Config(env).featureFlag;
  const targeted = config.targetUsers.includes(userId);
  const rolloutActive = config.enabled && config.rollout > 0 && hashPercent(`${userId}:week13-flag`) < config.rollout;

  return {
    active: targeted || rolloutActive || config.enabled,
    targeted,
    rolloutActive,
    rollout: config.rollout,
  };
}

function deterministicNoise(seed, span = 0.03) {
  const percent = hashPercent(seed) / 100;
  return (percent - 0.5) * 2 * span;
}

function buildFeedback(persona, { week, variant, active }) {
  const treatmentBoost = variant === 'treatment' && active ? 1 : 0;
  const baseActivation = 0.48 + persona.bias.activation + deterministicNoise(`${persona.id}:activation:${week}`);
  const baseSatisfaction = 3.1 + persona.bias.satisfaction + deterministicNoise(`${persona.id}:satisfaction:${week}`, 0.22);
  const baseRetention = 0.55 + persona.bias.retention + deterministicNoise(`${persona.id}:retention:${week}`);
  const baseTickets = 0.3 + persona.bias.tickets + deterministicNoise(`${persona.id}:tickets:${week}`, 0.06);

  const activation = clamp(baseActivation + treatmentBoost * 0.09, 0, 1);
  const satisfaction = clamp(baseSatisfaction + treatmentBoost * 0.35, 1, 5);
  const retention = clamp(baseRetention + treatmentBoost * 0.06, 0, 1);
  const supportTickets = clamp(baseTickets - treatmentBoost * 0.08, 0, 1);

  const tone = satisfaction >= 4
    ? 'positive'
    : satisfaction >= 3.2
      ? 'mixed'
      : 'negative';

  const commentMap = {
    positive: `Week ${week}: ${persona.name} liked the new experience and wants it kept on the default path.`,
    mixed: `Week ${week}: ${persona.name} saw value but asked for one more guardrail before rollout.`,
    negative: `Week ${week}: ${persona.name} flagged friction and would prefer a pivot before scale-up.`,
  };

  return {
    personaId: persona.id,
    personaName: persona.name,
    archetype: persona.archetype,
    goal: persona.goal,
    week,
    variant,
    active,
    activation,
    satisfaction,
    retention,
    supportTickets,
    tone,
    comment: commentMap[tone],
  };
}

function summarizeVariant(records) {
  const total = records.length || 1;

  return {
    count: records.length,
    activation: Number((records.reduce((sum, record) => sum + record.activation, 0) / total).toFixed(3)),
    satisfaction: Number((records.reduce((sum, record) => sum + record.satisfaction, 0) / total).toFixed(3)),
    retention: Number((records.reduce((sum, record) => sum + record.retention, 0) / total).toFixed(3)),
    supportTickets: Number((records.reduce((sum, record) => sum + record.supportTickets, 0) / total).toFixed(3)),
  };
}

function summarizeFeedback(feedback) {
  const grouped = feedback.reduce((accumulator, record) => {
    accumulator[record.variant] ??= [];
    accumulator[record.variant].push(record);
    return accumulator;
  }, {});

  const control = summarizeVariant(grouped.control || []);
  const treatment = summarizeVariant(grouped.treatment || []);

  return {
    control,
    treatment,
    lift: {
      activation: Number((treatment.activation - control.activation).toFixed(3)),
      satisfaction: Number((treatment.satisfaction - control.satisfaction).toFixed(3)),
      retention: Number((treatment.retention - control.retention).toFixed(3)),
      supportTickets: Number((treatment.supportTickets - control.supportTickets).toFixed(3)),
    },
  };
}

function evaluateDecision(summary, thresholds) {
  const satisfactory = summary.lift.satisfaction >= thresholds.minSatisfactionLift;
  const activated = summary.lift.activation >= thresholds.minActivationLift;
  const ticketsHealthy = summary.lift.supportTickets <= thresholds.maxTicketDelta;

  const decision = satisfactory && activated && ticketsHealthy ? 'Persevere' : 'Pivot';

  return {
    decision,
    rationale: [
      satisfactory ? 'Satisfaction lift cleared the threshold.' : 'Satisfaction lift was too small.',
      activated ? 'Activation lift cleared the threshold.' : 'Activation lift was too small.',
      ticketsHealthy ? 'Support tickets stayed under the allowed delta.' : 'Support tickets worsened too much.',
    ],
  };
}

function runTwoWeekExperiment({ env = process.env, personas = getPersonas() } = {}) {
  const config = loadWeek13Config(env);
  const weeks = config.rolloutSchedule.map((rollout, index) => {
    const week = index + 1;
    const feedback = personas.map((persona) => {
      const assignment = stableAssignment({ experimentKey: config.experimentKey, userId: persona.id });
      const exposureRollout = rollout;
      const active = assignment.variant === 'treatment'
        && config.featureFlag.enabled
        && hashPercent(`${persona.id}:week:${week}`) < exposureRollout;

      return buildFeedback(persona, {
        week,
        variant: assignment.variant,
        active,
      });
    });

    return {
      week,
      rollout,
      feedback,
      summary: summarizeFeedback(feedback),
    };
  });

  const allFeedback = weeks.flatMap((week) => week.feedback);
  const overall = summarizeFeedback(allFeedback);
  const decision = evaluateDecision(overall, config.thresholds);

  return {
    experimentKey: config.experimentKey,
    featureFlag: config.featureFlag,
    rollouts: config.rolloutSchedule,
    personas,
    weeks,
    feedback: allFeedback,
    summary: overall,
    decision,
    thresholds: config.thresholds,
  };
}

module.exports = {
  VARIANTS,
  hashPercent,
  clamp,
  stableAssignment,
  isFlagActiveForUser,
  deterministicNoise,
  buildFeedback,
  summarizeFeedback,
  evaluateDecision,
  runTwoWeekExperiment,
};