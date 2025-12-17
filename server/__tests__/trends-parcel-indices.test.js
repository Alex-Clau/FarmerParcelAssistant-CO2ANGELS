const trendsParcelIndices = require('../services/trends-parcel-indices');

describe('trendsParcelIndices', () => {
  test('should return empty array for less than 2 indices', () => {
    expect(trendsParcelIndices([])).toEqual([]);
    expect(trendsParcelIndices([{ndvi: 0.5}])).toEqual([]);
  });

  test('should detect NDVI improvement since start', () => {
    const indices = [
      {ndvi: 0.6, nitrogen: null}, // latest
      {ndvi: 0.55, nitrogen: null}, // previous
      {ndvi: 0.3, nitrogen: null}  // oldest
    ];
    const result = trendsParcelIndices(indices);
    expect(result).toContain('NDVI has improved since the start');
  });

  test('should detect NDVI decline since start', () => {
    const indices = [
      {ndvi: 0.3, nitrogen: null}, // latest
      {ndvi: 0.35, nitrogen: null}, // previous
      {ndvi: 0.5, nitrogen: null}  // oldest
    ];
    const result = trendsParcelIndices(indices);
    expect(result).toContain('NDVI has declined since the start');
  });

  test('should detect recent NDVI increase', () => {
    const indices = [
      {ndvi: 0.6, nitrogen: null}, // latest
      {ndvi: 0.5, nitrogen: null}, // previous
      {ndvi: 0.4, nitrogen: null}  // oldest
    ];
    const result = trendsParcelIndices(indices);
    expect(result.some(t => t.includes('NDVI is increasing recently'))).toBe(true);
  });

  test('should detect recent NDVI decrease', () => {
    const indices = [
      {ndvi: 0.4, nitrogen: null}, // latest
      {ndvi: 0.5, nitrogen: null}, // previous
      {ndvi: 0.6, nitrogen: null}  // oldest
    ];
    const result = trendsParcelIndices(indices);
    expect(result.some(t => t.includes('NDVI is decreasing recently'))).toBe(true);
  });

  test('should detect nitrogen decrease over 3 weeks', () => {
    const indices = [
      {ndvi: null, nitrogen: 0.5}, // latest
      {ndvi: null, nitrogen: 0.6}, // previous
      {ndvi: null, nitrogen: 0.7}  // 3 weeks ago
    ];
    const result = trendsParcelIndices(indices);
    expect(result.some(t => t.includes('Nitrogen has decreased over 3 weeks'))).toBe(true);
  });

  test('should detect significant nitrogen decrease since start', () => {
    const indices = [
      {ndvi: null, nitrogen: 0.5}, // latest
      {ndvi: null, nitrogen: 0.6}, // previous
      {ndvi: null, nitrogen: 0.8}  // oldest
    ];
    const result = trendsParcelIndices(indices);
    expect(result.some(t => t.includes('Nitrogen has significantly decreased since the start'))).toBe(true);
  });

  test('should return multiple trends', () => {
    const indices = [
      {ndvi: 0.6, nitrogen: 0.5}, // latest
      {ndvi: 0.5, nitrogen: 0.6}, // previous
      {ndvi: 0.3, nitrogen: 0.8}  // oldest
    ];
    const result = trendsParcelIndices(indices);
    expect(result.length).toBeGreaterThan(1);
    expect(result.some(t => t.includes('NDVI'))).toBe(true);
    expect(result.some(t => t.includes('Nitrogen'))).toBe(true);
  });

  test('should handle null values gracefully', () => {
    const indices = [
      {ndvi: null, nitrogen: null},
      {ndvi: null, nitrogen: null},
      {ndvi: null, nitrogen: null}
    ];
    const result = trendsParcelIndices(indices);
    expect(result).toEqual([]);
  });
});
