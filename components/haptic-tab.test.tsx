import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { HapticTab } from './haptic-tab';

// Unmock HapticTab so we test the real component
jest.unmock('@/components/haptic-tab');

describe('HapticTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render as a Pressable wrapper', () => {
      const { toJSON } = render(<HapticTab testID="haptic-tab" />);
      const component = toJSON();
      expect(component).toBeTruthy();
      expect(screen.getByTestId('haptic-tab')).toBeTruthy();
    });

    it('should render children correctly', () => {
      render(
        <HapticTab>
          <Text testID="child-text">Tab Content</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('child-text')).toBeTruthy();
      expect(screen.getByText('Tab Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      render(
        <HapticTab>
          <View testID="icon" />
          <Text testID="label">Home</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('icon')).toBeTruthy();
      expect(screen.getByTestId('label')).toBeTruthy();
    });
  });

  describe('props forwarding', () => {
    it('should forward style props to underlying Pressable', () => {
      const customStyle = { padding: 10, backgroundColor: '#fff' };
      const { toJSON } = render(<HapticTab style={customStyle} testID="styled-tab" />);
      const component = toJSON();

      expect(component?.props.style).toEqual(customStyle);
    });

    it('should forward disabled prop', () => {
      const onPressMock = jest.fn();
      render(
        <HapticTab disabled={true} onPress={onPressMock} testID="disabled-tab">
          <Text>Disabled</Text>
        </HapticTab>
      );

      // Disabled Pressable should not fire onPress
      fireEvent.press(screen.getByTestId('disabled-tab'));
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('should forward accessibility props', () => {
      const { toJSON } = render(
        <HapticTab
          testID="a11y-tab"
          accessible={true}
          accessibilityLabel="Home Tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: true }}
        />
      );
      const component = toJSON();

      expect(component?.props.accessible).toBe(true);
      expect(component?.props.accessibilityLabel).toBe('Home Tab');
      expect(component?.props.accessibilityRole).toBe('tab');
      expect(component?.props.accessibilityState).toEqual({ selected: true });
    });
  });

  describe('event handlers', () => {
    it('should call onPress when pressed', () => {
      const onPressMock = jest.fn();
      render(
        <HapticTab onPress={onPressMock} testID="pressable-tab">
          <Text>Press Me</Text>
        </HapticTab>
      );

      fireEvent.press(screen.getByTestId('pressable-tab'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should call onPressIn when press starts', () => {
      const onPressInMock = jest.fn();
      render(
        <HapticTab onPressIn={onPressInMock} testID="pressable-tab">
          <Text>Press Me</Text>
        </HapticTab>
      );

      fireEvent(screen.getByTestId('pressable-tab'), 'pressIn');
      expect(onPressInMock).toHaveBeenCalledTimes(1);
    });

    it('should call onPressOut when press ends', () => {
      const onPressOutMock = jest.fn();
      render(
        <HapticTab onPressOut={onPressOutMock} testID="pressable-tab">
          <Text>Press Me</Text>
        </HapticTab>
      );

      fireEvent(screen.getByTestId('pressable-tab'), 'pressOut');
      expect(onPressOutMock).toHaveBeenCalledTimes(1);
    });

    it('should call onLongPress when long pressed', () => {
      const onLongPressMock = jest.fn();
      render(
        <HapticTab onLongPress={onLongPressMock} testID="pressable-tab">
          <Text>Long Press Me</Text>
        </HapticTab>
      );

      fireEvent(screen.getByTestId('pressable-tab'), 'longPress');
      expect(onLongPressMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      render(
        <HapticTab onPress={onPressMock} disabled={true} testID="disabled-tab">
          <Text>Press Me</Text>
        </HapticTab>
      );

      fireEvent.press(screen.getByTestId('disabled-tab'));
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('tab bar integration', () => {
    it('should work as a tab button with icon and label', () => {
      const onPressMock = jest.fn();
      render(
        <HapticTab
          onPress={onPressMock}
          accessibilityRole="tab"
          accessibilityState={{ selected: false }}
          testID="home-tab"
        >
          <View testID="home-icon">
            <Text>🏠</Text>
          </View>
          <Text testID="home-label">Home</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('home-icon')).toBeTruthy();
      expect(screen.getByTestId('home-label')).toBeTruthy();

      fireEvent.press(screen.getByTestId('home-tab'));
      expect(onPressMock).toHaveBeenCalled();
    });

    it('should support multiple tabs side by side', () => {
      const onPress1 = jest.fn();
      const onPress2 = jest.fn();

      render(
        <View>
          <HapticTab
            onPress={onPress1}
            accessibilityRole="tab"
            accessibilityState={{ selected: true }}
            testID="tab-1"
          >
            <Text>Tab 1</Text>
          </HapticTab>
          <HapticTab
            onPress={onPress2}
            accessibilityRole="tab"
            accessibilityState={{ selected: false }}
            testID="tab-2"
          >
            <Text>Tab 2</Text>
          </HapticTab>
        </View>
      );

      fireEvent.press(screen.getByTestId('tab-1'));
      expect(onPress1).toHaveBeenCalledTimes(1);
      expect(onPress2).not.toHaveBeenCalled();

      fireEvent.press(screen.getByTestId('tab-2'));
      expect(onPress2).toHaveBeenCalledTimes(1);
    });
  });

  describe('rerender behavior', () => {
    it('should update children on rerender', () => {
      const { rerender } = render(
        <HapticTab testID="tab">
          <Text testID="content">Initial</Text>
        </HapticTab>
      );

      expect(screen.getByText('Initial')).toBeTruthy();

      rerender(
        <HapticTab testID="tab">
          <Text testID="content">Updated</Text>
        </HapticTab>
      );

      expect(screen.getByText('Updated')).toBeTruthy();
      expect(screen.queryByText('Initial')).toBeNull();
    });

    it('should update handler on rerender', () => {
      const onPress1 = jest.fn();
      const onPress2 = jest.fn();

      const { rerender } = render(
        <HapticTab onPress={onPress1} testID="tab">
          <Text>Tab</Text>
        </HapticTab>
      );

      fireEvent.press(screen.getByTestId('tab'));
      expect(onPress1).toHaveBeenCalledTimes(1);

      rerender(
        <HapticTab onPress={onPress2} testID="tab">
          <Text>Tab</Text>
        </HapticTab>
      );

      fireEvent.press(screen.getByTestId('tab'));
      expect(onPress2).toHaveBeenCalledTimes(1);
      expect(onPress1).toHaveBeenCalledTimes(1); // Should still be 1
    });
  });
});
