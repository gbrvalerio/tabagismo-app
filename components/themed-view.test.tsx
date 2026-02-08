import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemedView } from './themed-view';

import { useThemeColor } from '@/hooks/use-theme-color';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn((props, colorName) => {
    // Return the light color if provided, otherwise return a default
    return props.light || '#FFFFFF';
  }),
}));

describe('ThemedView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children correctly', () => {
    render(
      <ThemedView>
        <Text testID="child-text">Child Content</Text>
      </ThemedView>
    );

    expect(screen.getByTestId('child-text')).toBeTruthy();
    expect(screen.getByText('Child Content')).toBeTruthy();
  });

  it('should render multiple children', () => {
    render(
      <ThemedView>
        <Text testID="child-1">First Child</Text>
        <Text testID="child-2">Second Child</Text>
      </ThemedView>
    );

    expect(screen.getByTestId('child-1')).toBeTruthy();
    expect(screen.getByTestId('child-2')).toBeTruthy();
  });

  it('should call useThemeColor with lightColor and darkColor props', () => {
    render(
      <ThemedView lightColor="#FFFFFF" darkColor="#000000">
        <Text>Content</Text>
      </ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: '#FFFFFF', dark: '#000000' },
      'background'
    );
  });

  it('should call useThemeColor with undefined colors when not provided', () => {
    render(
      <ThemedView>
        <Text>Content</Text>
      </ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: undefined, dark: undefined },
      'background'
    );
  });

  it('should apply the backgroundColor from useThemeColor', () => {
    const testColor = '#FF5733';
    (useThemeColor as jest.Mock).mockReturnValue(testColor);

    const { toJSON } = render(
      <ThemedView>
        <Text>Content</Text>
      </ThemedView>
    );

    const viewInstance = toJSON();
    expect(viewInstance?.props.style).toContainEqual({
      backgroundColor: testColor,
    });
  });

  it('should apply lightColor when provided', () => {
    const lightColor = '#FFFFFF';
    render(
      <ThemedView lightColor={lightColor}>
        <Text>Content</Text>
      </ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: lightColor, dark: undefined },
      'background'
    );
  });

  it('should apply darkColor when provided', () => {
    const darkColor = '#000000';
    render(
      <ThemedView darkColor={darkColor}>
        <Text>Content</Text>
      </ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: undefined, dark: darkColor },
      'background'
    );
  });

  it('should apply both lightColor and darkColor when provided', () => {
    const lightColor = '#FFFFFF';
    const darkColor = '#1A1A1A';
    render(
      <ThemedView lightColor={lightColor} darkColor={darkColor}>
        <Text>Content</Text>
      </ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: lightColor, dark: darkColor },
      'background'
    );
  });

  it('should merge custom styles with backgroundColor', () => {
    const customStyle = { padding: 16, marginTop: 8 };
    const testColor = '#E8E8E8';
    (useThemeColor as jest.Mock).mockReturnValue(testColor);

    const { toJSON } = render(
      <ThemedView style={customStyle}>
        <Text>Content</Text>
      </ThemedView>
    );

    const viewInstance = toJSON();
    expect(viewInstance?.props.style).toEqual([
      { backgroundColor: testColor },
      customStyle,
    ]);
  });

  it('should apply array-based custom styles', () => {
    const customStyles = [{ padding: 10 }, { margin: 5 }];
    const testColor = '#F0F0F0';
    (useThemeColor as jest.Mock).mockReturnValue(testColor);

    const { toJSON } = render(
      <ThemedView style={customStyles}>
        <Text>Content</Text>
      </ThemedView>
    );

    const viewInstance = toJSON();
    expect(viewInstance?.props.style).toEqual([
      { backgroundColor: testColor },
      customStyles,
    ]);
  });

  it('should forward testID prop', () => {
    render(
      <ThemedView testID="themed-view-test">
        <Text>Content</Text>
      </ThemedView>
    );

    expect(screen.getByTestId('themed-view-test')).toBeTruthy();
  });

  it('should forward View props', () => {
    const { getByTestId } = render(
      <ThemedView testID="pressable-view">
        <Text>Pressable Content</Text>
      </ThemedView>
    );

    const view = getByTestId('pressable-view');
    expect(view).toBeTruthy();
  });

  it('should forward accessible prop', () => {
    render(
      <ThemedView testID="accessible-view" accessible={true}>
        <Text>Accessible Content</Text>
      </ThemedView>
    );

    expect(screen.getByTestId('accessible-view')).toBeTruthy();
  });

  it('should forward accessibilityLabel prop', () => {
    render(
      <ThemedView testID="a11y-view" accessibilityLabel="Main Container">
        <Text>Content</Text>
      </ThemedView>
    );

    expect(screen.getByTestId('a11y-view')).toBeTruthy();
  });

  it('should combine backgroundColor with style prop correctly', () => {
    const testColor = '#D4D4D4';
    (useThemeColor as jest.Mock).mockReturnValue(testColor);

    const { toJSON } = render(
      <ThemedView
        style={{ flex: 1, borderRadius: 8 }}
        lightColor="#FFFFFF"
      >
        <Text>Styled Content</Text>
      </ThemedView>
    );

    const viewInstance = toJSON();
    // Style array should have backgroundColor first, then custom styles
    expect(viewInstance?.props.style[0]).toEqual({
      backgroundColor: testColor,
    });
  });

  it('should render without children', () => {
    const { toJSON } = render(<ThemedView />);

    expect(toJSON()).toBeTruthy();
  });

  it('should handle empty children array', () => {
    const { toJSON } = render(
      <ThemedView>
        <Text>Only Child</Text>
      </ThemedView>
    );

    expect(toJSON()).toBeTruthy();
  });

  it('should pass through all unspecified View props', () => {
    const { toJSON } = render(
      <ThemedView
        testID="view-with-props"
        pointerEvents="none"
      >
        <Text>Content</Text>
      </ThemedView>
    );

    expect(toJSON()).toBeTruthy();
  });

  it('should use light theme color when lightColor is provided', () => {
    const lightColor = '#F5F5F5';
    (useThemeColor as jest.Mock).mockImplementation((props) => {
      return props.light || '#FFFFFF';
    });

    render(
      <ThemedView lightColor={lightColor}>
        <Text>Content</Text>
      </ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      expect.objectContaining({ light: lightColor }),
      'background'
    );
  });

  it('should use dark theme color when darkColor is provided', () => {
    const darkColor = '#1F1F1F';
    (useThemeColor as jest.Mock).mockImplementation((props) => {
      return props.dark || '#000000';
    });

    render(
      <ThemedView darkColor={darkColor}>
        <Text>Content</Text>
      </ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      expect.objectContaining({ dark: darkColor }),
      'background'
    );
  });
});
