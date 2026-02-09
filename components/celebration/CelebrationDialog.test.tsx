/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CelebrationDialog } from './CelebrationDialog';

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

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => <View {...props} />,
  };
});

// Mock expo-haptics
jest.mock('@/lib/haptics', () => ({
  NotificationFeedbackType: { Success: 'Success' },
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
}));

describe('CelebrationDialog', () => {
  it('renders when visible is true', () => {
    const { getByText } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="5 Dias Sem Fumar!"
        coinsEarned={25}
      />
    );
    expect(getByText('5 Dias Sem Fumar!')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <CelebrationDialog
        visible={false}
        onDismiss={() => {}}
        title="5 Dias Sem Fumar!"
        coinsEarned={25}
      />
    );
    expect(queryByText('5 Dias Sem Fumar!')).toBeNull();
  });

  it('displays subtitle when provided', () => {
    const { getByText } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="Title"
        subtitle="Continue assim!"
        coinsEarned={10}
      />
    );
    expect(getByText('Continue assim!')).toBeTruthy();
  });

  it('calls onDismiss when button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Title"
        coinsEarned={10}
      />
    );

    fireEvent.press(getByText('Continuar'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('calls onDismiss when overlay is tapped', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Title"
        coinsEarned={10}
        testID="dialog"
      />
    );

    fireEvent.press(getByTestId('dialog-overlay'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('auto-dismisses after specified delay', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Title"
        coinsEarned={10}
        autoDismissDelay={1000}
      />
    );

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('cancels auto-dismiss when user interacts with modal card', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    const { getByTestId } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Title"
        coinsEarned={10}
        autoDismissDelay={1000}
        testID="dialog"
      />
    );

    fireEvent.press(getByTestId('dialog-card'));
    jest.advanceTimersByTime(1000);

    expect(onDismiss).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('cleans up timer on unmount', () => {
    jest.useFakeTimers();
    const { unmount } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="Title"
        coinsEarned={10}
      />
    );

    unmount();

    // Should not crash
    expect(jest.getTimerCount()).toBe(0);

    jest.useRealTimers();
  });

  it('handles zero coins', () => {
    const { getByTestId } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="Title"
        coinsEarned={0}
        testID="dialog"
      />
    );
    expect(getByTestId('dialog-counter')).toBeTruthy();
  });

  it('handles large coin values', () => {
    const { getByTestId } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="Title"
        coinsEarned={999}
        testID="dialog"
      />
    );
    expect(getByTestId('dialog-counter')).toBeTruthy();
  });

  it('handles visibility change from true to false', () => {
    const { rerender, queryByText } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="Title"
        coinsEarned={10}
      />
    );
    expect(queryByText('Title')).toBeTruthy();

    rerender(
      <CelebrationDialog
        visible={false}
        onDismiss={() => {}}
        title="Title"
        coinsEarned={10}
      />
    );
    expect(queryByText('Title')).toBeNull();
  });

  it('auto-dismisses only when not interacted with', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Title"
        coinsEarned={10}
        autoDismissDelay={1000}
        testID="dialog"
      />
    );

    // Don't interact, let timer run
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });
});
