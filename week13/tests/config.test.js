const { parseBoolean, parseInteger, parsePercent, parseCsv, loadWeek13Config } = require('../src/config');

describe('config helpers', () => {
  test('parses booleans and numbers safely', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('0')).toBe(false);
    expect(parseInteger('42')).toBe(42);
    expect(parsePercent('120')).toBe(100);
    expect(parsePercent('-5')).toBe(0);
  });

  test('parses csv lists', () => {
    expect(parseCsv('a, b, ,c')).toEqual(['a', 'b', 'c']);
  });

  test('loads default week13 config', () => {
    const config = loadWeek13Config({});

    expect(config.userId).toBe('guest');
    expect(config.experimentKey).toBe('homepage-cta');
    expect(config.featureFlag.rollout).toBe(50);
    expect(config.rolloutSchedule).toEqual([20, 60]);
  });
});