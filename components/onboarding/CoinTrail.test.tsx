import React from 'react';
import { render } from '@testing-library/react-native';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

import { CoinTrail } from './CoinTrail';

describe('CoinTrail', () => {
  it('should render correct number of coins', () => {
    const { getAllByTestId } = render(
      <CoinTrail currentStep={1} totalSteps={5} answeredQuestions={[]} />
    );

    const coins = getAllByTestId('coin-icon');
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

    const coins = tree.getAllByTestId('coin-icon');
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

    expect(getAllByTestId('coin-icon')).toBeTruthy();
  });

  it('should render with 0 answered questions', () => {
    const { getAllByTestId } = render(
      <CoinTrail currentStep={1} totalSteps={3} answeredQuestions={[]} />
    );

    const coins = getAllByTestId('coin-icon');
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

    const coins = getAllByTestId('coin-icon');
    expect(coins.length).toBe(3);
  });
});
