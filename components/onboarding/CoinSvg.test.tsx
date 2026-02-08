import React from 'react';
import { render } from '@testing-library/react-native';

import { CoinSvg } from './CoinSvg';

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

  it('should render outlined variant with grey colors', () => {
    const { getAllByTestId } = render(<CoinSvg variant="outlined" />);
    const ellipses = getAllByTestId('svg-ellipse');
    expect(ellipses[0].props.fill).toBe('#CCCCCC');
    expect(ellipses[1].props.fill).toBe('#BBBBBB');
  });

  it('should render filled variant with gold colors', () => {
    const { getAllByTestId } = render(<CoinSvg variant="filled" />);
    const ellipses = getAllByTestId('svg-ellipse');
    expect(ellipses[0].props.fill).toBe('#F7A531');
    expect(ellipses[1].props.fill).toBe('#F39119');
  });

  it('should default to filled variant with gold colors', () => {
    const { getAllByTestId } = render(<CoinSvg />);
    const ellipses = getAllByTestId('svg-ellipse');
    expect(ellipses[0].props.fill).toBe('#F7A531');
    expect(ellipses[1].props.fill).toBe('#F39119');
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

  it('should render SVG elements', () => {
    const { getAllByTestId } = render(<CoinSvg />);
    // Should render SVG paths and ellipses
    const paths = getAllByTestId('svg-path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should accept custom testID', () => {
    const { getByTestId } = render(<CoinSvg testID="custom-coin" />);
    expect(getByTestId('custom-coin-container')).toBeTruthy();
  });
});
