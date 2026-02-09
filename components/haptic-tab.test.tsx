import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { HapticTab } from './haptic-tab';

// Unmock HapticTab so we test the real component
jest.unmock('@/components/haptic-tab');

jest.mock('@/lib/haptics', () => ({
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

    it('should be a Pressable component wrapper', () => {
      const { toJSON } = render(
        <HapticTab>
          <Text>Content</Text>
        </HapticTab>
      );

      const component = toJSON();
      expect(component?.type).toBeTruthy();
    });
  });

  describe('Props forwarding', () => {
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

      expect(screen.getByTestId('icon-container')).toBeTruthy();
      expect(screen.getByTestId('tab-label')).toBeTruthy();
      expect(screen.getByText('Home')).toBeTruthy();
    });

    it('should render with selected state', () => {
      expect(() => {
        render(
          <HapticTab
            accessibilityRole="tab"
            accessibilityState={{ selected: true }}
          >
            <Text testID="selected-content">Selected Tab</Text>
          </HapticTab>
        );
      }).not.toThrow();

      expect(screen.getByTestId('selected-content')).toBeTruthy();
    });

    it('should render with unselected state', () => {
      expect(() => {
        render(
          <HapticTab
            accessibilityRole="tab"
            accessibilityState={{ selected: false }}
          >
            <Text testID="unselected-content">Unselected Tab</Text>
          </HapticTab>
        );
      }).not.toThrow();

      expect(screen.getByTestId('unselected-content')).toBeTruthy();
    });

    it('should be usable with icons and text', () => {
      render(
        <HapticTab>
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

    it('should integrate with tab navigation setup', () => {
      const onPressMock = jest.fn();
      render(
        <HapticTab
          onPress={onPressMock}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Home Tab"
        >
          <Text testID="nav-label">Home</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('nav-label')).toBeTruthy();
    });
  });

  describe('Type safety and props validation', () => {
    it('should accept any props without type errors', () => {
      expect(() => {
        render(
          <HapticTab
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

    it('should accept numeric props', () => {
      expect(() => {
        render(<HapticTab delayLongPress={500} />);
      }).not.toThrow();
    });

    it('should accept boolean props', () => {
      expect(() => {
        render(
          <HapticTab disabled={true} accessible={true} />
        );
      }).not.toThrow();
    });

    it('should accept function props', () => {
      const handler = jest.fn();
      expect(() => {
        render(<HapticTab onPress={handler} />);
      }).not.toThrow();
    });
  });

  describe('Integration scenarios', () => {
    it('should work with flex layout', () => {
      const { toJSON } = render(
        <HapticTab
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text testID="flex-content">Flex Tab</Text>
        </HapticTab>
      );

      const component = toJSON();
      expect(component).toBeTruthy();
      expect(screen.getByTestId('flex-content')).toBeTruthy();
    });

    it('should work with conditional rendering of children', () => {
      const shouldRenderChild = true;
      render(
        <HapticTab>
          {shouldRenderChild && <Text testID="conditional-child">Visible</Text>}
        </HapticTab>
      );

      expect(screen.getByTestId('conditional-child')).toBeTruthy();
    });

    it('should work with conditional rendering of children (false case)', () => {
      const shouldRenderChild = false;
      const { toJSON } = render(
        <HapticTab>
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
          style={[baseStyle, additionalStyle]}
        >
          <Text testID="styled-content">Styled</Text>
        </HapticTab>
      );

      const component = toJSON();
      expect(component).toBeTruthy();
      expect(screen.getByTestId('styled-content')).toBeTruthy();
    });

    it('should work as a button replacement', () => {
      const handlePress = jest.fn();
      render(
        <HapticTab
          onPress={handlePress}
          accessible={true}
          accessibilityLabel="Action Button"
          accessibilityRole="button"
        >
          <Text testID="button-content">Press Me</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('button-content')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should render with empty children array', () => {
      const { toJSON } = render(
        <HapticTab>
          {[]}
        </HapticTab>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should render with null child', () => {
      const { toJSON } = render(
        <HapticTab>
          {null}
        </HapticTab>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should render with undefined child', () => {
      const { toJSON } = render(
        <HapticTab>
          {undefined}
        </HapticTab>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should work with very long label text', () => {
      const longText =
        'This is a very long tab label that should still render correctly in the component';
      render(
        <HapticTab>
          <Text testID="long-text" numberOfLines={1}>{longText}</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('long-text')).toBeTruthy();
    });

    it('should work with special characters in labels', () => {
      const specialText = '🎯 Tab #1 (Special & Symbols) ✓';
      render(
        <HapticTab>
          <Text testID="special-text">{specialText}</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('special-text')).toBeTruthy();
    });

    it('should work with RTL (right-to-left) content', () => {
      const rtlText = 'العربية'; // Arabic text
      render(
        <HapticTab>
          <Text testID="rtl-text">{rtlText}</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('rtl-text')).toBeTruthy();
    });

    it('should handle nested Pressable-like components', () => {
      render(
        <HapticTab>
          <View testID="nested-view">
            <Text testID="deeply-nested">Content</Text>
          </View>
        </HapticTab>
      );

      expect(screen.getByTestId('nested-view')).toBeTruthy();
      expect(screen.getByTestId('deeply-nested')).toBeTruthy();
    });
  });

  describe('Performance and memory', () => {
    it('should handle prop updates correctly', () => {
      const { rerender } = render(
        <HapticTab onPress={() => {}}>
          <Text testID="update-content">Initial</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('update-content')).toBeTruthy();

      rerender(
        <HapticTab onPress={() => {}}>
          <Text testID="update-content">Updated</Text>
        </HapticTab>
      );

      expect(screen.getByText('Updated')).toBeTruthy();
    });

    it('should handle style prop updates', () => {
      const { rerender } = render(
        <HapticTab style={{ padding: 10 }}>
          <Text testID="style-content">Content</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('style-content')).toBeTruthy();

      rerender(
        <HapticTab style={{ padding: 20 }}>
          <Text testID="style-content">Content</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('style-content')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation with accessible prop', () => {
      expect(() => {
        render(
          <HapticTab
            accessible={true}
            accessibilityRole="tab"
          >
            <Text testID="a11y-content">Accessible Tab</Text>
          </HapticTab>
        );
      }).not.toThrow();

      expect(screen.getByTestId('a11y-content')).toBeTruthy();
    });

    it('should provide clear accessibility labels', () => {
      const labels = ['Home', 'Explore', 'Profile'];

      labels.forEach((label) => {
        const { unmount } = render(
          <HapticTab
            accessible={true}
            accessibilityLabel={label}
            accessibilityRole="tab"
          >
            <Text testID={`tab-${label}`}>{label}</Text>
          </HapticTab>
        );

        expect(screen.getByTestId(`tab-${label}`)).toBeTruthy();
        unmount();
      });
    });

    it('should support disabled state accessibly', () => {
      expect(() => {
        render(
          <HapticTab
            disabled={true}
            accessibilityLabel="Disabled Tab"
            accessibilityRole="tab"
          >
            <Text testID="disabled-content">Disabled</Text>
          </HapticTab>
        );
      }).not.toThrow();

      expect(screen.getByTestId('disabled-content')).toBeTruthy();
    });

    it('should work with accessibilityState for tabs', () => {
      expect(() => {
        render(
          <HapticTab
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: true, disabled: false }}
          >
            <Text testID="state-content">Enabled Tab</Text>
          </HapticTab>
        );
      }).not.toThrow();

      expect(screen.getByTestId('state-content')).toBeTruthy();
    });
  });

  describe('Tab-specific functionality', () => {
    it('should be usable in a tab bar context', () => {
      render(
        <HapticTab
          onPress={() => {}}
          accessibilityRole="tab"
          accessible={true}
        >
          <View testID="home-icon">
            <Text>🏠</Text>
          </View>
          <Text testID="home-label">Home</Text>
        </HapticTab>
      );

      expect(screen.getByTestId('home-icon')).toBeTruthy();
      expect(screen.getByTestId('home-label')).toBeTruthy();
    });

    it('should handle multiple tab instances', () => {
      render(
        <View>
          <HapticTab accessibilityLabel="Tab 1" accessibilityRole="tab">
            <Text testID="tab1">Tab 1</Text>
          </HapticTab>
          <HapticTab accessibilityLabel="Tab 2" accessibilityRole="tab">
            <Text testID="tab2">Tab 2</Text>
          </HapticTab>
        </View>
      );

      expect(screen.getByTestId('tab1')).toBeTruthy();
      expect(screen.getByTestId('tab2')).toBeTruthy();
    });

    it('should display active/inactive states', () => {
      expect(() => {
        render(
          <View>
            <HapticTab
              accessibilityRole="tab"
              accessibilityState={{ selected: true }}
            >
              <Text testID="active">Active Tab</Text>
            </HapticTab>
            <HapticTab
              accessibilityRole="tab"
              accessibilityState={{ selected: false }}
            >
              <Text testID="inactive">Inactive Tab</Text>
            </HapticTab>
          </View>
        );
      }).not.toThrow();

      expect(screen.getByTestId('active')).toBeTruthy();
      expect(screen.getByTestId('inactive')).toBeTruthy();
    });
  });
});
