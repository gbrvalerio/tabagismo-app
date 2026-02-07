import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from './use-theme-color';
import { useColorScheme } from './use-color-scheme';
import { Colors } from '@/constants/theme';

// Mock the useColorScheme hook
jest.mock('./use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('light theme', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should return light color from props when provided in light theme', () => {
      const customLightColor = '#FF0000';
      const { result } = renderHook(() =>
        useThemeColor({ light: customLightColor }, 'text')
      );

      expect(result.current).toBe(customLightColor);
    });

    it('should return default light theme color when no props provided', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should return default light theme color when dark prop is provided but not light', () => {
      const customDarkColor = '#00FF00';
      const { result } = renderHook(() =>
        useThemeColor({ dark: customDarkColor }, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should return light theme tint color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'tint')
      );

      expect(result.current).toBe(Colors.light.tint);
    });

    it('should return light theme background color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'background')
      );

      expect(result.current).toBe(Colors.light.background);
    });

    it('should return light theme icon color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'icon')
      );

      expect(result.current).toBe(Colors.light.icon);
    });

    it('should return light theme tabIconDefault color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'tabIconDefault')
      );

      expect(result.current).toBe(Colors.light.tabIconDefault);
    });

    it('should return light theme tabIconSelected color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'tabIconSelected')
      );

      expect(result.current).toBe(Colors.light.tabIconSelected);
    });

    it('should prefer custom light color over default theme color', () => {
      const customColor = '#ABCDEF';
      const { result } = renderHook(() =>
        useThemeColor({ light: customColor, dark: '#000000' }, 'text')
      );

      expect(result.current).toBe(customColor);
      expect(result.current).not.toBe(Colors.light.text);
    });
  });

  describe('dark theme', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('should return dark color from props when provided in dark theme', () => {
      const customDarkColor = '#00FF00';
      const { result } = renderHook(() =>
        useThemeColor({ dark: customDarkColor }, 'text')
      );

      expect(result.current).toBe(customDarkColor);
    });

    it('should return default dark theme color when no props provided', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.dark.text);
    });

    it('should return default dark theme color when light prop is provided but not dark', () => {
      const customLightColor = '#FF0000';
      const { result } = renderHook(() =>
        useThemeColor({ light: customLightColor }, 'text')
      );

      expect(result.current).toBe(Colors.dark.text);
    });

    it('should return dark theme tint color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'tint')
      );

      expect(result.current).toBe(Colors.dark.tint);
    });

    it('should return dark theme background color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'background')
      );

      expect(result.current).toBe(Colors.dark.background);
    });

    it('should return dark theme icon color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'icon')
      );

      expect(result.current).toBe(Colors.dark.icon);
    });

    it('should return dark theme tabIconDefault color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'tabIconDefault')
      );

      expect(result.current).toBe(Colors.dark.tabIconDefault);
    });

    it('should return dark theme tabIconSelected color', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'tabIconSelected')
      );

      expect(result.current).toBe(Colors.dark.tabIconSelected);
    });

    it('should prefer custom dark color over default theme color', () => {
      const customColor = '#123456';
      const { result } = renderHook(() =>
        useThemeColor({ light: '#FFFFFF', dark: customColor }, 'text')
      );

      expect(result.current).toBe(customColor);
      expect(result.current).not.toBe(Colors.dark.text);
    });
  });

  describe('fallback to light theme', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue(null);
    });

    it('should fallback to light theme when useColorScheme returns null', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should use light color prop when useColorScheme returns null', () => {
      const customLightColor = '#FF0000';
      const { result } = renderHook(() =>
        useThemeColor({ light: customLightColor }, 'text')
      );

      expect(result.current).toBe(customLightColor);
    });

    it('should ignore dark color prop when useColorScheme returns null', () => {
      const customDarkColor = '#00FF00';
      const { result } = renderHook(() =>
        useThemeColor({ dark: customDarkColor }, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
      expect(result.current).not.toBe(customDarkColor);
    });
  });

  describe('undefined colors handling', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('should handle undefined light color gracefully', () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: undefined }, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should handle empty object props gracefully', () => {
      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should handle undefined in both light and dark', () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: undefined, dark: undefined }, 'tint')
      );

      expect(result.current).toBe(Colors.light.tint);
    });
  });

  describe('theme switching', () => {
    it('should return light color when theme changes from dark to light', () => {
      mockUseColorScheme.mockReturnValue('dark');
      const { result, rerender } = renderHook(() =>
        useThemeColor({ light: '#LIGHT', dark: '#DARK' }, 'text')
      );

      expect(result.current).toBe('#DARK');

      mockUseColorScheme.mockReturnValue('light');
      rerender();

      expect(result.current).toBe('#LIGHT');
    });

    it('should return dark color when theme changes from light to dark', () => {
      mockUseColorScheme.mockReturnValue('light');
      const { result, rerender } = renderHook(() =>
        useThemeColor({ light: '#LIGHT', dark: '#DARK' }, 'text')
      );

      expect(result.current).toBe('#LIGHT');

      mockUseColorScheme.mockReturnValue('dark');
      rerender();

      expect(result.current).toBe('#DARK');
    });
  });
});
