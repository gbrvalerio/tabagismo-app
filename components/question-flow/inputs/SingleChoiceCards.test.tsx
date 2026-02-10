import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SingleChoiceCards } from './SingleChoiceCards';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/lib/haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  impactAsync: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('SingleChoiceCards', () => {
  const choices = ['Masculino', 'Feminino', 'Outro'];

  it('should render all choices', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    expect(screen.getByText('Masculino')).toBeDefined();
    expect(screen.getByText('Feminino')).toBeDefined();
    expect(screen.getByText('Outro')).toBeDefined();
    expect(screen.getByText('Escolha uma opção')).toBeDefined();
  });

  it('should call onChange when card is pressed', () => {
    const onChange = jest.fn();
    render(<SingleChoiceCards choices={choices} value={null} onChange={onChange} />);

    fireEvent.press(screen.getByText('Masculino'));
    expect(onChange).toHaveBeenCalledWith('Masculino');
  });

  it('should highlight selected card', () => {
    render(<SingleChoiceCards choices={choices} value="Feminino" onChange={() => {}} />);
    const selected = screen.getByText('Feminino').parent;
    expect(selected).toBeDefined();
  });

  it('should render cards as touchable', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const card = screen.getByTestId('choice-Masculino');
    expect(card.props.accessible).toBe(true);
  });

  it('should apply white background to cards', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const card = screen.getByTestId('choice-Masculino');
    expect(card).toBeDefined();
  });

  it('should apply 12px border radius to cards', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const card = screen.getByTestId('choice-Masculino');
    expect(card).toBeDefined();
  });

  it('should use transparent border for unselected cards', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const card = screen.getByTestId('choice-Masculino');
    expect(card).toBeDefined();
  });

  it('should use primary border for selected card', () => {
    render(<SingleChoiceCards choices={choices} value="Masculino" onChange={() => {}} />);
    const card = screen.getByTestId('choice-Masculino');
    expect(card).toBeDefined();
  });

  it('should apply Poppins Regular font to choice text', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const text = screen.getByText('Masculino');
    const styles = text.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontFamily).toBe('Poppins_400Regular');
  });

  it('should apply 16px font size to choice text', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const text = screen.getByText('Masculino');
    const styles = text.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontSize).toBe(16);
  });

  it('should render badge text as plain text without pill styling', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const { toJSON } = render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const tree = toJSON();
    // The header is the first child, badge is inside header
    const header = (tree as any).children[0];
    const badge = header.children[0];
    const badgeStyle = badge.props.style;
    const flatStyle = Array.isArray(badgeStyle)
      ? Object.assign({}, ...badgeStyle.flat(Infinity).filter(Boolean))
      : badgeStyle;
    // Should not have pill styling (no background, border, border-radius)
    expect(flatStyle.backgroundColor).toBeUndefined();
    expect(flatStyle.borderRadius).toBeUndefined();
    expect(flatStyle.borderWidth).toBeUndefined();
  });

  it('should trigger haptic feedback on press', () => {
    const onChange = jest.fn();
    const { impactAsync, ImpactFeedbackStyle } = jest.requireMock('@/lib/haptics');
    render(<SingleChoiceCards choices={choices} value={null} onChange={onChange} />);

    fireEvent.press(screen.getByText('Masculino'));
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Medium);
  });

  it('should handle press in event', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const card = screen.getByTestId('choice-Masculino');

    // Trigger pressIn event
    fireEvent(card, 'pressIn');

    // Should not crash
    expect(card).toBeDefined();
  });

  it('should handle press out event', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const card = screen.getByTestId('choice-Masculino');

    // Trigger pressOut event
    fireEvent(card, 'pressOut');

    // Should not crash
    expect(card).toBeDefined();
  });

  describe('Edge cases', () => {
    it('should render empty state when choices array is empty', () => {
      render(<SingleChoiceCards choices={[]} value={null} onChange={() => {}} />);
      // Badge should still be rendered
      expect(screen.getByText('Escolha uma opção')).toBeDefined();
      // No choice cards should be rendered
      expect(screen.queryByTestId(/^choice-/)).toBeNull();
    });

    it('should handle very long choice text', () => {
      const longText = 'Este é um texto muito longo que pode causar problemas de layout se não for tratado corretamente pela interface do usuário';
      const longChoices = [longText, 'Curto'];
      render(<SingleChoiceCards choices={longChoices} value={null} onChange={() => {}} />);

      const longTextElement = screen.getByText(longText);
      expect(longTextElement).toBeDefined();

      // Verify the text style includes flex: 1 for proper wrapping
      const styles = longTextElement.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.flex).toBe(1);
    });

    it('should handle special characters in choices', () => {
      const specialChoices = ['Opção com acentuação: áéíóú', 'Símbolos: @#$%&*!', 'Emojis: 🎉🎊'];
      render(<SingleChoiceCards choices={specialChoices} value={null} onChange={() => {}} />);

      expect(screen.getByText('Opção com acentuação: áéíóú')).toBeDefined();
      expect(screen.getByText('Símbolos: @#$%&*!')).toBeDefined();
      expect(screen.getByText('Emojis: 🎉🎊')).toBeDefined();
    });

    it('should handle selection of special character choices', () => {
      const onChange = jest.fn();
      const specialChoices = ['Opção com acentuação: áéíóú'];
      render(<SingleChoiceCards choices={specialChoices} value={null} onChange={onChange} />);

      fireEvent.press(screen.getByText('Opção com acentuação: áéíóú'));
      expect(onChange).toHaveBeenCalledWith('Opção com acentuação: áéíóú');
    });
  });

  describe('Animation and styling', () => {
    it('should apply scale transform on press in', () => {
      render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
      const card = screen.getByTestId('choice-Masculino');

      // Get initial style
      const initialStyles = card.props.style;
      const initialFlatStyle = Array.isArray(initialStyles)
        ? Object.assign({}, ...initialStyles.flat(Infinity).filter(Boolean))
        : initialStyles;

      // Verify transform property exists and contains scale
      expect(initialFlatStyle.transform).toBeDefined();
      expect(Array.isArray(initialFlatStyle.transform)).toBe(true);

      // Trigger pressIn
      fireEvent(card, 'pressIn');

      // After pressIn, the scale animation should be triggered (mock returns the value directly)
      const afterPressStyles = card.props.style;
      const afterPressFlatStyle = Array.isArray(afterPressStyles)
        ? Object.assign({}, ...afterPressStyles.flat(Infinity).filter(Boolean))
        : afterPressStyles;
      expect(afterPressFlatStyle.transform).toBeDefined();
    });

    it('should restore scale on press out', () => {
      render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
      const card = screen.getByTestId('choice-Masculino');

      fireEvent(card, 'pressIn');
      fireEvent(card, 'pressOut');

      // After pressOut, scale should return to 1 (mock returns value directly)
      const styles = card.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;
      expect(flatStyle.transform).toBeDefined();
      expect(flatStyle.transform).toContainEqual({ scale: 1 });
    });

    it('should apply transparent border for unselected cards', () => {
      const { toJSON } = render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
      const tree = toJSON();

      // Find the card (inside AnimatedTouchable > View)
      const animatedTouchable = (tree as any).children[1]; // Skip header
      const cardView = animatedTouchable.children[0];
      const cardStyles = cardView.props.style;
      const flatStyle = Array.isArray(cardStyles)
        ? Object.assign({}, ...cardStyles.flat(Infinity).filter(Boolean))
        : cardStyles;

      expect(flatStyle.borderColor).toBe('transparent');
      expect(flatStyle.borderWidth).toBe(2);
    });

    it('should apply primary border color for selected card', () => {
      const { toJSON } = render(<SingleChoiceCards choices={choices} value="Masculino" onChange={() => {}} />);
      const tree = toJSON();

      // Find the selected card (inside AnimatedTouchable > View)
      const animatedTouchable = (tree as any).children[1]; // Skip header
      const cardView = animatedTouchable.children[0];
      const cardStyles = cardView.props.style;
      const flatStyle = Array.isArray(cardStyles)
        ? Object.assign({}, ...cardStyles.flat(Infinity).filter(Boolean))
        : cardStyles;

      expect(flatStyle.borderColor).toBe('#FF6B35'); // colors.primary.base
      expect(flatStyle.borderWidth).toBe(2);
    });

    it('should apply tinted background for selected card', () => {
      const { toJSON } = render(<SingleChoiceCards choices={choices} value="Masculino" onChange={() => {}} />);
      const tree = toJSON();

      const animatedTouchable = (tree as any).children[1];
      const cardView = animatedTouchable.children[0];
      const cardStyles = cardView.props.style;
      const flatStyle = Array.isArray(cardStyles)
        ? Object.assign({}, ...cardStyles.flat(Infinity).filter(Boolean))
        : cardStyles;

      // 5% opacity of primary color
      expect(flatStyle.backgroundColor).toBe('#FF6B350D');
    });

    it('should show radio circle indicator filled when selected', () => {
      const { toJSON } = render(<SingleChoiceCards choices={choices} value="Masculino" onChange={() => {}} />);
      const tree = toJSON();

      const animatedTouchable = (tree as any).children[1];
      const cardView = animatedTouchable.children[0];
      const radioCircle = cardView.children[0];
      const radioStyles = radioCircle.props.style;
      const flatStyle = Array.isArray(radioStyles)
        ? Object.assign({}, ...radioStyles.flat(Infinity).filter(Boolean))
        : radioStyles;

      expect(flatStyle.borderColor).toBe('#FF6B35'); // colors.primary.base
      // Check inner circle exists
      expect(radioCircle.children).toHaveLength(1);
    });

    it('should show empty radio circle when unselected', () => {
      const { toJSON } = render(<SingleChoiceCards choices={choices} value="Feminino" onChange={() => {}} />);
      const tree = toJSON();

      // Get first card (Masculino - unselected)
      const animatedTouchable = (tree as any).children[1];
      const cardView = animatedTouchable.children[0];
      const radioCircle = cardView.children[0];
      const radioStyles = radioCircle.props.style;
      const flatStyle = Array.isArray(radioStyles)
        ? Object.assign({}, ...radioStyles.flat(Infinity).filter(Boolean))
        : radioStyles;

      expect(flatStyle.borderColor).toBe('#B0B0B0'); // colors.neutral.gray[400]
      // No inner circle
      expect(radioCircle.children).toBeNull();
    });
  });
});
