import React from 'react';
import { render } from '@testing-library/react-native';

import { CoinCounter } from './CoinCounter';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
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

  it('should render coin icon', () => {
    const { getByTestId } = render(<CoinCounter />);
    expect(getByTestId('coin-icon')).toBeTruthy();
  });

  it('should accept testID prop', () => {
    const { getByTestId } = render(<CoinCounter testID="coin-counter" />);
    expect(getByTestId('coin-counter')).toBeTruthy();
  });

  it('should default to 0 when data is undefined', () => {
    mockUseUserCoins.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });

    const { getByText } = render(<CoinCounter />);
    expect(getByText('0')).toBeTruthy();
  });
});
