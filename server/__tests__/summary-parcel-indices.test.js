const summaryWithRules = require('../services/summary-parcel-indices');

describe('summaryWithRules', () => {
  test('should generate summary for high NDVI', () => {
    const indices = {ndvi: 0.80, ndmi: null, ndwi: null, soc: null, nitrogen: null, phosphorus: null, potassium: null, ph: null};
    const result = summaryWithRules(indices);
    expect(result).toContain('NDVI is Very High');
  });

  test('should generate summary for good NDVI', () => {
    const indices = {ndvi: 0.60, ndmi: null, ndwi: null, soc: null, nitrogen: null, phosphorus: null, potassium: null, ph: null};
    const result = summaryWithRules(indices);
    expect(result).toContain('NDVI is Good');
  });

  test('should generate summary for average NDVI', () => {
    const indices = {ndvi: 0.40, ndmi: null, ndwi: null, soc: null, nitrogen: null, phosphorus: null, potassium: null, ph: null};
    const result = summaryWithRules(indices);
    expect(result).toContain('NDVI is Average');
  });

  test('should generate summary for bad NDVI', () => {
    const indices = {ndvi: 0.20, ndmi: null, ndwi: null, soc: null, nitrogen: null, phosphorus: null, potassium: null, ph: null};
    const result = summaryWithRules(indices);
    expect(result).toContain('NDVI is Bad');
  });

  test('should generate summary for good pH', () => {
    const indices = {ndvi: null, ndmi: null, ndwi: null, soc: null, nitrogen: null, phosphorus: null, potassium: null, ph: 6.5};
    const result = summaryWithRules(indices);
    expect(result).toContain('Soil pH is Good/Neutral');
  });

  test('should generate summary for low nitrogen', () => {
    const indices = {ndvi: null, ndmi: null, ndwi: null, soc: null, nitrogen: 0.5, phosphorus: null, potassium: null, ph: null};
    const result = summaryWithRules(indices);
    expect(result).toContain('Nitrogen levels are Low');
  });

  test('should generate summary for multiple indices', () => {
    const indices = {
      ndvi: 0.65,
      ndmi: 0.25,
      ndwi: 0.20,
      soc: 2.0,
      nitrogen: 0.8,
      phosphorus: 0.38,
      potassium: 0.65,
      ph: 6.5
    };
    const result = summaryWithRules(indices);
    expect(result).toContain('NDVI is Good');
    expect(result).toContain('NDMI is Average');
    expect(result).toContain('Nitrogen levels are Adequate');
    expect(result).toContain('Soil pH is Good/Neutral');
  });

  test('should handle null values', () => {
    const indices = {ndvi: null, ndmi: null, ndwi: null, soc: null, nitrogen: null, phosphorus: null, potassium: null, ph: null};
    const result = summaryWithRules(indices);
    expect(result).toBe('');
  });

  test('should format output with periods and newlines', () => {
    const indices = {ndvi: 0.60, ph: 6.5};
    const result = summaryWithRules(indices);
    expect(result).toContain('.\n');
    expect(result.endsWith('.')).toBe(true);
  });
});
