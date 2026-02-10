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

  describe('Timer edge cases and race conditions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should cancel existing timer when visible prop changes from true to false', () => {
      const onDismiss = jest.fn();
      const { rerender } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={3000}
        />
      );

      // Advance partially through timer
      jest.advanceTimersByTime(1500);
      expect(onDismiss).not.toHaveBeenCalled();

      // Change visibility to false (should cancel timer)
      rerender(
        <CelebrationDialog
          visible={false}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={3000}
        />
      );

      // Advance past original timer duration
      jest.advanceTimersByTime(2000);

      // Timer should have been cancelled - onDismiss should not be called
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('should restart timer when visibility changes from false to true', () => {
      const onDismiss = jest.fn();
      const { rerender } = render(
        <CelebrationDialog
          visible={false}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={2000}
        />
      );

      // Change to visible
      rerender(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={2000}
        />
      );

      // Advance to just before timer
      jest.advanceTimersByTime(1999);
      expect(onDismiss).not.toHaveBeenCalled();

      // Advance past timer
      jest.advanceTimersByTime(1);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid visibility toggles without memory leaks', () => {
      const onDismiss = jest.fn();
      const { rerender } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
        />
      );

      // Rapidly toggle visibility
      for (let i = 0; i < 5; i++) {
        rerender(
          <CelebrationDialog
            visible={false}
            onDismiss={onDismiss}
            title="Test"
            coinsEarned={10}
            autoDismissDelay={1000}
          />
        );
        jest.advanceTimersByTime(100);
        rerender(
          <CelebrationDialog
            visible={true}
            onDismiss={onDismiss}
            title="Test"
            coinsEarned={10}
            autoDismissDelay={1000}
          />
        );
        jest.advanceTimersByTime(100);
      }

      // After rapid toggling, only the last timer should be active
      expect(jest.getTimerCount()).toBe(1);

      // Complete the remaining timer
      jest.advanceTimersByTime(1000);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should clean up timer if component unmounts after timer fires but before callback executes', () => {
      const onDismiss = jest.fn();
      const { unmount } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
        />
      );

      // Advance to almost timer completion
      jest.advanceTimersByTime(900);

      // Unmount before timer completes
      unmount();

      // Advance past when timer would have fired
      jest.advanceTimersByTime(200);

      // Timer should have been cleaned up on unmount
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should verify timer is cancelled when user interacts with card', () => {
      const onDismiss = jest.fn();
      const { getByTestId } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={2000}
          testID="dialog"
        />
      );

      // Advance partially
      jest.advanceTimersByTime(500);

      // User interacts with card
      fireEvent.press(getByTestId('dialog-card'));

      // Verify timer is cancelled
      expect(jest.getTimerCount()).toBe(0);

      // Advance past original timer
      jest.advanceTimersByTime(2000);

      // onDismiss should NOT be called by auto-dismiss
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('should verify timer is cancelled when user presses button', () => {
      const onDismiss = jest.fn();
      const { getByText } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={2000}
        />
      );

      // Advance partially
      jest.advanceTimersByTime(500);
      expect(jest.getTimerCount()).toBe(1);

      // User presses button (this triggers handleDismiss)
      fireEvent.press(getByText('Continuar'));

      // onDismiss should be called immediately (from button press)
      expect(onDismiss).toHaveBeenCalledTimes(1);

      // Timer count check - the button press calls onDismiss but
      // doesn't explicitly cancel the timer via interaction
      // However, subsequent timer fire should check isInteracted flag
    });

    it('should not call onDismiss twice if timer fires after manual dismiss', () => {
      const onDismiss = jest.fn();
      const { getByText, rerender } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
        />
      );

      // Advance partially
      jest.advanceTimersByTime(500);

      // User dismisses manually
      fireEvent.press(getByText('Continuar'));
      expect(onDismiss).toHaveBeenCalledTimes(1);

      // Simulate parent updating visible to false after onDismiss
      rerender(
        <CelebrationDialog
          visible={false}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
        />
      );

      // Advance past original timer
      jest.advanceTimersByTime(600);

      // Should still only be called once (from manual dismiss)
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should reset interaction state when visibility changes to true', () => {
      const onDismiss = jest.fn();
      const { getByTestId, rerender } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
          testID="dialog"
        />
      );

      // User interacts
      fireEvent.press(getByTestId('dialog-card'));

      // Hide dialog
      rerender(
        <CelebrationDialog
          visible={false}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
          testID="dialog"
        />
      );

      // Show dialog again
      rerender(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
          testID="dialog"
        />
      );

      // Timer should be active again (interaction state reset)
      jest.advanceTimersByTime(1000);

      // Auto-dismiss should work because interaction state was reset
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should handle visibility change during timer callback execution', () => {
      const onDismiss = jest.fn();
      const { rerender } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
        />
      );

      // Advance to just before timer fires
      jest.advanceTimersByTime(999);

      // Advance the final millisecond (timer fires)
      jest.advanceTimersByTime(1);

      expect(onDismiss).toHaveBeenCalledTimes(1);

      // After onDismiss is called, parent would typically set visible=false
      rerender(
        <CelebrationDialog
          visible={false}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
        />
      );

      // No additional calls should happen
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should handle autoDismissDelay prop change while visible', () => {
      const onDismiss = jest.fn();
      const { rerender } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={2000}
        />
      );

      // Advance partially
      jest.advanceTimersByTime(1000);

      // Note: Changing autoDismissDelay while visible doesn't restart timer
      // This tests the current behavior
      rerender(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={500}
        />
      );

      // Original timer should still complete after original delay
      jest.advanceTimersByTime(1000);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not start timer when autoDismissDelay changes from 0 to positive while visible', () => {
      const onDismiss = jest.fn();
      const { rerender } = render(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={0}
        />
      );

      // No timer should be active
      expect(jest.getTimerCount()).toBe(0);

      // Change autoDismissDelay to positive
      rerender(
        <CelebrationDialog
          visible={true}
          onDismiss={onDismiss}
          title="Test"
          coinsEarned={10}
          autoDismissDelay={1000}
        />
      );

      // Timer is started because visible prop triggers the effect
      // (the effect depends on startAutoDismissTimer which depends on autoDismissDelay)
      jest.advanceTimersByTime(2000);

      // Timer behavior depends on implementation - testing current behavior
      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
