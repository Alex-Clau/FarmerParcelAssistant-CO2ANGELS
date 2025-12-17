const {parseFrequencyToInt} = require('../controllers/report-frequencies-controllers');

describe('parseFrequencyToInt', () => {
  test('should parse "daily" to 1', () => {
    expect(parseFrequencyToInt('daily')).toBe(1);
    expect(parseFrequencyToInt('Daily')).toBe(1);
    expect(parseFrequencyToInt('DAILY')).toBe(1);
  });

  test('should parse "every day" and "each day" to 1', () => {
    expect(parseFrequencyToInt('every day')).toBe(1);
    expect(parseFrequencyToInt('each day')).toBe(1);
  });

  test('should parse "weekly" to 7', () => {
    expect(parseFrequencyToInt('weekly')).toBe(7);
    expect(parseFrequencyToInt('every week')).toBe(7);
  });

  test('should parse "monthly" to 30', () => {
    expect(parseFrequencyToInt('monthly')).toBe(30);
    expect(parseFrequencyToInt('every month')).toBe(30);
  });

  test('should parse "X days" format', () => {
    expect(parseFrequencyToInt('2 days')).toBe(2);
    expect(parseFrequencyToInt('5 days')).toBe(5);
    expect(parseFrequencyToInt('14 days')).toBe(14);
    expect(parseFrequencyToInt('30 days')).toBe(30);
  });

  test('should handle "day" (singular)', () => {
    expect(parseFrequencyToInt('1 day')).toBe(1);
    expect(parseFrequencyToInt('7 day')).toBe(7);
  });

  test('should handle whitespace variations', () => {
    expect(parseFrequencyToInt('  2 days  ')).toBe(2);
    expect(parseFrequencyToInt('  daily  ')).toBe(1);
  });

  test('should return null for invalid frequencies', () => {
    expect(parseFrequencyToInt('days')).toBeNull();
    expect(parseFrequencyToInt('invalid')).toBeNull();
    expect(parseFrequencyToInt('every')).toBeNull();
    expect(parseFrequencyToInt('')).toBeNull();
  });
});
