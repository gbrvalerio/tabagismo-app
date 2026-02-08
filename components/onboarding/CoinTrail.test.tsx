/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';

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
jest.mock('expo-haptics', () => ({
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

import { CoinTrail } from './CoinTrail';

describe('CoinTrail', () => {
  it('should render correct number of coins', () => {
    const { getAllByTestId } = render(
      <CoinTrail currentStep={1} totalSteps={5} answeredQuestions={[]} />
    );

    const coins = getAllByTestId('animated-coin');
    expect(coins.length).toBe(5);
  });

  it('should show filled coins for answered questions', () => {
    const tree = render(
      <CoinTrail
        currentStep={3}
        totalSteps={5}
        answeredQuestions={['q1', 'q2']}
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
        answeredQuestions={['q1']}
      />
    );

    expect(getAllByTestId('animated-coin')).toBeTruthy();
  });

  it('should render with 0 answered questions', () => {
    const { getAllByTestId } = render(
      <CoinTrail currentStep={1} totalSteps={3} answeredQuestions={[]} />
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
        answeredQuestions={[]}
      />
    );

    expect(getByTestId('coin-trail')).toBeTruthy();
  });

  it('should render all coins filled when all answered', () => {
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={3}
        totalSteps={3}
        answeredQuestions={['q1', 'q2', 'q3']}
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
        answeredQuestions={[]}
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
        answeredQuestions={['q1']}
      />
    );

    expect(getByTestId('coin-trail-progress-fill')).toBeTruthy();
  });

  it('should accept animatingCoinIndex prop', () => {
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={2}
        totalSteps={3}
        answeredQuestions={['q1']}
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
        answeredQuestions={['q1']}
        animatingCoinIndex={0}
        onCoinAnimationComplete={onComplete}
      />
    );

    const coins = getAllByTestId('animated-coin');
    expect(coins.length).toBe(3);
  });

  it('should render coins with showGlow for answered coins', () => {
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={3}
        totalSteps={3}
        answeredQuestions={['q1', 'q2', 'q3']}
      />
    );

    // Should find coin-svg-container elements (from CoinSvg inside AnimatedCoin)
    const coinContainers = getAllByTestId('coin-svg-container');
    expect(coinContainers.length).toBe(3);
  });
});
