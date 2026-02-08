import React from 'react';
import { render } from '@testing-library/react-native';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

import { CoinBurstAnimation } from './CoinBurstAnimation';

describe('CoinBurstAnimation', () => {
  it('should not render when not visible', () => {
    const { queryByTestId } = render(
      <CoinBurstAnimation isVisible={false} onComplete={() => {}} />
    );

    expect(queryByTestId('coin-burst')).toBeNull();
  });

  it('should render when visible', () => {
    const { getByTestId } = render(
      <CoinBurstAnimation isVisible={true} onComplete={() => {}} />
    );

    expect(getByTestId('coin-burst')).toBeTruthy();
  });

  it('should call onComplete after animation', () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();

    render(<CoinBurstAnimation isVisible={true} onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    jest.advanceTimersByTime(800);
    expect(onComplete).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('should not call onComplete when not visible', () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();

    render(<CoinBurstAnimation isVisible={false} onComplete={onComplete} />);

    jest.advanceTimersByTime(1000);
    expect(onComplete).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should render coin icon when visible', () => {
    const { getByTestId } = render(
      <CoinBurstAnimation isVisible={true} onComplete={() => {}} />
    );

    expect(getByTestId('coin-icon')).toBeTruthy();
  });
});
