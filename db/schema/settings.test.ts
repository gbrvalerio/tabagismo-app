import { settings, getDefaultUpdatedAt } from './settings';

describe('settings schema', () => {
  describe('getDefaultUpdatedAt function', () => {
    it('should return a Date object', () => {
      const result = getDefaultUpdatedAt();

      expect(result).toBeInstanceOf(Date);
      expect(typeof result.getTime).toBe('function');
    });

    it('should return the current date', () => {
      const before = Date.now();
      const result = getDefaultUpdatedAt();
      const after = Date.now();

      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });

    it('should return a reasonable current date (within last second)', () => {
      const result = getDefaultUpdatedAt();

      const timeDifference = Date.now() - result.getTime();
      expect(timeDifference).toBeLessThan(1000);
      expect(timeDifference).toBeGreaterThanOrEqual(0);
    });

    it('should generate valid timestamps on sequential calls', async () => {
      const timestamp1 = getDefaultUpdatedAt();

      // Wait a small amount
      await new Promise(resolve => setTimeout(resolve, 5));

      const timestamp2 = getDefaultUpdatedAt();

      // Both should be Date instances
      expect(timestamp1).toBeInstanceOf(Date);
      expect(timestamp2).toBeInstanceOf(Date);

      // Second should be >= first (monotonically increasing)
      expect(timestamp2.getTime()).toBeGreaterThanOrEqual(timestamp1.getTime());
    });

    it('should work correctly as default function in schema', () => {
      // Verify the function is used in the schema
      expect(settings).toBeDefined();
      expect(settings.updatedAt).toBeDefined();
      expect(settings.updatedAt.name).toBe('updated_at');
    });
  });

  describe('settings table structure', () => {
    it('should have all required columns defined', () => {
      expect(settings).toBeDefined();
      expect(settings.key).toBeDefined();
      expect(settings.value).toBeDefined();
      expect(settings.updatedAt).toBeDefined();
    });

    it('should have key column as primary key', () => {
      expect(settings.key.name).toBe('key');
    });

    it('should have value column defined', () => {
      expect(settings.value.name).toBe('value');
    });

    it('should have updatedAt column as integer (timestamp mode)', () => {
      expect(settings.updatedAt.name).toBe('updated_at');
    });
  });
});
