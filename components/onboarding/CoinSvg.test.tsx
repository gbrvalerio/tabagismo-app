/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render } from '@testing-library/react-native';

import { CoinSvg } from './CoinSvg';

// Mock the SVG import
jest.mock('@/assets/images/coin.svg', () => {
  const { View } = require('react-native');
  const MockCoinIcon = (props: any) => <View {...props} testID={props.testID || 'coin-icon'} />;
  MockCoinIcon.displayName = 'MockCoinIcon';
  return MockCoinIcon;
});

describe('CoinSvg', () => {
  it('should render with default size', () => {
    const { getByTestId } = render(<CoinSvg />);
    const coin = getByTestId('coin-svg');
    expect(coin).toBeTruthy();
  });

  it('should render with custom size', () => {
    const { getByTestId } = render(<CoinSvg size={32} />);
    const coin = getByTestId('coin-svg');
    expect(coin).toBeTruthy();
  });

  it('should apply correct dimensions from size prop', () => {
    const { getByTestId } = render(<CoinSvg size={48} />);
    const svg = getByTestId('coin-svg');
    expect(svg.props.width).toBe(48);
    expect(svg.props.height).toBe(48);
  });

  it('should use default size of 24', () => {
    const { getByTestId } = render(<CoinSvg />);
    const svg = getByTestId('coin-svg');
    expect(svg.props.width).toBe(24);
    expect(svg.props.height).toBe(24);
  });

  it('should render outlined variant with reduced opacity', () => {
    const { getByTestId } = render(<CoinSvg variant="outlined" />);
    const svg = getByTestId('coin-svg');
    const svgStyle = svg.props.style;
    expect(svgStyle.opacity).toBe(0.35);
  });

  it('should render filled variant with full opacity', () => {
    const { getByTestId } = render(<CoinSvg variant="filled" />);
    const svg = getByTestId('coin-svg');
    const svgStyle = svg.props.style;
    expect(svgStyle).toBeUndefined();
  });

  it('should default to filled variant with full opacity', () => {
    const { getByTestId } = render(<CoinSvg />);
    const svg = getByTestId('coin-svg');
    const svgStyle = svg.props.style;
    expect(svgStyle).toBeUndefined();
  });

  it('should apply glow shadow when showGlow is true', () => {
    const { getByTestId } = render(<CoinSvg showGlow />);
    const container = getByTestId('coin-svg-container');
    const flatStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.flat())
      : container.props.style;
    expect(flatStyle.shadowColor).toBe('#F7A531');
    expect(flatStyle.shadowRadius).toBe(4);
    expect(flatStyle.shadowOpacity).toBe(0.4);
  });

  it('should not apply glow shadow when showGlow is false', () => {
    const { getByTestId } = render(<CoinSvg showGlow={false} />);
    const container = getByTestId('coin-svg-container');
    const flatStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.flat())
      : container.props.style;
    expect(flatStyle.shadowColor).toBeUndefined();
  });

  it('should not show glow by default', () => {
    const { getByTestId } = render(<CoinSvg />);
    const container = getByTestId('coin-svg-container');
    const flatStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.flat())
      : container.props.style;
    expect(flatStyle.shadowColor).toBeUndefined();
  });

  it('should render SVG component', () => {
    const { getByTestId } = render(<CoinSvg />);
    const svg = getByTestId('coin-svg');
    expect(svg).toBeTruthy();
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(<CoinSvg testID="custom-coin" />);
    expect(getByTestId('custom-coin-container')).toBeTruthy();
    expect(getByTestId('custom-coin')).toBeTruthy();
  });
});
