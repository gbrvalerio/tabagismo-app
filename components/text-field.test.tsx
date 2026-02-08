import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TextField } from './text-field';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: (_props: Record<string, string>, colorName: string) => {
    const colors: Record<string, string> = {
      text: '#000000',
      background: '#FFFFFF',
      icon: '#687076',
    };
    return colors[colorName] || '#000000';
  },
}));

describe('TextField', () => {
  describe('Basic rendering', () => {
    it('should render a text input', () => {
      render(<TextField testID="text-field" />);

      expect(screen.getByTestId('text-field-input')).toBeTruthy();
    });

    it('should render with a label', () => {
      render(<TextField label="Nome" testID="text-field" />);

      expect(screen.getByText('Nome')).toBeTruthy();
    });

    it('should render with placeholder text', () => {
      render(<TextField placeholder="Digite seu nome" testID="text-field" />);

      expect(screen.getByPlaceholderText('Digite seu nome')).toBeTruthy();
    });

    it('should render with a value', () => {
      render(<TextField value="João" testID="text-field" />);

      expect(screen.getByDisplayValue('João')).toBeTruthy();
    });

    it('should render with helper text', () => {
      render(<TextField helperText="Texto de ajuda" testID="text-field" />);

      expect(screen.getByText('Texto de ajuda')).toBeTruthy();
    });
  });

  describe('User interaction', () => {
    it('should call onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      render(
        <TextField onChangeText={onChangeText} testID="text-field" />
      );

      fireEvent.changeText(screen.getByTestId('text-field-input'), 'hello');
      expect(onChangeText).toHaveBeenCalledWith('hello');
    });

    it('should call onFocus when input is focused', () => {
      const onFocus = jest.fn();
      render(<TextField onFocus={onFocus} testID="text-field" />);

      fireEvent(screen.getByTestId('text-field-input'), 'focus');
      expect(onFocus).toHaveBeenCalled();
    });

    it('should call onBlur when input loses focus', () => {
      const onBlur = jest.fn();
      render(<TextField onBlur={onBlur} testID="text-field" />);

      fireEvent(screen.getByTestId('text-field-input'), 'blur');
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Disabled state', () => {
    it('should be non-editable when disabled', () => {
      render(<TextField disabled testID="text-field" />);

      const input = screen.getByTestId('text-field-input');
      expect(input.props.editable).toBe(false);
    });

    it('should apply reduced opacity when disabled', () => {
      render(<TextField disabled testID="text-field" />);

      const container = screen.getByTestId('text-field');
      const containerStyle = container.props.style;
      const flatStyle = Array.isArray(containerStyle)
        ? Object.assign({}, ...containerStyle.filter(Boolean))
        : containerStyle;
      expect(flatStyle.opacity).toBeLessThan(1);
    });
  });

  describe('Props forwarding', () => {
    it('should forward keyboardType prop', () => {
      render(
        <TextField keyboardType="email-address" testID="text-field" />
      );

      const input = screen.getByTestId('text-field-input');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should forward secureTextEntry prop', () => {
      render(<TextField secureTextEntry testID="text-field" />);

      const input = screen.getByTestId('text-field-input');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should forward multiline prop', () => {
      render(<TextField multiline testID="text-field" />);

      const input = screen.getByTestId('text-field-input');
      expect(input.props.multiline).toBe(true);
    });

    it('should forward autoCapitalize prop', () => {
      render(<TextField autoCapitalize="none" testID="text-field" />);

      const input = screen.getByTestId('text-field-input');
      expect(input.props.autoCapitalize).toBe('none');
    });
  });

  describe('Error state', () => {
    it('should render error message', () => {
      render(<TextField error="Campo obrigatório" testID="text-field" />);

      expect(screen.getByText('Campo obrigatório')).toBeTruthy();
    });

    it('should apply error border color', () => {
      render(<TextField error="Erro" testID="text-field" />);

      const animatedBorder = screen.getByTestId('text-field-animated-border');
      const borderStyle = animatedBorder.props.style;
      const flatStyle = Array.isArray(borderStyle)
        ? Object.assign({}, ...borderStyle.filter(Boolean))
        : borderStyle;
      expect(flatStyle.borderColor).toBe('#FF4757');
    });

    it('should display error text in error color', () => {
      render(<TextField error="Erro" testID="text-field" />);

      const errorText = screen.getByText('Erro');
      const errorStyle = errorText.props.style;
      const flatStyle = Array.isArray(errorStyle)
        ? Object.assign({}, ...errorStyle.filter(Boolean))
        : errorStyle;
      expect(flatStyle.color).toBe('#FF4757');
    });

    it('should show error instead of helper text when both provided', () => {
      render(
        <TextField
          error="Erro"
          helperText="Ajuda"
          testID="text-field"
        />
      );

      expect(screen.getByText('Erro')).toBeTruthy();
      expect(screen.queryByText('Ajuda')).toBeNull();
    });

    it('should apply error color to label when error is present', () => {
      render(
        <TextField label="Email" error="Inválido" testID="text-field" />
      );

      const label = screen.getByText('Email');
      const labelStyle = label.props.style;
      const flatStyle = Array.isArray(labelStyle)
        ? Object.assign({}, ...labelStyle.filter(Boolean))
        : labelStyle;
      expect(flatStyle.color).toBe('#FF4757');
    });
  });

  describe('Focus animation', () => {
    it('should render animated input wrapper', () => {
      render(<TextField testID="text-field" />);

      expect(screen.getByTestId('text-field-animated-border')).toBeTruthy();
    });

    it('should still call onFocus with animation', () => {
      const onFocus = jest.fn();
      render(<TextField onFocus={onFocus} testID="text-field" />);

      fireEvent(screen.getByTestId('text-field-input'), 'focus');
      expect(onFocus).toHaveBeenCalled();
    });

    it('should still call onBlur with animation', () => {
      const onBlur = jest.fn();
      render(<TextField onBlur={onBlur} testID="text-field" />);

      fireEvent(screen.getByTestId('text-field-input'), 'blur');
      expect(onBlur).toHaveBeenCalled();
    });

    it('should render correctly in focused state', () => {
      render(<TextField testID="text-field" />);

      const input = screen.getByTestId('text-field-input');
      fireEvent(input, 'focus');

      // Component should still render correctly after focus
      expect(screen.getByTestId('text-field-animated-border')).toBeTruthy();
      expect(input).toBeTruthy();
    });

    it('should render correctly in unfocused state after blur', () => {
      render(<TextField testID="text-field" />);

      const input = screen.getByTestId('text-field-input');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');

      expect(screen.getByTestId('text-field-animated-border')).toBeTruthy();
      expect(input).toBeTruthy();
    });
  });

  describe('Loading state', () => {
    it('should show loading indicator when loading', () => {
      render(<TextField loading testID="text-field" />);

      expect(screen.getByTestId('text-field-loading')).toBeTruthy();
    });

    it('should not show loading indicator when not loading', () => {
      render(<TextField testID="text-field" />);

      expect(screen.queryByTestId('text-field-loading')).toBeNull();
    });

    it('should be non-editable when loading', () => {
      render(<TextField loading testID="text-field" />);

      const input = screen.getByTestId('text-field-input');
      expect(input.props.editable).toBe(false);
    });
  });
});
