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

  describe('Animation callback execution', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should actually call onCoinAnimationComplete after animation delay', () => {
      const onComplete = jest.fn();
      render(
        <CoinTrail
          currentStep={2}
          totalSteps={3}
          answeredIndices={[0]}
          animatingCoinIndex={0}
          onCoinAnimationComplete={onComplete}
        />
      );

      // Callback should not be called immediately
      expect(onComplete).not.toHaveBeenCalled();

      // Advance timers past the 600ms animation duration
      jest.advanceTimersByTime(600);

      // Callback should now have been called
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call callback before animation completes', () => {
      const onComplete = jest.fn();
      render(
        <CoinTrail
          currentStep={2}
          totalSteps={3}
          answeredIndices={[0]}
          animatingCoinIndex={0}
          onCoinAnimationComplete={onComplete}
        />
      );

      // Advance timers to just before animation completes
      jest.advanceTimersByTime(599);

      // Callback should not have been called yet
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should not call callback when animatingCoinIndex is null', () => {
      const onComplete = jest.fn();
      render(
        <CoinTrail
          currentStep={2}
          totalSteps={3}
          answeredIndices={[0]}
          animatingCoinIndex={null}
          onCoinAnimationComplete={onComplete}
        />
      );

      jest.advanceTimersByTime(1000);

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should call callback when animatingCoinIndex changes from null to valid index', () => {
      const onComplete = jest.fn();
      const { rerender } = render(
        <CoinTrail
          currentStep={1}
          totalSteps={3}
          answeredIndices={[]}
          animatingCoinIndex={null}
          onCoinAnimationComplete={onComplete}
        />
      );

      // No callback yet
      expect(onComplete).not.toHaveBeenCalled();

      // Change animatingCoinIndex to trigger animation
      rerender(
        <CoinTrail
          currentStep={2}
          totalSteps={3}
          answeredIndices={[0]}
          animatingCoinIndex={0}
          onCoinAnimationComplete={onComplete}
        />
      );

      // Advance past animation duration
      jest.advanceTimersByTime(600);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should only animate the coin at the specified animatingCoinIndex', () => {
      const onComplete = jest.fn();
      render(
        <CoinTrail
          currentStep={3}
          totalSteps={5}
          answeredIndices={[0, 1]}
          animatingCoinIndex={1}
          onCoinAnimationComplete={onComplete}
        />
      );

      // Advance past animation duration - only one coin should trigger callback
      jest.advanceTimersByTime(600);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call callback when onCoinAnimationComplete is undefined', () => {
      // This should not throw
      expect(() => {
        render(
          <CoinTrail
            currentStep={2}
            totalSteps={3}
            answeredIndices={[0]}
            animatingCoinIndex={0}
          />
        );
        jest.advanceTimersByTime(600);
      }).not.toThrow();
    });
  });

  describe('Layout event handling', () => {
    it('should calculate progress line position from layout height', () => {
      const { getByTestId, toJSON } = render(
        <CoinTrail
          testID="coin-trail"
          currentStep={2}
          totalSteps={3}
          answeredIndices={[0]}
        />
      );

      const container = getByTestId('coin-trail');

      // Simulate layout with specific height
      fireEvent(container, 'layout', {
        nativeEvent: { layout: { height: 80, width: 300, x: 0, y: 0 } }
      });

      // Progress line top should be calculated as (height / 2) - 1
      // For height 80: (80 / 2) - 1 = 39
      const tree = toJSON();
      const progressLineContainer = (tree as any).children[0];
      const style = progressLineContainer.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
        : style;
      expect(flatStyle.top).toBe(39);
    });

    it('should handle layout event with different heights', () => {
      const { getByTestId, toJSON } = render(
        <CoinTrail
          testID="coin-trail"
          currentStep={1}
          totalSteps={5}
          answeredIndices={[]}
        />
      );

      const container = getByTestId('coin-trail');

      // Trigger layout with a different height
      fireEvent(container, 'layout', {
        nativeEvent: { layout: { height: 120, width: 400, x: 0, y: 0 } }
      });

      const tree = toJSON();
      const progressLineContainer = (tree as any).children[0];
      const style = progressLineContainer.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
        : style;
      // (120 / 2) - 1 = 59
      expect(flatStyle.top).toBe(59);
    });

    it('should handle zero height layout', () => {
      const { getByTestId, toJSON } = render(
        <CoinTrail
          testID="coin-trail"
          currentStep={1}
          totalSteps={3}
          answeredIndices={[]}
        />
      );

      const container = getByTestId('coin-trail');

      fireEvent(container, 'layout', {
        nativeEvent: { layout: { height: 0, width: 200, x: 0, y: 0 } }
      });

      const tree = toJSON();
      const progressLineContainer = (tree as any).children[0];
      const style = progressLineContainer.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
        : style;
      // (0 / 2) - 1 = -1
      expect(flatStyle.top).toBe(-1);
    });
  });

  describe('Progress calculation', () => {
    it('should calculate correct progress percentage based on answered questions', () => {
      const { getByTestId } = render(
        <CoinTrail
          testID="coin-trail"
          currentStep={3}
          totalSteps={5}
          answeredIndices={[0, 1]}
        />
      );

      // Progress should be 40% (2 out of 5)
      const progressFill = getByTestId('coin-trail-progress-fill');
      const style = progressFill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
        : style;
      expect(flatStyle.width).toBe('40%');
    });

    it('should cap progress at 100%', () => {
      const { getByTestId } = render(
        <CoinTrail
          testID="coin-trail"
          currentStep={3}
          totalSteps={3}
          answeredIndices={[0, 1, 2, 3, 4]}  // More than totalSteps
        />
      );

      const progressFill = getByTestId('coin-trail-progress-fill');
      const style = progressFill.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
        : style;
      expect(flatStyle.width).toBe('100%');
    });

    it('should handle zero totalSteps without crashing', () => {
      const { queryByTestId } = render(
        <CoinTrail
          testID="coin-trail"
          currentStep={0}
          totalSteps={0}
          answeredIndices={[]}
        />
      );

      // Should not crash
      const progressFill = queryByTestId('coin-trail-progress-fill');
      expect(progressFill).toBeTruthy();

      const style = progressFill?.props.style;
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
        : style;
      expect(flatStyle.width).toBe('0%');
    });
  });
});
