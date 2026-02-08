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

  it('should render emoji coin', () => {
    const { getByText } = render(
      <CoinIcon size={24} variant="filled" />
    );

    expect(getByText('🪙')).toBeTruthy();
  });

  it('should render outlined variant with reduced opacity', () => {
    const { getByText } = render(
      <CoinIcon size={20} variant="outlined" />
    );

    const emoji = getByText('🪙');
    const flatStyle = Array.isArray(emoji.props.style)
      ? Object.assign({}, ...emoji.props.style.flat())
      : emoji.props.style;
    expect(flatStyle.opacity).toBe(0.35);
  });

  it('should render filled variant with full opacity', () => {
    const { getByText } = render(
      <CoinIcon size={20} variant="filled" />
    );

    const emoji = getByText('🪙');
    const flatStyle = Array.isArray(emoji.props.style)
      ? Object.assign({}, ...emoji.props.style.flat())
      : emoji.props.style;
    expect(flatStyle.opacity).toBe(1);
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
