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
