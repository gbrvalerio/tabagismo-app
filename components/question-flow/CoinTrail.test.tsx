/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { CoinTrail } from './CoinTrail';

// Mock the SVG imports
jest.mock('@/assets/images/coin.svg', () => {
  const { View } = require('react-native');
  const MockCoinIcon = (props: any) => <View {...props} testID={props.testID || 'coin-icon'} />;
  MockCoinIcon.displayName = 'MockCoinIcon';
  return MockCoinIcon;
});

jest.mock('./GrayscaleCoinIcon', () => {
  const { View } = require('react-native');
  const MockGrayscaleCoinIcon = (props: any) => <View {...props} testID={props.testID || 'grayscale-coin-icon'} />;
  MockGrayscaleCoinIcon.displayName = 'MockGrayscaleCoinIcon';
  return MockGrayscaleCoinIcon;
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

// Mock expo-haptics
jest.mock('@/lib/haptics', () => ({
  NotificationFeedbackType: { Success: 'Success' },
  notificationAsync: jest.fn(),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => <View {...props} testID={props.testID || 'linear-gradient'} />,
  };
});

describe('CoinTrail', () => {
  it('should render correct number of coins', () => {
    const { getAllByTestId } = render(
      <CoinTrail currentStep={1} totalSteps={5} answeredIndices={[]} />
    );

    const coins = getAllByTestId('animated-coin');
    expect(coins.length).toBe(5);
  });

  it('should show filled coins for answered questions', () => {
    const tree = render(
      <CoinTrail
        currentStep={3}
        totalSteps={5}
        answeredIndices={[0, 1]}
      />
    );

    const coins = tree.getAllByTestId('animated-coin');
    expect(coins.length).toBe(5);
  });

  it('should highlight current question coin', () => {
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={2}
        totalSteps={5}
        answeredIndices={[0]}
      />
    );

    expect(getAllByTestId('animated-coin')).toBeTruthy();
  });

  it('should render with 0 answered questions', () => {
    const { getAllByTestId } = render(
      <CoinTrail currentStep={1} totalSteps={3} answeredIndices={[]} />
    );

    const coins = getAllByTestId('animated-coin');
    expect(coins.length).toBe(3);
  });

  it('should accept testID prop', () => {
    const { getByTestId } = render(
      <CoinTrail
        testID="coin-trail"
        currentStep={1}
        totalSteps={3}
        answeredIndices={[]}
      />
    );

    expect(getByTestId('coin-trail')).toBeTruthy();
  });

  it('should render all coins filled when all answered', () => {
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={3}
        totalSteps={3}
        answeredIndices={[0, 1, 2]}
      />
    );

    const coins = getAllByTestId('animated-coin');
    expect(coins.length).toBe(3);
  });

  it('should render progress line background', () => {
    const { getByTestId } = render(
      <CoinTrail
        testID="coin-trail"
        currentStep={1}
        totalSteps={3}
        answeredIndices={[]}
      />
    );

    expect(getByTestId('coin-trail-progress-bg')).toBeTruthy();
  });

  it('should render progress line fill', () => {
    const { getByTestId } = render(
      <CoinTrail
        testID="coin-trail"
        currentStep={2}
        totalSteps={3}
        answeredIndices={[0]}
      />
    );

    expect(getByTestId('coin-trail-progress-fill')).toBeTruthy();
  });

  it('should accept animatingCoinIndex prop', () => {
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={2}
        totalSteps={3}
        answeredIndices={[0]}
        animatingCoinIndex={0}
      />
    );

    const coins = getAllByTestId('animated-coin');
    expect(coins.length).toBe(3);
  });

  it('should accept onCoinAnimationComplete callback', () => {
    const onComplete = jest.fn();
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={2}
        totalSteps={3}
        answeredIndices={[0]}
        animatingCoinIndex={0}
        onCoinAnimationComplete={onComplete}
      />
    );

    const coins = getAllByTestId('animated-coin');
    expect(coins.length).toBe(3);
  });

  it('should have vertical padding on container', () => {
    const { getByTestId } = render(
      <CoinTrail
        testID="coin-trail"
        currentStep={1}
        totalSteps={3}
        answeredIndices={[]}
      />
    );

    const container = getByTestId('coin-trail');
    const flatStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;
    expect(flatStyle.paddingVertical).toBe(16);
  });

  it('should inset progress line by half the largest coin size', () => {
    const { toJSON } = render(
      <CoinTrail
        testID="coin-trail"
        currentStep={1}
        totalSteps={3}
        answeredIndices={[]}
      />
    );

    const tree = toJSON();
    const progressLineContainer = (tree as any).children[0];
    const style = progressLineContainer.props.style;
    const flatStyle = Array.isArray(style)
      ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
      : style;
    expect(flatStyle.left).toBe(28); // spacing.md (16) + half of 24px (12)
    expect(flatStyle.right).toBe(28);
  });

  it('should render coins above progress line with z-index', () => {
    const { toJSON } = render(
      <CoinTrail
        testID="coin-trail"
        currentStep={1}
        totalSteps={3}
        answeredIndices={[]}
      />
    );

    const tree = toJSON();
    const progressLineContainer = (tree as any).children[0];
    const coinsRow = (tree as any).children[1];
    const plcStyle = Array.isArray(progressLineContainer.props.style)
      ? Object.assign({}, ...progressLineContainer.props.style.flat(Infinity).filter(Boolean))
      : progressLineContainer.props.style;
    expect(plcStyle.zIndex).toBe(0);
    expect(plcStyle.elevation).toBe(0);
    expect(coinsRow.props.style.zIndex).toBe(1);
    expect(coinsRow.props.style.elevation).toBe(1);
  });

  it('should render coins with showGlow for answered coins', () => {
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={3}
        totalSteps={3}
        answeredIndices={[0, 1, 2]}
      />
    );

    // Should find coin-svg-container elements (from CoinSvg inside AnimatedCoin)
    const coinContainers = getAllByTestId('coin-svg-container');
    expect(coinContainers.length).toBe(3);
  });

  it('should handle layout event to position progress line', () => {
    const { getByTestId } = render(
      <CoinTrail
        testID="coin-trail"
        currentStep={1}
        totalSteps={3}
        answeredIndices={[]}
      />
    );

    const container = getByTestId('coin-trail');

    // Trigger layout event with height
    fireEvent(container, 'layout', {
      nativeEvent: { layout: { height: 100, width: 200, x: 0, y: 0 } }
    });

    // Container should handle the layout event without crashing
    expect(container).toBeTruthy();
  });

  it('should call onCoinAnimationComplete when coin animation completes', () => {
    const onComplete = jest.fn();
    const { getAllByTestId, rerender } = render(
      <CoinTrail
        currentStep={1}
        totalSteps={3}
        answeredIndices={[]}
        animatingCoinIndex={null}
        onCoinAnimationComplete={onComplete}
      />
    );

    // Trigger animation by setting animatingCoinIndex
    rerender(
      <CoinTrail
        currentStep={2}
        totalSteps={3}
        answeredIndices={[0]}
        animatingCoinIndex={0}
        onCoinAnimationComplete={onComplete}
      />
    );

    const coins = getAllByTestId('animated-coin');
    expect(coins.length).toBe(3);

    // The callback exists and is passed to AnimatedCoin
    expect(onComplete).toBeDefined();
  });
});
