/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';

import { CoinCounter } from './CoinCounter';

// Mock the SVG import
jest.mock('@/assets/images/coin.svg', () => {
  const { View } = require('react-native');
  const MockCoinIcon = (props: any) => <View {...props} testID={props.testID || 'coin-icon'} />;
  MockCoinIcon.displayName = 'MockCoinIcon';
  return MockCoinIcon;
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View {...props} />,
    Svg: (props: any) => <View {...props} testID={props.testID || 'svg'} />,
    G: (props: any) => <View {...props} />,
    Ellipse: (props: any) => <View {...props} />,
    Path: (props: any) => <View {...props} />,
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => <View {...props} testID={props.testID || 'linear-gradient'} />,
  };
});

const mockUseUserCoins = jest.fn();

jest.mock('@/db/repositories', () => ({
  useUserCoins: () => mockUseUserCoins(),
}));

describe('CoinCounter', () => {
  beforeEach(() => {
    mockUseUserCoins.mockReturnValue({
      data: 0,
      isLoading: false,
      isSuccess: true,
    });
  });

  it('should display 0 when no coins', () => {
    const { getByText } = render(<CoinCounter />);
    expect(getByText('0')).toBeTruthy();
  });

  it('should display user coin count', () => {
    mockUseUserCoins.mockReturnValue({
      data: 12,
      isLoading: false,
      isSuccess: true,
    });

    const { getByText } = render(<CoinCounter />);
    expect(getByText('12')).toBeTruthy();
  });

  it('should render CoinSvg instead of emoji', () => {
    const { getByTestId } = render(<CoinCounter />);
    expect(getByTestId('coin-svg-container')).toBeTruthy();
  });

  it('should accept testID prop', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    expect(getByTestId('coin-counter')).toBeTruthy();
  });

  it('should show loading state when data is undefined and loading', () => {
    mockUseUserCoins.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });

    const { getByText } = render(<CoinCounter />);
    expect(getByText('...')).toBeTruthy();
  });

  it('should render with pill gradient container', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    expect(getByTestId('coin-counter-gradient')).toBeTruthy();
  });

  it('should use Poppins Bold for count text', () => {
    const { getByText } = render(<CoinCounter />);
    const countText = getByText('0');
    const flatStyle = Array.isArray(countText.props.style)
      ? Object.assign({}, ...countText.props.style.flat())
      : countText.props.style;
    expect(flatStyle.fontFamily).toBe('Poppins_700Bold');
  });

  it('should render white count text', () => {
    const { getByText } = render(<CoinCounter />);
    const countText = getByText('0');
    const flatStyle = Array.isArray(countText.props.style)
      ? Object.assign({}, ...countText.props.style.flat())
      : countText.props.style;
    expect(flatStyle.color).toBe('#FFFFFF');
  });
});

describe('CoinCounter - Error States', () => {
  beforeEach(() => {
    mockUseUserCoins.mockReset();
  });

  it('should display 0 when useUserCoins returns error', () => {
    mockUseUserCoins.mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: new Error('Failed to fetch coins'),
    });

    const { getByText } = render(<CoinCounter />);
    // When error occurs and data is undefined, it defaults to 0
    expect(getByText('0')).toBeTruthy();
  });

  it('should display loading when isLoading is true with error', () => {
    mockUseUserCoins.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: true,
      error: new Error('Network error'),
    });

    const { getByText } = render(<CoinCounter />);
    expect(getByText('...')).toBeTruthy();
  });

  it('should handle null data gracefully', () => {
    mockUseUserCoins.mockReturnValue({
      data: null,
      isLoading: false,
      isSuccess: false,
    });

    const { getByText } = render(<CoinCounter />);
    // null is displayed as string "null" (the component uses String(coins))
    // This tests that the component doesn't crash when data is null
    expect(getByText('null')).toBeTruthy();
  });

  it('should handle undefined data after loading completes', () => {
    mockUseUserCoins.mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
    });

    const { getByText } = render(<CoinCounter />);
    // undefined coalesces to 0 via default parameter
    expect(getByText('0')).toBeTruthy();
  });

  it('should handle network timeout with loading state', () => {
    mockUseUserCoins.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isFetching: true,
    });

    const { getByText } = render(<CoinCounter />);
    expect(getByText('...')).toBeTruthy();
  });
});

describe('CoinCounter - Animation Behavior', () => {
  beforeEach(() => {
    mockUseUserCoins.mockReset();
  });

  it('should render with animated wrapper for bounce effect', () => {
    mockUseUserCoins.mockReturnValue({
      data: 5,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    const animatedWrapper = getByTestId('coin-counter');
    // Animated.View wraps the component
    expect(animatedWrapper).toBeTruthy();
  });

  it('should display updated count when coins change', () => {
    mockUseUserCoins.mockReturnValue({
      data: 10,
      isLoading: false,
      isSuccess: true,
    });

    const { getByText, rerender } = render(<CoinCounter />);
    expect(getByText('10')).toBeTruthy();

    // Simulate coin count change
    mockUseUserCoins.mockReturnValue({
      data: 15,
      isLoading: false,
      isSuccess: true,
    });

    rerender(<CoinCounter />);
    expect(getByText('15')).toBeTruthy();
  });

  it('should display 0 when transitioning from positive to zero', () => {
    mockUseUserCoins.mockReturnValue({
      data: 5,
      isLoading: false,
      isSuccess: true,
    });

    const { getByText, rerender } = render(<CoinCounter />);
    expect(getByText('5')).toBeTruthy();

    mockUseUserCoins.mockReturnValue({
      data: 0,
      isLoading: false,
      isSuccess: true,
    });

    rerender(<CoinCounter />);
    expect(getByText('0')).toBeTruthy();
  });

  it('should handle large coin values', () => {
    mockUseUserCoins.mockReturnValue({
      data: 9999,
      isLoading: false,
      isSuccess: true,
    });

    const { getByText } = render(<CoinCounter />);
    expect(getByText('9999')).toBeTruthy();
  });

  it('should handle very large coin values', () => {
    mockUseUserCoins.mockReturnValue({
      data: 1000000,
      isLoading: false,
      isSuccess: true,
    });

    const { getByText } = render(<CoinCounter />);
    expect(getByText('1000000')).toBeTruthy();
  });
});

describe('CoinCounter - Styling and Gradient', () => {
  beforeEach(() => {
    mockUseUserCoins.mockReturnValue({
      data: 0,
      isLoading: false,
      isSuccess: true,
    });
  });

  it('should render gradient container with pill shape', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    const gradient = getByTestId('coin-counter-gradient');
    expect(gradient).toBeTruthy();
    // Verify it has the gradient colors prop
    expect(gradient.props.colors).toEqual(['#F7A531', '#F39119']);
  });

  it('should render gradient with horizontal orientation', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    const gradient = getByTestId('coin-counter-gradient');
    expect(gradient.props.start).toEqual({ x: 0, y: 0 });
    expect(gradient.props.end).toEqual({ x: 1, y: 0 });
  });

  it('should render CoinSvg component', () => {
    const { getByTestId } = render(<CoinCounter />);
    expect(getByTestId('coin-svg-container')).toBeTruthy();
  });

  it('should apply pill-shaped border radius to gradient container', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    const gradient = getByTestId('coin-counter-gradient');
    const flatStyle = Array.isArray(gradient.props.style)
      ? Object.assign({}, ...gradient.props.style.flat().filter(Boolean))
      : gradient.props.style;
    expect(flatStyle.borderRadius).toBe(9999);
  });

  it('should apply flexDirection row to gradient container', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    const gradient = getByTestId('coin-counter-gradient');
    const flatStyle = Array.isArray(gradient.props.style)
      ? Object.assign({}, ...gradient.props.style.flat().filter(Boolean))
      : gradient.props.style;
    expect(flatStyle.flexDirection).toBe('row');
  });

  it('should apply alignItems center to gradient container', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    const gradient = getByTestId('coin-counter-gradient');
    const flatStyle = Array.isArray(gradient.props.style)
      ? Object.assign({}, ...gradient.props.style.flat().filter(Boolean))
      : gradient.props.style;
    expect(flatStyle.alignItems).toBe('center');
  });

  it('should apply shadow styling to gradient container', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    const gradient = getByTestId('coin-counter-gradient');
    const flatStyle = Array.isArray(gradient.props.style)
      ? Object.assign({}, ...gradient.props.style.flat().filter(Boolean))
      : gradient.props.style;
    expect(flatStyle.shadowColor).toBe('#F7A531');
    expect(flatStyle.shadowOpacity).toBe(0.3);
    expect(flatStyle.shadowRadius).toBe(8);
    expect(flatStyle.elevation).toBe(4);
  });

  it('should apply correct shadow offset', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    const gradient = getByTestId('coin-counter-gradient');
    const flatStyle = Array.isArray(gradient.props.style)
      ? Object.assign({}, ...gradient.props.style.flat().filter(Boolean))
      : gradient.props.style;
    expect(flatStyle.shadowOffset).toEqual({ width: 0, height: 2 });
  });

  it('should render count text with correct font size', () => {
    const { getByText } = render(<CoinCounter />);
    const countText = getByText('0');
    const flatStyle = Array.isArray(countText.props.style)
      ? Object.assign({}, ...countText.props.style.flat().filter(Boolean))
      : countText.props.style;
    expect(flatStyle.fontSize).toBe(18);
  });
});
