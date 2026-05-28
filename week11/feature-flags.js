const crypto = require('crypto');

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

function hashPercent(seed) {
  const digest = crypto.createHash('sha256').update(seed).digest();
  return digest.readUInt32BE(0) % 100;
}

function isTargetUser(userId, targetUsers) {
  return targetUsers.includes(String(userId));
}

function resolveFlagValue(env, primaryKey, fallbackKey) {
  if (env[primaryKey] !== undefined) {
    return env[primaryKey];
  }

  return fallbackKey ? env[fallbackKey] : undefined;
}

function resolveTargetUsers(env, primaryKey, fallbackKey) {
  return [...new Set(parseCsv(resolveFlagValue(env, primaryKey, fallbackKey)).map(String))];
}

function buildFlagResult({ enabled, reason, rolloutPercent = 0, targets = [], bucket = null }) {
  return {
    enabled,
    reason,
    rolloutPercent,
    targets,
    bucket,
  };
}

function evaluateFeatureFlags({ userId = 'guest', env = process.env } = {}) {
  const newNavigationTargets = resolveTargetUsers(env, 'FEATURE_TARGET_USERS', 'FEATURE_NEW_CHECKOUT_USERS');
  const betaProfileTargets = resolveTargetUsers(env, 'FEATURE_BETA_USERS', 'FEATURE_BETA_PROFILE_USERS');
  const trialBadgeTargets = resolveTargetUsers(env, 'FEATURE_TRIAL_USERS', null);

  const newNavigationDefault = parseBoolean(resolveFlagValue(env, 'FEATURE_NEW_NAV_ENABLED', 'FEATURE_NEW_CHECKOUT_DEFAULT'), false);
  const betaProfileRollout = parseInteger(resolveFlagValue(env, 'FEATURE_BETA_PROFILE_ROLLOUT', null), 0);
  const trialBadgeRollout = parseInteger(resolveFlagValue(env, 'FEATURE_TRIAL_BADGE_ROLLOUT', null), 0);

  const newNavigationTargeted = isTargetUser(userId, newNavigationTargets);
  const betaProfileTargeted = isTargetUser(userId, betaProfileTargets);
  const trialBadgeTargeted = isTargetUser(userId, trialBadgeTargets);

  const betaProfileBucket = betaProfileRollout > 0 ? hashPercent(`${userId}:betaProfile`) : null;
  const trialBadgeBucket = trialBadgeRollout > 0 ? hashPercent(`${userId}:trialBadge`) : null;

  return {
    newNavigation: buildFlagResult({
      enabled: newNavigationDefault || newNavigationTargeted,
      reason: newNavigationTargeted ? 'target-user' : newNavigationDefault ? 'environment' : 'disabled',
      targets: newNavigationTargets,
    }),
    betaProfile: buildFlagResult({
      enabled: betaProfileTargeted || (betaProfileRollout > 0 && betaProfileBucket < betaProfileRollout),
      reason: betaProfileTargeted ? 'target-user' : betaProfileRollout > 0 ? 'rollout' : 'disabled',
      rolloutPercent: betaProfileRollout,
      targets: betaProfileTargets,
      bucket: betaProfileBucket,
    }),
    trialBadge: buildFlagResult({
      enabled: trialBadgeTargeted || (trialBadgeRollout > 0 && trialBadgeBucket < trialBadgeRollout),
      reason: trialBadgeTargeted ? 'target-user' : trialBadgeRollout > 0 ? 'rollout' : 'disabled',
      rolloutPercent: trialBadgeRollout,
      targets: trialBadgeTargets,
      bucket: trialBadgeBucket,
    }),
  };
}

module.exports = {
  parseBoolean,
  parseInteger,
  parseCsv,
  hashPercent,
  isTargetUser,
  evaluateFeatureFlags,
};
