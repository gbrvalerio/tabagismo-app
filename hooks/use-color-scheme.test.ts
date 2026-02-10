import { useColorScheme } from './use-color-scheme';
import { useColorScheme as rnUseColorScheme } from 'react-native';

describe('useColorScheme', () => {
  describe('re-export verification', () => {
    it('should be the exact same function as react-native useColorScheme', () => {
      // This is the key test - verify we're re-exporting the same reference
      expect(useColorScheme).toBe(rnUseColorScheme);
    });

    it('should be a function with zero parameters', () => {
      expect(typeof useColorScheme).toBe('function');
      expect(useColorScheme.length).toBe(0);
    });
  });

  describe('return value', () => {
    it('should return light, dark, or null', () => {
      const result = useColorScheme();
      expect([null, 'light', 'dark']).toContain(result);
    });
  });

  describe('usage patterns', () => {
    it('should work in a theme selector pattern', () => {
      const scheme = useColorScheme();

      const getThemeColors = (s: typeof scheme) => {
        switch (s) {
          case 'dark':
            return { bg: '#000', text: '#fff' };
          case 'light':
            return { bg: '#fff', text: '#000' };
          default:
            return { bg: '#f5f5f5', text: '#333' };
        }
      };

      const colors = getThemeColors(scheme);
      expect(colors.bg).toBeDefined();
      expect(colors.text).toBeDefined();
    });
  });
});
