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

  it('sets up counter position measurement on layout', async () => {
    // Test that counter container has layout handler and ref
    const { getByTestId } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="Title"
        coinsEarned={25}
        testID="dialog"
      />
    );

    const counterContainer = getByTestId('dialog-counter-container');

    // Verify counter container exists and has onLayout prop
    expect(counterContainer).toBeTruthy();
    expect(counterContainer.props.onLayout).toBeDefined();
  });

  it('renders backdrop that fills entire screen width and height', () => {
    const { getByTestId } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="Title"
        coinsEarned={25}
        testID="dialog"
      />
    );

    const backdrop = getByTestId('dialog-backdrop');

    // The overlay should have style properties that make it fill the screen
    // In React Native, flex: 1 alone with centered alignment doesn't work
    // We need explicit width/height or proper parent alignment
    const overlayStyle = backdrop.props.style;
    const flatStyle = Array.isArray(overlayStyle)
      ? Object.assign({}, ...overlayStyle.flat(Infinity))
      : overlayStyle;

    // Check that overlay has either:
    // - width: '100%' AND height: '100%', OR
    // - position: 'absolute' with all edges defined
    const hasFullWidth = flatStyle.width === '100%';
    const hasFullHeight = flatStyle.height === '100%';
    const isAbsoluteFullScreen =
      flatStyle.position === 'absolute' &&
      flatStyle.top === 0 &&
      flatStyle.bottom === 0 &&
      flatStyle.left === 0 &&
      flatStyle.right === 0;

    expect(hasFullWidth && hasFullHeight || isAbsoluteFullScreen).toBe(true);
  });

  describe('CelebrationDialog - Auto-dismiss behavior', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
    });

    it('should not start auto-dismiss timer when autoDismissDelay is 0', () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();

      render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={0}
        />
      );

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      // Should NOT have called onDismiss
      expect(onDismiss).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should not start auto-dismiss timer when autoDismissDelay is undefined', () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();

      render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={undefined}
        />
      );

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      // Should NOT have called onDismiss
      expect(onDismiss).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should start auto-dismiss timer when autoDismissDelay is greater than 0', () => {
      jest.useFakeTimers();
      const onDismiss = jest.fn();

      render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={3000}
        />
      );

      // Fast-forward to just before timer
      jest.advanceTimersByTime(2999);
      expect(onDismiss).not.toHaveBeenCalled();

      // Fast-forward past timer
      jest.advanceTimersByTime(1);
      expect(onDismiss).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });
});
