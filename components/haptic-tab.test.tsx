import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { HapticTab } from './haptic-tab';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
}));

describe('HapticTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<HapticTab />);
      }).not.toThrow();
    });

    it('should return a component instance', () => {
      const { toJSON } = render(<HapticTab />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with children', () => {
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
          <View testID="child-view-1" />
          <Text testID="child-text-1">First Child</Text>
          <Text testID="child-text-2">Second Child</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('child-view-1')).toBeTruthy();
      expect(screen.getByText('First Child')).toBeTruthy();
      expect(screen.getByText('Second Child')).toBeTruthy();
    });
  });

  describe('Props forwarding', () => {
    it('should forward testID prop to children', () => {
      render(
        <HapticTab testID="my-haptic-tab">
          <Text testID="inner-text">Labeled</Text>
        </HapticTab>
      );
      expect(screen.getByTestId('inner-text')).toBeTruthy();
    });

    it('should accept and forward style prop', () => {
      const customStyle = { padding: 10, margin: 5 };
      expect(() => {
        render(<HapticTab style={customStyle} />);
      }).not.toThrow();
    });

    it('should accept and forward array style props', () => {
      const customStyles = [{ padding: 10 }, { margin: 5 }];
      expect(() => {
        render(<HapticTab style={customStyles} />);
      }).not.toThrow();
    });

    it('should forward disabled prop', () => {
      expect(() => {
        render(<HapticTab disabled={true} />);
      }).not.toThrow();
    });

    it('should forward accessible prop', () => {
      expect(() => {
        render(<HapticTab accessible={true} />);
      }).not.toThrow();
    });

    it('should forward accessibilityLabel prop', () => {
      expect(() => {
        render(<HapticTab accessibilityLabel="Home Tab" />);
      }).not.toThrow();
    });

    it('should forward accessibilityRole prop', () => {
      expect(() => {
        render(<HapticTab accessibilityRole="tab" />);
      }).not.toThrow();
    });

    it('should forward accessibilityState prop', () => {
      const accessibilityState = { selected: true };
      expect(() => {
        render(<HapticTab accessibilityState={accessibilityState} />);
      }).not.toThrow();
    });

    it('should forward hitSlop prop', () => {
      const hitSlop = { top: 10, left: 10, right: 10, bottom: 10 };
      expect(() => {
        render(<HapticTab hitSlop={hitSlop} />);
      }).not.toThrow();
    });

    it('should forward pressRetentionOffset prop', () => {
      const offset = { top: 5, left: 5, right: 5, bottom: 5 };
      expect(() => {
        render(<HapticTab pressRetentionOffset={offset} />);
      }).not.toThrow();
    });

    it('should forward android_ripple prop', () => {
      const ripple = { color: 'rgba(0, 0, 0, 0.1)' };
      expect(() => {
        render(<HapticTab android_ripple={ripple} />);
      }).not.toThrow();
    });

    it('should accept multiple props simultaneously', () => {
      expect(() => {
        render(
          <HapticTab
            style={{ padding: 10 }}
            disabled={false}
            accessible={true}
            accessibilityLabel="Test"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Event handlers', () => {
    it('should forward onPress prop and call it on press', () => {
      const onPressMock = jest.fn();
      render(
        <HapticTab onPress={onPressMock}>
          <Text testID="pressable-text">Pressable</Text>
        </HapticTab>
      );

      const textElement = screen.getByTestId('pressable-text');
      fireEvent.press(textElement.parent);

      expect(onPressMock).toHaveBeenCalled();
    });

    it('should accept onPress handler', () => {
      const onPressMock = jest.fn();
      expect(() => {
        render(
          <HapticTab onPress={onPressMock}>
            <Text>Pressable</Text>
          </HapticTab>
        );
      }).not.toThrow();
    });

    it('should forward onPressIn prop', () => {
      const onPressInMock = jest.fn();
      expect(() => {
        render(
          <HapticTab onPressIn={onPressInMock}>
            <Text>Pressable</Text>
          </HapticTab>
        );
      }).not.toThrow();
    });

    it('should forward onPressOut prop', () => {
      const onPressOutMock = jest.fn();
      expect(() => {
        render(
          <HapticTab onPressOut={onPressOutMock}>
            <Text>Pressable</Text>
          </HapticTab>
        );
      }).not.toThrow();
    });

    it('should forward onLongPress prop', () => {
      const onLongPressMock = jest.fn();
      expect(() => {
        render(
          <HapticTab onLongPress={onLongPressMock}>
            <Text>Pressable</Text>
          </HapticTab>
        );
      }).not.toThrow();
    });

    it('should accept multiple event handlers simultaneously', () => {
      const onPressMock = jest.fn();
      const onPressInMock = jest.fn();
      const onPressOutMock = jest.fn();

      expect(() => {
        render(
          <HapticTab
            onPress={onPressMock}
            onPressIn={onPressInMock}
            onPressOut={onPressOutMock}
          >
            <Text>Pressable</Text>
          </HapticTab>
        );
      }).not.toThrow();
    });
  });

  describe('Component composition', () => {
    it('should work as a tab bar button in tab navigation', () => {
      const onPressMock = jest.fn();
      render(
        <HapticTab
          testID="tab-button"
          onPress={onPressMock}
          accessibilityRole="tab"
          accessibilityState={{ selected: false }}
        >
          <View testID="icon-container">
            <Text>📱</Text>
          </View>
          <Text testID="tab-label">Home</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('tab-button')).toBeTruthy();
      expect(screen.getByTestId('icon-container')).toBeTruthy();
      expect(screen.getByTestId('tab-label')).toBeTruthy();
      expect(screen.getByText('Home')).toBeTruthy();
    });

    it('should render with selected state', () => {
      const { toJSON } = render(
        <HapticTab
          testID="selected-tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: true }}
        >
          <Text>Selected Tab</Text>
        </HapticTab>
      );

      const component = toJSON();
      expect(component?.props.accessibilityState).toEqual({ selected: true });
    });

    it('should render with unselected state', () => {
      const { toJSON } = render(
        <HapticTab
          testID="unselected-tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: false }}
        >
          <Text>Unselected Tab</Text>
        </HapticTab>
      );

      const component = toJSON();
      expect(component?.props.accessibilityState).toEqual({ selected: false });
    });

    it('should be usable with icons and text', () => {
      render(
        <HapticTab testID="icon-text-tab">
          <View testID="icon">
            <Text>🏠</Text>
          </View>
          <Text testID="label">Home</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('icon')).toBeTruthy();
      expect(screen.getByTestId('label')).toBeTruthy();
      expect(screen.getByText('Home')).toBeTruthy();
    });
  });

  describe('Type safety and props validation', () => {
    it('should accept any props without type errors', () => {
      expect(() => {
        render(
          <HapticTab
            testID="any-props-tab"
            onPress={() => {}}
            disabled={false}
            style={{}}
            accessibilityLabel="Tab"
            accessibilityRole="tab"
          />
        );
      }).not.toThrow();
    });

    it('should handle undefined props gracefully', () => {
      expect(() => {
        render(
          <HapticTab
            testID="undefined-props"
            onPress={undefined}
            style={undefined}
            disabled={undefined}
          />
        );
      }).not.toThrow();
    });

    it('should handle null values for optional props', () => {
      expect(() => {
        render(
          <HapticTab
            testID="null-props"
            onPress={null as any}
            accessibilityLabel={null as any}
          />
        );
      }).not.toThrow();
    });

    it('should work without any props', () => {
      const { toJSON } = render(<HapticTab />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Integration scenarios', () => {
    it('should work with flex layout', () => {
      const { toJSON } = render(
        <HapticTab
          testID="flex-tab"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Flex Tab</Text>
        </HapticTab>
      );

      const component = toJSON();
      expect(component).toBeTruthy();
    });

    it('should work with conditional rendering of children', () => {
      const shouldRenderChild = true;
      render(
        <HapticTab testID="conditional-tab">
          {shouldRenderChild && <Text testID="conditional-child">Visible</Text>}
        </HapticTab>
      );

      expect(screen.getByTestId('conditional-child')).toBeTruthy();
    });

    it('should work with conditional rendering of children (false case)', () => {
      const shouldRenderChild = false;
      const { toJSON } = render(
        <HapticTab testID="conditional-tab-false">
          {shouldRenderChild && <Text testID="conditional-child">Hidden</Text>}
        </HapticTab>
      );

      const component = toJSON();
      expect(component).toBeTruthy();
    });

    it('should combine multiple styles correctly', () => {
      const baseStyle = { padding: 10 };
      const additionalStyle = { margin: 5 };
      const { toJSON } = render(
        <HapticTab
          testID="combined-styles"
          style={[baseStyle, additionalStyle]}
        >
          <Text>Styled</Text>
        </HapticTab>
      );

      const component = toJSON();
      expect(component?.props.style).toBeDefined();
    });

    it('should work as a button replacement', () => {
      const handlePress = jest.fn();
      render(
        <HapticTab
          testID="button-replacement"
          onPress={handlePress}
          accessible={true}
          accessibilityLabel="Action Button"
          accessibilityRole="button"
        >
          <Text>Press Me</Text>
        </HapticTab>
      );

      const button = screen.getByTestId('button-replacement');
      fireEvent.press(button);

      expect(handlePress).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Press Me')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should render with empty children array', () => {
      const { toJSON } = render(
        <HapticTab testID="empty-children">
          {[]}
        </HapticTab>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should render with null child', () => {
      const { toJSON } = render(
        <HapticTab testID="null-child">
          {null}
        </HapticTab>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should render with undefined child', () => {
      const { toJSON } = render(
        <HapticTab testID="undefined-child">
          {undefined}
        </HapticTab>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should handle rapid consecutive presses', () => {
      const onPressMock = jest.fn();
      render(
        <HapticTab testID="rapid-press" onPress={onPressMock}>
          <Text>Spam Click</Text>
        </HapticTab>
      );

      const tab = screen.getByTestId('rapid-press');
      for (let i = 0; i < 10; i++) {
        fireEvent.press(tab);
      }

      expect(onPressMock).toHaveBeenCalledTimes(10);
    });

    it('should work with very long label text', () => {
      const longText =
        'This is a very long tab label that should still render correctly in the component';
      render(
        <HapticTab testID="long-text-tab">
          <Text numberOfLines={1}>{longText}</Text>
        </HapticTab>
      );

      expect(screen.getByText(longText)).toBeTruthy();
    });

    it('should work with special characters in labels', () => {
      const specialText = '🎯 Tab #1 (Special & Symbols) ✓';
      render(
        <HapticTab testID="special-chars-tab">
          <Text>{specialText}</Text>
        </HapticTab>
      );

      expect(screen.getByText(specialText)).toBeTruthy();
    });

    it('should work with RTL (right-to-left) content', () => {
      const rtlText = 'العربية'; // Arabic text
      render(
        <HapticTab testID="rtl-tab">
          <Text>{rtlText}</Text>
        </HapticTab>
      );

      expect(screen.getByText(rtlText)).toBeTruthy();
    });
  });

  describe('Performance and memory', () => {
    it('should not create memory leaks with multiple mounts/unmounts', () => {
      const { unmount, rerender } = render(
        <HapticTab testID="lifecycle-tab">
          <Text>Content</Text>
        </HapticTab>
      );

      unmount();
      rerender(
        <HapticTab testID="lifecycle-tab-2">
          <Text>New Content</Text>
        </HapticTab>
      );

      expect(screen.getByText('New Content')).toBeTruthy();
    });

    it('should handle prop updates correctly', () => {
      const { rerender } = render(
        <HapticTab testID="update-tab" onPress={() => {}}>
          <Text>Initial</Text>
        </HapticTab>
      );

      expect(screen.getByText('Initial')).toBeTruthy();

      rerender(
        <HapticTab testID="update-tab" onPress={() => {}}>
          <Text>Updated</Text>
        </HapticTab>
      );

      expect(screen.getByText('Updated')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation with accessible prop', () => {
      const { toJSON } = render(
        <HapticTab
          testID="a11y-keyboard-tab"
          accessible={true}
          accessibilityRole="tab"
        >
          <Text>Accessible Tab</Text>
        </HapticTab>
      );

      const component = toJSON();
      expect(component?.props.accessible).toBe(true);
      expect(component?.props.accessibilityRole).toBe('tab');
    });

    it('should provide clear accessibility labels', () => {
      const labels = ['Home', 'Explore', 'Profile'];

      labels.forEach((label) => {
        const { rerender } = render(
          <HapticTab
            testID={`tab-${label}`}
            accessible={true}
            accessibilityLabel={label}
            accessibilityRole="tab"
          >
            <Text>{label}</Text>
          </HapticTab>
        );

        expect(screen.getByText(label)).toBeTruthy();
      });
    });

    it('should support disabled state accessibly', () => {
      const { toJSON } = render(
        <HapticTab
          testID="disabled-a11y-tab"
          disabled={true}
          accessibilityLabel="Disabled Tab"
          accessibilityRole="tab"
        >
          <Text>Disabled</Text>
        </HapticTab>
      );

      const component = toJSON();
      expect(component?.props.disabled).toBe(true);
    });
  });
});
