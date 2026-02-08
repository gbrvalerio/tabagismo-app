import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

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
});
