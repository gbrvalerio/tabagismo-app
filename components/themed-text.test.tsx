import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(() => '#000000'),
}));

const mockUseThemeColor = useThemeColor as jest.MockedFunction<typeof useThemeColor>;

describe('ThemedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseThemeColor.mockReturnValue('#000000');
  });

  describe('rendering', () => {
    it('should render text content', () => {
      render(<ThemedText>Hello World</ThemedText>);
      expect(screen.getByText('Hello World')).toBeTruthy();
    });

    it('should forward additional text props', () => {
      render(
        <ThemedText testID="custom-text" numberOfLines={2}>
          Props Test
        </ThemedText>
      );
      expect(screen.getByTestId('custom-text')).toBeTruthy();
    });
  });

  describe('type styles', () => {
    it('should apply default type styles with correct fontSize and lineHeight', () => {
      const { toJSON } = render(<ThemedText type="default">Default Text</ThemedText>);
      const textComponent = toJSON();
      const flatStyle = Array.isArray(textComponent?.props.style)
        ? Object.assign({}, ...textComponent.props.style.filter(Boolean))
        : textComponent?.props.style;

      expect(flatStyle.fontSize).toBe(16);
      expect(flatStyle.lineHeight).toBe(24);
    });

    it('should apply title type styles with correct fontSize, fontWeight, and lineHeight', () => {
      const { toJSON } = render(<ThemedText type="title">Title Text</ThemedText>);
      const textComponent = toJSON();
      const flatStyle = Array.isArray(textComponent?.props.style)
        ? Object.assign({}, ...textComponent.props.style.filter(Boolean))
        : textComponent?.props.style;

      expect(flatStyle.fontSize).toBe(32);
      expect(flatStyle.fontWeight).toBe('bold');
      expect(flatStyle.lineHeight).toBe(32);
    });

    it('should apply subtitle type styles with correct fontSize and fontWeight', () => {
      const { toJSON } = render(<ThemedText type="subtitle">Subtitle Text</ThemedText>);
      const textComponent = toJSON();
      const flatStyle = Array.isArray(textComponent?.props.style)
        ? Object.assign({}, ...textComponent.props.style.filter(Boolean))
        : textComponent?.props.style;

      expect(flatStyle.fontSize).toBe(20);
      expect(flatStyle.fontWeight).toBe('bold');
    });

    it('should apply defaultSemiBold type styles with correct fontSize, lineHeight, and fontWeight', () => {
      const { toJSON } = render(<ThemedText type="defaultSemiBold">Semi Bold Text</ThemedText>);
      const textComponent = toJSON();
      const flatStyle = Array.isArray(textComponent?.props.style)
        ? Object.assign({}, ...textComponent.props.style.filter(Boolean))
        : textComponent?.props.style;

      expect(flatStyle.fontSize).toBe(16);
      expect(flatStyle.lineHeight).toBe(24);
      expect(flatStyle.fontWeight).toBe('600');
    });

    it('should apply link type styles with correct lineHeight, fontSize, and color', () => {
      const { toJSON } = render(<ThemedText type="link">Link Text</ThemedText>);
      const textComponent = toJSON();
      const flatStyle = Array.isArray(textComponent?.props.style)
        ? Object.assign({}, ...textComponent.props.style.filter(Boolean))
        : textComponent?.props.style;

      expect(flatStyle.lineHeight).toBe(30);
      expect(flatStyle.fontSize).toBe(16);
      expect(flatStyle.color).toBe('#0a7ea4');
    });

    it('should default to default type when no type is specified', () => {
      const { toJSON } = render(<ThemedText>No Type</ThemedText>);
      const textComponent = toJSON();
      const flatStyle = Array.isArray(textComponent?.props.style)
        ? Object.assign({}, ...textComponent.props.style.filter(Boolean))
        : textComponent?.props.style;

      expect(flatStyle.fontSize).toBe(16);
      expect(flatStyle.lineHeight).toBe(24);
    });
  });

  describe('theme color integration', () => {
    it('should call useThemeColor with lightColor and darkColor props', () => {
      render(
        <ThemedText lightColor="#ffffff" darkColor="#111111">
          Themed Text
        </ThemedText>
      );

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: '#ffffff', dark: '#111111' },
        'text'
      );
    });

    it('should apply the color returned from useThemeColor', () => {
      mockUseThemeColor.mockReturnValue('#FF0000');
      const { toJSON } = render(<ThemedText>Red Text</ThemedText>);
      const textComponent = toJSON();
      const flatStyle = Array.isArray(textComponent?.props.style)
        ? Object.assign({}, ...textComponent.props.style.filter(Boolean))
        : textComponent?.props.style;

      expect(flatStyle.color).toBe('#FF0000');
    });

    it('should call useThemeColor with undefined when no color props provided', () => {
      render(<ThemedText>Default Theme</ThemedText>);

      expect(mockUseThemeColor).toHaveBeenCalledWith(
        { light: undefined, dark: undefined },
        'text'
      );
    });
  });

  describe('custom styles', () => {
    it('should merge custom style props with type styles', () => {
      const { toJSON } = render(
        <ThemedText type="default" style={{ marginTop: 10, fontSize: 20 }}>
          Custom Style
        </ThemedText>
      );
      const textComponent = toJSON();
      const flatStyle = Array.isArray(textComponent?.props.style)
        ? Object.assign({}, ...textComponent.props.style.filter(Boolean))
        : textComponent?.props.style;

      // Custom styles should override type styles
      expect(flatStyle.fontSize).toBe(20);
      expect(flatStyle.marginTop).toBe(10);
    });

    it('should apply custom style last to allow overrides', () => {
      const { toJSON } = render(
        <ThemedText type="title" style={{ fontWeight: 'normal' }}>
          Normal Weight Title
        </ThemedText>
      );
      const textComponent = toJSON();
      const flatStyle = Array.isArray(textComponent?.props.style)
        ? Object.assign({}, ...textComponent.props.style.filter(Boolean))
        : textComponent?.props.style;

      // Custom fontWeight should override title's bold
      expect(flatStyle.fontWeight).toBe('normal');
    });
  });
});
