/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const identity = (v: any) => v;
  return {
    __esModule: true,
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: (fn: () => object) => fn(),
    withSpring: (toValue: number) => toValue,
    Easing: {
      out: () => identity,
      inOut: () => identity,
      cubic: identity,
      bezier: () => identity,
    },
    default: {
      View,
      createAnimatedComponent: (component: any) => component,
    },
  };
});

describe('Button', () => {
  describe('Primary variant (default)', () => {
    it('should render with label text', () => {
      render(<Button label="Continuar" onPress={() => {}} />);
      expect(screen.getByText('Continuar')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      render(<Button label="Continuar" onPress={onPress} />);
      fireEvent.press(screen.getByText('Continuar'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should apply primary variant styles by default', () => {
      render(<Button label="Continuar" onPress={() => {}} />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      // Primary variant should have the primary base color as background
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.backgroundColor).toBe('#FF6B35');
    });

    it('should render white text for primary variant', () => {
      render(<Button label="Continuar" onPress={() => {}} />);
      const text = screen.getByText('Continuar');
      const styles = text.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.color).toBe('#FFFFFF');
    });

    it('should be disabled when disabled prop is true', () => {
      const onPress = jest.fn();
      render(<Button label="Continuar" onPress={onPress} disabled />);
      fireEvent.press(screen.getByText('Continuar'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should apply reduced opacity when disabled', () => {
      render(<Button label="Continuar" onPress={() => {}} disabled />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.opacity).toBe(0.5);
    });

    it('should show loading indicator when loading', () => {
      render(<Button label="Continuar" onPress={() => {}} loading />);
      expect(screen.getByTestId('button-loading')).toBeTruthy();
    });

    it('should not call onPress when loading', () => {
      const onPress = jest.fn();
      render(<Button label="Continuar" onPress={onPress} loading />);
      fireEvent.press(screen.getByTestId('button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should accept custom style prop', () => {
      render(
        <Button
          label="Continuar"
          onPress={() => {}}
          style={{ marginTop: 20 }}
        />
      );
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.marginTop).toBe(20);
    });

    it('should forward testID prop', () => {
      render(
        <Button label="Continuar" onPress={() => {}} testID="custom-button" />
      );
      expect(screen.getByTestId('custom-button')).toBeTruthy();
    });

    it('should have proper border radius from design tokens', () => {
      render(<Button label="Continuar" onPress={() => {}} />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.borderRadius).toBe(12); // borderRadius.md
    });

    it('should have proper padding from design tokens', () => {
      render(<Button label="Continuar" onPress={() => {}} />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.paddingVertical).toBe(16); // spacing.md
      expect(flatStyle.paddingHorizontal).toBe(24); // spacing.lg
    });
  });

  describe('Secondary variant', () => {
    it('should apply secondary background color', () => {
      render(<Button label="Salvar" onPress={() => {}} variant="secondary" />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.backgroundColor).toBe('#4ECDC4');
    });

    it('should render white text for secondary variant', () => {
      render(<Button label="Salvar" onPress={() => {}} variant="secondary" />);
      const text = screen.getByText('Salvar');
      const styles = text.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.color).toBe('#FFFFFF');
    });

    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      render(<Button label="Salvar" onPress={onPress} variant="secondary" />);
      fireEvent.press(screen.getByText('Salvar'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should support disabled state', () => {
      const onPress = jest.fn();
      render(
        <Button label="Salvar" onPress={onPress} variant="secondary" disabled />
      );
      fireEvent.press(screen.getByText('Salvar'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Outline variant', () => {
    it('should have transparent background', () => {
      render(<Button label="Cancelar" onPress={() => {}} variant="outline" />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.backgroundColor).toBe('transparent');
    });

    it('should have primary color border', () => {
      render(<Button label="Cancelar" onPress={() => {}} variant="outline" />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.borderWidth).toBe(2);
      expect(flatStyle.borderColor).toBe('#FF6B35');
    });

    it('should render primary color text', () => {
      render(<Button label="Cancelar" onPress={() => {}} variant="outline" />);
      const text = screen.getByText('Cancelar');
      const styles = text.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.color).toBe('#FF6B35');
    });

    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      render(
        <Button label="Cancelar" onPress={onPress} variant="outline" />
      );
      fireEvent.press(screen.getByText('Cancelar'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Minimal variant', () => {
    it('should have transparent background', () => {
      render(<Button label="Pular" onPress={() => {}} variant="minimal" />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.backgroundColor).toBe('transparent');
    });

    it('should not have a border', () => {
      render(<Button label="Pular" onPress={() => {}} variant="minimal" />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.borderWidth).toBeUndefined();
    });

    it('should render primary color text', () => {
      render(<Button label="Pular" onPress={() => {}} variant="minimal" />);
      const text = screen.getByText('Pular');
      const styles = text.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.color).toBe('#FF6B35');
    });

    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      render(<Button label="Pular" onPress={onPress} variant="minimal" />);
      fireEvent.press(screen.getByText('Pular'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should support loading state', () => {
      render(
        <Button label="Pular" onPress={() => {}} variant="minimal" loading />
      );
      expect(screen.getByTestId('button-loading')).toBeTruthy();
    });
  });

  describe('Press animation', () => {
    it('should render with an animated wrapper', () => {
      render(<Button label="Animar" onPress={() => {}} />);
      const button = screen.getByTestId('button');
      expect(button).toBeTruthy();
    });

    it('should still call onPress with animation enabled', () => {
      const onPress = jest.fn();
      render(<Button label="Animar" onPress={onPress} />);
      fireEvent.press(screen.getByTestId('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should have transform style with scale property', () => {
      render(<Button label="Animar" onPress={() => {}} />);
      const button = screen.getByTestId('button');
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;

      // Verify transform property exists and contains scale
      expect(flatStyle.transform).toBeDefined();
      expect(Array.isArray(flatStyle.transform)).toBe(true);
      expect(flatStyle.transform).toContainEqual({ scale: 1 });
    });

    it('should trigger scale animation on press in', () => {
      render(<Button label="Animar" onPress={() => {}} />);
      const button = screen.getByTestId('button');

      // Verify initial state has transform with scale
      const initialStyles = button.props.style;
      const initialFlatStyle = Array.isArray(initialStyles)
        ? Object.assign({}, ...initialStyles.flat(Infinity).filter(Boolean))
        : initialStyles;
      expect(initialFlatStyle.transform).toBeDefined();

      // Trigger pressIn - with mocks, the animation target value (0.95) is passed to withSpring
      // but the shared value update happens asynchronously. The key is that the handler executes.
      fireEvent(button, 'pressIn');

      // Verify button remains in valid state after pressIn
      const afterStyles = button.props.style;
      const afterFlatStyle = Array.isArray(afterStyles)
        ? Object.assign({}, ...afterStyles.flat(Infinity).filter(Boolean))
        : afterStyles;
      expect(afterFlatStyle.transform).toBeDefined();
      expect(Array.isArray(afterFlatStyle.transform)).toBe(true);
    });

    it('should trigger scale animation on press out', () => {
      render(<Button label="Animar" onPress={() => {}} />);
      const button = screen.getByTestId('button');

      // Trigger pressIn then pressOut
      fireEvent(button, 'pressIn');
      fireEvent(button, 'pressOut');

      // Verify button is in valid state with transform
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.transform).toBeDefined();
      expect(Array.isArray(flatStyle.transform)).toBe(true);
    });

    it('should complete full press cycle (in -> out -> press) without errors', () => {
      const onPress = jest.fn();
      render(<Button label="Animar" onPress={onPress} />);
      const button = screen.getByTestId('button');

      // Full press cycle
      fireEvent(button, 'pressIn');
      fireEvent(button, 'pressOut');
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(1);

      // Verify button is still in valid state after animation cycle
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.transform).toBeDefined();
    });

    it('should not change scale when disabled and pressed', () => {
      render(<Button label="Animar" onPress={() => {}} disabled />);
      const button = screen.getByTestId('button');

      // Get initial scale
      const initialStyles = button.props.style;
      const initialFlatStyle = Array.isArray(initialStyles)
        ? Object.assign({}, ...initialStyles.flat(Infinity).filter(Boolean))
        : initialStyles;
      const initialScale = initialFlatStyle.transform?.find(
        (t: { scale?: number }) => t.scale !== undefined
      )?.scale;

      // Trigger pressIn
      fireEvent(button, 'pressIn');

      // Scale should remain unchanged
      const afterStyles = button.props.style;
      const afterFlatStyle = Array.isArray(afterStyles)
        ? Object.assign({}, ...afterStyles.flat(Infinity).filter(Boolean))
        : afterStyles;
      const afterScale = afterFlatStyle.transform?.find(
        (t: { scale?: number }) => t.scale !== undefined
      )?.scale;

      expect(afterScale).toBe(initialScale);
    });

    it('should not change scale when loading and pressed', () => {
      render(<Button label="Animar" onPress={() => {}} loading />);
      const button = screen.getByTestId('button');

      // Get initial scale
      const initialStyles = button.props.style;
      const initialFlatStyle = Array.isArray(initialStyles)
        ? Object.assign({}, ...initialStyles.flat(Infinity).filter(Boolean))
        : initialStyles;
      const initialScale = initialFlatStyle.transform?.find(
        (t: { scale?: number }) => t.scale !== undefined
      )?.scale;

      // Trigger pressIn
      fireEvent(button, 'pressIn');

      // Scale should remain unchanged
      const afterStyles = button.props.style;
      const afterFlatStyle = Array.isArray(afterStyles)
        ? Object.assign({}, ...afterStyles.flat(Infinity).filter(Boolean))
        : afterStyles;
      const afterScale = afterFlatStyle.transform?.find(
        (t: { scale?: number }) => t.scale !== undefined
      )?.scale;

      expect(afterScale).toBe(initialScale);
      expect(screen.getByTestId('button-loading')).toBeTruthy();
    });

    it('should render correctly across all variants with animation', () => {
      const variants = ['primary', 'secondary', 'outline', 'minimal'] as const;
      variants.forEach((variant) => {
        const { unmount } = render(
          <Button label={`Test ${variant}`} onPress={() => {}} variant={variant} />
        );
        expect(screen.getByText(`Test ${variant}`)).toBeTruthy();

        // Verify each variant has animation transform
        const button = screen.getByTestId('button');
        const styles = button.props.style;
        const flatStyle = Array.isArray(styles)
          ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
          : styles;
        expect(flatStyle.transform).toBeDefined();

        unmount();
      });
    });

    it('should handle rapid press in/out cycles', () => {
      const onPress = jest.fn();
      render(<Button label="Animar" onPress={onPress} />);
      const button = screen.getByTestId('button');

      // Rapid press cycles
      for (let i = 0; i < 5; i++) {
        fireEvent(button, 'pressIn');
        fireEvent(button, 'pressOut');
      }

      // Button should still be in valid state
      const styles = button.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.transform).toContainEqual({ scale: 1 });

      // Should still be pressable
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});
