import * as Haptics from './haptics';

// Simple integration tests - verify the module exports what we need
describe('haptics utility', () => {
  describe('exports', () => {
    it('should export impactAsync function', () => {
      expect(typeof Haptics.impactAsync).toBe('function');
    });

    it('should export notificationAsync function', () => {
      expect(typeof Haptics.notificationAsync).toBe('function');
    });

    it('should export selectionAsync function', () => {
      expect(typeof Haptics.selectionAsync).toBe('function');
    });

    it('should re-export ImpactFeedbackStyle', () => {
      expect(Haptics.ImpactFeedbackStyle).toBeDefined();
      expect(Haptics.ImpactFeedbackStyle.Light).toBeDefined();
      expect(Haptics.ImpactFeedbackStyle.Medium).toBeDefined();
      expect(Haptics.ImpactFeedbackStyle.Heavy).toBeDefined();
    });

    it('should re-export NotificationFeedbackType', () => {
      expect(Haptics.NotificationFeedbackType).toBeDefined();
      expect(Haptics.NotificationFeedbackType.Success).toBeDefined();
      expect(Haptics.NotificationFeedbackType.Warning).toBeDefined();
      expect(Haptics.NotificationFeedbackType.Error).toBeDefined();
    });
  });

  describe('graceful error handling', () => {
    it('should not throw when calling impactAsync', async () => {
      await expect(
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      ).resolves.not.toThrow();
    });

    it('should not throw when calling notificationAsync', async () => {
      await expect(
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      ).resolves.not.toThrow();
    });

    it('should not throw when calling selectionAsync', async () => {
      await expect(Haptics.selectionAsync()).resolves.not.toThrow();
    });

    it('should return undefined from impactAsync', async () => {
      const result = await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      expect(result).toBeUndefined();
    });

    it('should return undefined from notificationAsync', async () => {
      const result = await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      expect(result).toBeUndefined();
    });

    it('should return undefined from selectionAsync', async () => {
      const result = await Haptics.selectionAsync();
      expect(result).toBeUndefined();
    });
  });
});
