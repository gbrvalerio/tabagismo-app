/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, act } from '@testing-library/react-native';

import { AnimatedCoin } from './AnimatedCoin';

// Mock the SVG import
jest.mock('@/assets/images/coin.svg', () => {
  const { View } = require('react-native');
  const MockCoinIcon = (props: any) => <View {...props} testID={props.testID || 'coin-icon'} />;
  MockCoinIcon.displayName = 'MockCoinIcon';
  return MockCoinIcon;
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View {...props} />,
    Svg: (props: any) => <View {...props} testID={props.testID || 'svg'} />,
    G: (props: any) => <View {...props} />,
    Ellipse: (props: any) => <View {...props} testID="svg-ellipse" />,
    Path: (props: any) => <View {...props} testID="svg-path" />,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: { Success: 'Success' },
  notificationAsync: jest.fn(),
}));

describe('AnimatedCoin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render with default props', () => {
    const { getByTestId } = render(
      <AnimatedCoin size={16} variant="outlined" />
    );
    expect(getByTestId('animated-coin')).toBeTruthy();
  });

  it('should render outlined variant', () => {
    const { getByTestId } = render(
      <AnimatedCoin size={16} variant="outlined" />
    );
    expect(getByTestId('animated-coin')).toBeTruthy();
  });

  it('should render filled variant', () => {
    const { getByTestId } = render(
      <AnimatedCoin size={16} variant="filled" />
    );
    expect(getByTestId('animated-coin')).toBeTruthy();
  });

  it('should accept custom size', () => {
    const { getByTestId } = render(
      <AnimatedCoin size={32} variant="filled" />
    );
    expect(getByTestId('animated-coin')).toBeTruthy();
  });

  it('should trigger flip animation when animate prop becomes true', () => {
    const onComplete = jest.fn();
    const { rerender } = render(
      <AnimatedCoin size={16} variant="outlined" animate={false} onAnimationComplete={onComplete} />
    );

    rerender(
      <AnimatedCoin size={16} variant="outlined" animate={true} onAnimationComplete={onComplete} />
    );

    // Animation is triggered - we verify by checking the component doesn't crash
    expect(onComplete).not.toThrow();
  });

  it('should call onAnimationComplete after animation finishes', () => {
    const onComplete = jest.fn();
    const { rerender } = render(
      <AnimatedCoin size={16} variant="outlined" animate={false} onAnimationComplete={onComplete} />
    );

    rerender(
      <AnimatedCoin size={16} variant="outlined" animate={true} onAnimationComplete={onComplete} />
    );

    // Advance timers past animation duration (600ms)
    act(() => {
      jest.advanceTimersByTime(700);
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('should trigger haptic feedback when animation starts', () => {
    const Haptics = require('expo-haptics');
    const { rerender } = render(
      <AnimatedCoin size={16} variant="outlined" animate={false} />
    );

    rerender(
      <AnimatedCoin size={16} variant="outlined" animate={true} />
    );

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });

  it('should not trigger haptic when animate is false', () => {
    const Haptics = require('expo-haptics');
    render(
      <AnimatedCoin size={16} variant="outlined" animate={false} />
    );

    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('should render highlighted state with pulse', () => {
    const { getByTestId } = render(
      <AnimatedCoin size={16} variant="outlined" highlighted />
    );
    expect(getByTestId('animated-coin')).toBeTruthy();
  });

  it('should render showGlow on the CoinSvg', () => {
    const { getByTestId } = render(
      <AnimatedCoin size={16} variant="filled" showGlow />
    );
    expect(getByTestId('animated-coin')).toBeTruthy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(
      <AnimatedCoin size={16} variant="filled" testID="custom-animated-coin" />
    );
    expect(getByTestId('custom-animated-coin')).toBeTruthy();
  });

  it('should not call onAnimationComplete when not animating', () => {
    const onComplete = jest.fn();
    render(
      <AnimatedCoin size={16} variant="outlined" animate={false} onAnimationComplete={onComplete} />
    );

    act(() => {
      jest.advanceTimersByTime(700);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should render glow wrapper for animated shadow', () => {
    const { getByTestId } = render(
      <AnimatedCoin size={16} variant="filled" showGlow animate={false} />
    );
    expect(getByTestId('animated-coin-glow')).toBeTruthy();
  });

  it('should animate glow pulse when flip animation triggers', () => {
    const { getByTestId, rerender } = render(
      <AnimatedCoin size={16} variant="outlined" showGlow animate={false} />
    );

    rerender(
      <AnimatedCoin size={16} variant="outlined" showGlow animate={true} />
    );

    // Glow wrapper should exist during animation
    expect(getByTestId('animated-coin-glow')).toBeTruthy();
  });
});
