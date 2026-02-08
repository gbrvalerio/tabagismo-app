import React from 'react';
import { render } from '@testing-library/react-native';

import { CoinIcon } from './CoinIcon';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('CoinIcon', () => {
  it('should render outlined variant', () => {
    const { getByTestId } = render(
      <CoinIcon size={20} variant="outlined" />
    );

    const coin = getByTestId('coin-icon');
    expect(coin).toBeTruthy();
  });

  it('should render filled variant', () => {
    const { getByTestId } = render(
      <CoinIcon size={20} variant="filled" />
    );

    const coin = getByTestId('coin-icon');
    expect(coin).toBeTruthy();
  });

  it('should apply correct size', () => {
    const { getByTestId } = render(
      <CoinIcon size={32} variant="filled" />
    );

    const coin = getByTestId('coin-icon');
    const flatStyle = Array.isArray(coin.props.style)
      ? Object.assign({}, ...coin.props.style.flat())
      : coin.props.style;
    expect(flatStyle.width).toBe(32);
    expect(flatStyle.height).toBe(32);
  });

  it('should apply correct border radius for circular shape', () => {
    const { getByTestId } = render(
      <CoinIcon size={24} variant="filled" />
    );

    const coin = getByTestId('coin-icon');
    const flatStyle = Array.isArray(coin.props.style)
      ? Object.assign({}, ...coin.props.style.flat())
      : coin.props.style;
    expect(flatStyle.borderRadius).toBe(12); // size / 2
  });

  it('should render without highlighted by default', () => {
    const { getByTestId } = render(
      <CoinIcon size={20} variant="outlined" />
    );

    expect(getByTestId('coin-icon')).toBeTruthy();
  });

  it('should render with highlighted prop', () => {
    const { getByTestId } = render(
      <CoinIcon size={20} variant="filled" highlighted />
    );

    expect(getByTestId('coin-icon')).toBeTruthy();
  });
});
