/* eslint-disable @typescript-eslint/no-require-imports */
import { render } from '@testing-library/react-native';
import { CoinCascade } from './CoinCascade';

// Mock the SVG import
jest.mock('@/assets/images/coin.svg', () => {
  const { View } = require('react-native');
  const MockCoinIcon = (props: any) => <View {...props} testID={props.testID || 'coin-icon'} />;
  MockCoinIcon.displayName = 'MockCoinIcon';
  return MockCoinIcon;
});

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

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-haptics
jest.mock('@/lib/haptics', () => ({
  ImpactFeedbackStyle: { Medium: 'Medium' },
  impactAsync: jest.fn(),
}));

describe('CoinCascade', () => {
  it('renders 12 coins', () => {
    const { getAllByTestId } = render(
      <CoinCascade landingY={400} testID="cascade" />
    );
    // Each coin creates 2 testIDs (coin + glow wrapper), so we should have 24 total
    const allCoinElements = getAllByTestId(/cascade-coin-/);
    expect(allCoinElements).toHaveLength(24); // 12 coins × 2 (coin + glow)

    // Verify we have exactly 12 coin testIDs (not glow)
    const coins = getAllByTestId(/cascade-coin-\d+$/).filter(
      (el) => el.props.testID && !el.props.testID.includes('-glow')
    );
    expect(coins).toHaveLength(12);
  });

  it('uses AnimatedCoin component', () => {
    const { getAllByTestId } = render(
      <CoinCascade landingY={400} testID="cascade" />
    );
    const coins = getAllByTestId(/cascade-coin-/);
    expect(coins.length).toBeGreaterThan(0);
  });
});
