// Mock the llm-service
jest.mock('../services/llm/llm-service', () => jest.fn());

const llmClassifyIntent = require('../services/llm/llm-classify-intent');
const llmService = require('../services/llm/llm-service');

describe('llmClassifyIntent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should normalize parcelId with lowercase p', async () => {
    llmService.mockResolvedValue('{"type": "parcel_status", "parcelId": "p1"}');
    
    const result = await llmClassifyIntent('status p1');
    
    expect(result.parcelId).toBe('P1');
  });

  test('should normalize parcelId with uppercase P', async () => {
    llmService.mockResolvedValue('{"type": "parcel_status", "parcelId": "P2"}');
    
    const result = await llmClassifyIntent('status P2');
    
    expect(result.parcelId).toBe('P2');
  });

  test('should normalize parcelId without P prefix', async () => {
    llmService.mockResolvedValue('{"type": "parcel_status", "parcelId": "1"}');
    
    const result = await llmClassifyIntent('status 1');
    
    expect(result.parcelId).toBe('P1');
  });

  test('should return null when llmService fails', async () => {
    llmService.mockResolvedValue(null);
    
    const result = await llmClassifyIntent('test');
    
    expect(result).toBeNull();
  });

  test('should parse valid JSON response', async () => {
    llmService.mockResolvedValue('{"type": "list_parcels"}');
    
    const result = await llmClassifyIntent('show parcels');
    
    expect(result.type).toBe('list_parcels');
  });

  test('should handle set_frequency intent', async () => {
    llmService.mockResolvedValue('{"type": "set_frequency", "frequency": "daily"}');
    
    const result = await llmClassifyIntent('set frequency to daily');
    
    expect(result.type).toBe('set_frequency');
    expect(result.frequency).toBe('daily');
  });
});
