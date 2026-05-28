const {
  stableAssignment,
  isFlagActiveForUser,
  buildFeedback,
  summarizeFeedback,
  evaluateDecision,
  runTwoWeekExperiment,
} = require('../src/experiment');
const { getPersonas } = require('../src/personas');

describe('experiment engine', () => {
  test('stable assignment is deterministic', () => {
    const first = stableAssignment({ experimentKey: 'homepage-cta', userId: 'analyst-amy' });
    const second = stableAssignment({ experimentKey: 'homepage-cta', userId: 'analyst-amy' });

    expect(first.variant).toBe(second.variant);
    expect(['control', 'treatment']).toContain(first.variant);
  });

  test('stable assignment rejects missing inputs', () => {
    expect(() => stableAssignment({ userId: 'analyst-amy' })).toThrow('experimentKey is required');
    expect(() => stableAssignment({ experimentKey: 'homepage-cta' })).toThrow('userId is required');
  });

  test('feature flag respects target users', () => {
    const result = isFlagActiveForUser({
      userId: 'analyst-amy',
      flag: { enabled: false, targetUsers: ['analyst-amy'], rollout: 0 },
    });

    expect(result.active).toBe(true);
    expect(result.targeted).toBe(true);
  });

  test('feedback generation is shaped by the variant', () => {
    const persona = getPersonas()[0];
    const control = buildFeedback(persona, { week: 1, variant: 'control', active: false });
    const treatment = buildFeedback(persona, { week: 1, variant: 'treatment', active: true });

    expect(treatment.satisfaction).toBeGreaterThan(control.satisfaction);
    expect(treatment.activation).toBeGreaterThan(control.activation);
  });

  test('summary and decision are computed from feedback', () => {
    const report = runTwoWeekExperiment();

    expect(report.feedback).toHaveLength(20);
    expect(report.summary.treatment.satisfaction).toBeGreaterThan(report.summary.control.satisfaction);
    expect(report.decision.decision).toBe('Persevere');
    expect(report.decision.rationale).toHaveLength(3);
  });

  test('decision pivots when the lift is too small', () => {
    const summary = {
      control: { activation: 0.5, satisfaction: 3.2, retention: 0.5, supportTickets: 0.2 },
      treatment: { activation: 0.51, satisfaction: 3.25, retention: 0.52, supportTickets: 0.25 },
      lift: { activation: 0.01, satisfaction: 0.05, retention: 0.02, supportTickets: 0.05 },
    };

    const decision = evaluateDecision(summary, {
      minSatisfactionLift: 0.2,
      minActivationLift: 0.05,
      maxTicketDelta: 0.02,
    });

    expect(decision.decision).toBe('Pivot');
  });
});