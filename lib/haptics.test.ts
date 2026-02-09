import * as Haptics from './haptics';
import * as ExpoHaptics from 'expo-haptics';

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

  describe('error handling and recovery', () => {
    it('should disable haptics after impactAsync error', async () => {
      // Mock expo-haptics to throw error
      const impactSpy = jest.spyOn(ExpoHaptics, 'impactAsync').mockRejectedValueOnce(new Error('Haptics not available'));

      // First call should trigger error and disable haptics
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      expect(impactSpy).toHaveBeenCalledTimes(1);

      // Second call should return early without calling expo-haptics again
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      expect(impactSpy).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should disable haptics after notificationAsync error', async () => {
      await jest.isolateModulesAsync(async () => {
        const ExpoHapticsModule = require('expo-haptics');
        const HapticsModule = require('./haptics');

        // Mock expo-haptics to throw error
        const notificationSpy = jest.spyOn(ExpoHapticsModule, 'notificationAsync').mockRejectedValueOnce(new Error('Haptics not available'));

        // First call should trigger error and disable haptics
        await HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Success);
        expect(notificationSpy).toHaveBeenCalledTimes(1);

        // Second call should return early without calling expo-haptics again
        await HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Warning);
        expect(notificationSpy).toHaveBeenCalledTimes(1); // Still 1, not called again
      });
    });

    it('should disable haptics after selectionAsync error', async () => {
      await jest.isolateModulesAsync(async () => {
        const ExpoHapticsModule = require('expo-haptics');
        const HapticsModule = require('./haptics');

        // Mock expo-haptics to throw error
        const selectionSpy = jest.spyOn(ExpoHapticsModule, 'selectionAsync').mockRejectedValueOnce(new Error('Haptics not available'));

        // First call should trigger error and disable haptics
        await HapticsModule.selectionAsync();
        expect(selectionSpy).toHaveBeenCalledTimes(1);

        // Second call should return early without calling expo-haptics again
        await HapticsModule.selectionAsync();
        expect(selectionSpy).toHaveBeenCalledTimes(1); // Still 1, not called again
      });
    });
  });
});
