const formatDate = require('../services/format-date');

describe('formatDate', () => {
  test('should format Date object correctly', () => {
    const date = new Date('2025-04-22T10:30:00Z');
    expect(formatDate(date)).toBe('2025-04-22');
  });

  test('should format date with single digit month and day', () => {
    const date = new Date('2025-01-05T00:00:00Z');
    expect(formatDate(date)).toBe('2025-01-05');
  });

  test('should handle different dates correctly', () => {
    const date1 = new Date('2025-12-31T00:00:00Z');
    expect(formatDate(date1)).toBe('2025-12-31');

    const date2 = new Date('2024-03-15T00:00:00Z');
    expect(formatDate(date2)).toBe('2024-03-15');
  });

  test('should return empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  test('should return empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  test('should return empty string for non-Date objects', () => {
    expect(formatDate('2025-04-22')).toBe('');
    expect(formatDate(12345)).toBe('');
  });
});
