const PERSONAS = [
  {
    id: 'analyst-amy',
    name: 'Amy',
    archetype: 'Data Analyst',
    goal: 'Get a reliable dashboard fast',
    friction: 'Needs clear labels and predictable actions',
    bias: { activation: 0.06, satisfaction: 0.35, retention: 0.05, tickets: -0.05 },
  },
  {
    id: 'founder-felix',
    name: 'Felix',
    archetype: 'Startup Founder',
    goal: 'Move quickly without extra meetings',
    friction: 'Skips long setup steps',
    bias: { activation: 0.08, satisfaction: 0.25, retention: 0.08, tickets: -0.02 },
  },
  {
    id: 'ops-olivia',
    name: 'Olivia',
    archetype: 'Operations Manager',
    goal: 'Reduce repetitive manual work',
    friction: 'Sensitive to unstable workflows',
    bias: { activation: 0.04, satisfaction: 0.3, retention: 0.06, tickets: -0.04 },
  },
  {
    id: 'support-sam',
    name: 'Sam',
    archetype: 'Support Lead',
    goal: 'Spot customer issues earlier',
    friction: 'Needs concrete proof before adopting change',
    bias: { activation: 0.02, satisfaction: 0.18, retention: 0.04, tickets: -0.06 },
  },
  {
    id: 'security-sara',
    name: 'Sara',
    archetype: 'Security Reviewer',
    goal: 'Avoid hidden changes and surprises',
    friction: 'Will reject anything opaque',
    bias: { activation: -0.02, satisfaction: 0.05, retention: 0.01, tickets: 0.02 },
  },
  {
    id: 'marketing-mina',
    name: 'Mina',
    archetype: 'Growth Marketer',
    goal: 'Ship experiments with measurable lift',
    friction: 'Wants quick readouts and shareable summaries',
    bias: { activation: 0.1, satisfaction: 0.4, retention: 0.08, tickets: -0.08 },
  },
  {
    id: 'pm-peter',
    name: 'Peter',
    archetype: 'Product Manager',
    goal: 'Align product decisions with signals',
    friction: 'Needs evidence, not vibes',
    bias: { activation: 0.05, satisfaction: 0.28, retention: 0.06, tickets: -0.03 },
  },
  {
    id: 'mobile-maya',
    name: 'Maya',
    archetype: 'Mobile Power User',
    goal: 'Get value from a small screen',
    friction: 'Drops off if the UI is cluttered',
    bias: { activation: 0.07, satisfaction: 0.32, retention: 0.09, tickets: -0.05 },
  },
  {
    id: 'novice-noah',
    name: 'Noah',
    archetype: 'New User',
    goal: 'Understand the product quickly',
    friction: 'Needs guidance and safe defaults',
    bias: { activation: 0.03, satisfaction: 0.2, retention: 0.07, tickets: -0.02 },
  },
  {
    id: 'finance-fiona',
    name: 'Fiona',
    archetype: 'Finance Owner',
    goal: 'Keep spend and risk low',
    friction: 'Sensitive to complexity and unclear ROI',
    bias: { activation: 0.01, satisfaction: 0.14, retention: 0.03, tickets: 0.0 },
  },
];

function getPersonas() {
  return PERSONAS.map((persona) => ({ ...persona }));
}

module.exports = {
  PERSONAS,
  getPersonas,
};