const classifyIntent = require('../services/classify-intent');

describe('classifyIntent', () => {
  describe('list_parcels intent', () => {
    test('should detect "show me my parcels"', () => {
      const result = classifyIntent('show me my parcels');
      expect(result.type).toBe('list_parcels');
    });

    test('should detect "list parcels"', () => {
      const result = classifyIntent('list parcels');
      expect(result.type).toBe('list_parcels');
    });

    test('should detect "what parcels do I have"', () => {
      const result = classifyIntent('what parcels do I have');
      expect(result.type).toBe('list_parcels');
    });
  });

  describe('parcel_details intent', () => {
    test('should detect "show details for parcel P1"', () => {
      const result = classifyIntent('show details for parcel P1');
      expect(result.type).toBe('parcel_details');
      expect(result.parcelId).toBe('P1');
    });

    test('should detect "tell me about parcel P2"', () => {
      const result = classifyIntent('tell me about parcel P2');
      expect(result.type).toBe('parcel_details');
      expect(result.parcelId).toBe('P2');
    });

    test('should detect lowercase "p1"', () => {
      const result = classifyIntent('information on parcel p1');
      expect(result.type).toBe('parcel_details');
      expect(result.parcelId).toBe('P1');
    });
  });

  describe('parcel_status intent', () => {
    test('should detect "how is parcel P1"', () => {
      const result = classifyIntent('how is parcel P1');
      expect(result.type).toBe('parcel_status');
      expect(result.parcelId).toBe('P1');
    });

    test('should detect "what\'s the status of P2"', () => {
      const result = classifyIntent("what's the status of P2");
      expect(result.type).toBe('parcel_status');
      expect(result.parcelId).toBe('P2');
    });

    test('should detect "give me a summary for P3"', () => {
      const result = classifyIntent('give me a summary for P3');
      expect(result.type).toBe('parcel_status');
      expect(result.parcelId).toBe('P3');
    });
  });

  describe('set_frequency intent', () => {
    test('should detect "set my report frequency to daily"', () => {
      const result = classifyIntent('set my report frequency to daily');
      expect(result.type).toBe('set_frequency');
      expect(result.frequency).toBe('daily');
    });

    test('should detect "set reports every 2 days"', () => {
      const result = classifyIntent('set reports every 2 days');
      expect(result.type).toBe('set_frequency');
      expect(result.frequency).toBe('2 days');
    });

    test('should detect "make reports weekly"', () => {
      const result = classifyIntent('make reports weekly');
      expect(result.type).toBe('set_frequency');
      expect(result.frequency).toBe('weekly');
    });

    test('should detect invalid frequency but still return set_frequency', () => {
      const result = classifyIntent('set my report frequency to days');
      expect(result.type).toBe('set_frequency');
      // regex matches "frequency to" and captures "to" (the word after "frequency")
      expect(result.frequency).toBe('to');
    });
  });

  describe('unknown intent', () => {
    test('should return unknown for unrecognized input', () => {
      const result = classifyIntent('hello world');
      expect(result.type).toBe('unknown');
    });

    test('should return unknown for empty string', () => {
      const result = classifyIntent('');
      expect(result.type).toBe('unknown');
    });
  });
});
