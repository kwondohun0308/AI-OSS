const crypto = require('crypto');

const DEFAULT_VARIANTS = ['control', 'variant'];

function stableBucket(seed, variantCount) {
  const digest = crypto.createHash('sha256').update(seed).digest();
  return digest.readUInt32BE(0) % variantCount;
}

function assignVariant({ experimentKey, userId, variants = DEFAULT_VARIANTS } = {}) {
  if (!experimentKey) {
    throw new Error('experimentKey is required');
  }

  if (!userId) {
    throw new Error('userId is required');
  }

  const bucket = stableBucket(`${experimentKey}:${userId}`, variants.length);

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

  getEvents() {
    return [...this.events];
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
      accumulator.byTypeAndVariant[event.type] ??= {};
      accumulator.byTypeAndVariant[event.type][variant] = (accumulator.byTypeAndVariant[event.type][variant] || 0) + 1;
      return accumulator;
    }, {
      experimentKey: experimentKey || null,
      total: 0,
      byType: {},
      byVariant: {},
      byTypeAndVariant: {},
    });
  }
}

module.exports = {
  DEFAULT_VARIANTS,
  stableBucket,
  assignVariant,
  EventTracker,
};
