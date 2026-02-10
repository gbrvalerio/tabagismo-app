import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MultipleChoiceCards } from './MultipleChoiceCards';

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

describe('MultipleChoiceCards', () => {
  const choices = ['Ansiedade', 'Estresse', 'Social'];

  it('should render all choices', () => {
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
    expect(screen.getByText('Ansiedade')).toBeDefined();
    expect(screen.getByText('Estresse')).toBeDefined();
    expect(screen.getByText('Social')).toBeDefined();
    expect(screen.getByText('Escolha uma ou mais opções')).toBeDefined();
  });

  it('should add choice when card is pressed', () => {
    const onChange = jest.fn();
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={onChange} />);

    fireEvent.press(screen.getByText('Ansiedade'));
    expect(onChange).toHaveBeenCalledWith(['Ansiedade']);
  });

  it('should remove choice when selected card is pressed', () => {
    const onChange = jest.fn();
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={onChange} />);

    fireEvent.press(screen.getByText('Ansiedade'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('should allow multiple selections', () => {
    const onChange = jest.fn();
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={onChange} />);

    fireEvent.press(screen.getByText('Estresse'));
    expect(onChange).toHaveBeenCalledWith(['Ansiedade', 'Estresse']);
  });

  it('should highlight all selected cards', () => {
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade', 'Social']} onChange={() => {}} />);
    expect(screen.getByText('Ansiedade')).toBeDefined();
    expect(screen.getByText('Social')).toBeDefined();
  });

  it('should trigger haptic feedback on press', () => {
    const onChange = jest.fn();
    const { impactAsync, ImpactFeedbackStyle } = jest.requireMock('@/lib/haptics');
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={onChange} />);

    fireEvent.press(screen.getByText('Ansiedade'));
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Medium);
  });

  it('should render badge text as plain text without pill styling', () => {
    const { toJSON } = render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
    const tree = toJSON();
    // The header is the first child, badge is inside header
    const header = (tree as any).children[0];
    const badge = header.children[0];
    const badgeStyle = badge.props.style;
    const flatStyle = Array.isArray(badgeStyle)
      ? Object.assign({}, ...badgeStyle.flat(Infinity).filter(Boolean))
      : badgeStyle;
    expect(flatStyle.backgroundColor).toBeUndefined();
    expect(flatStyle.borderRadius).toBeUndefined();
    expect(flatStyle.borderWidth).toBeUndefined();
  });

  it('should show selection counter when items are selected', () => {
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade', 'Estresse']} onChange={() => {}} />);
    expect(screen.getByText('2')).toBeDefined();
  });

  it('should show counter when one item is selected', () => {
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={() => {}} />);
    expect(screen.getByText('1')).toBeDefined();
  });

  it('should apply Poppins Regular font to choice text', () => {
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
    const text = screen.getByText('Ansiedade');
    const styles = text.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontFamily).toBe('Poppins_400Regular');
  });

  it('should apply 16px font size to choice text', () => {
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
    const text = screen.getByText('Ansiedade');
    const styles = text.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontSize).toBe(16);
  });

  it('should handle press in event', () => {
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
    const card = screen.getByTestId('choice-Ansiedade');

    // Trigger pressIn event
    fireEvent(card, 'pressIn');

    // Should not crash
    expect(card).toBeDefined();
  });

  it('should handle press out event', () => {
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
    const card = screen.getByTestId('choice-Ansiedade');

    // Trigger pressOut event
    fireEvent(card, 'pressOut');

    // Should not crash
    expect(card).toBeDefined();
  });

  describe('Edge cases', () => {
    it('should render empty state when choices array is empty', () => {
      render(<MultipleChoiceCards choices={[]} value={[]} onChange={() => {}} />);
      // Badge should still be rendered
      expect(screen.getByText('Escolha uma ou mais opções')).toBeDefined();
      // No choice cards should be rendered
      expect(screen.queryByTestId(/^choice-/)).toBeNull();
    });

    it('should handle very long choice text', () => {
      const longText = 'Este é um texto muito longo que pode causar problemas de layout se não for tratado corretamente pela interface do usuário';
      const longChoices = [longText, 'Curto'];
      render(<MultipleChoiceCards choices={longChoices} value={[]} onChange={() => {}} />);

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
      render(<MultipleChoiceCards choices={specialChoices} value={[]} onChange={() => {}} />);

      expect(screen.getByText('Opção com acentuação: áéíóú')).toBeDefined();
      expect(screen.getByText('Símbolos: @#$%&*!')).toBeDefined();
      expect(screen.getByText('Emojis: 🎉🎊')).toBeDefined();
    });

    it('should handle selection of special character choices', () => {
      const onChange = jest.fn();
      const specialChoices = ['Opção com acentuação: áéíóú'];
      render(<MultipleChoiceCards choices={specialChoices} value={[]} onChange={onChange} />);

      fireEvent.press(screen.getByText('Opção com acentuação: áéíóú'));
      expect(onChange).toHaveBeenCalledWith(['Opção com acentuação: áéíóú']);
    });

    it('should handle selecting all choices', () => {
      const onChange = jest.fn();
      render(<MultipleChoiceCards choices={choices} value={['Ansiedade', 'Estresse']} onChange={onChange} />);

      fireEvent.press(screen.getByText('Social'));
      expect(onChange).toHaveBeenCalledWith(['Ansiedade', 'Estresse', 'Social']);
    });

    it('should show correct count when all items are selected', () => {
      render(<MultipleChoiceCards choices={choices} value={['Ansiedade', 'Estresse', 'Social']} onChange={() => {}} />);
      expect(screen.getByText('3')).toBeDefined();
    });
  });

  describe('Animation and styling', () => {
    it('should apply scale transform on press in', () => {
      render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
      const card = screen.getByTestId('choice-Ansiedade');

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
      render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
      const card = screen.getByTestId('choice-Ansiedade');

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
      const { toJSON } = render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
      const tree = toJSON();

      // Find the card (inside AnimatedTouchable > View) - skip header
      const animatedTouchable = (tree as any).children[1];
      const cardView = animatedTouchable.children[0];
      const cardStyles = cardView.props.style;
      const flatStyle = Array.isArray(cardStyles)
        ? Object.assign({}, ...cardStyles.flat(Infinity).filter(Boolean))
        : cardStyles;

      expect(flatStyle.borderColor).toBe('transparent');
      expect(flatStyle.borderWidth).toBe(2);
    });

    it('should apply secondary border color for selected card', () => {
      const { toJSON } = render(<MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={() => {}} />);
      const tree = toJSON();

      // Find the selected card (inside AnimatedTouchable > View)
      const animatedTouchable = (tree as any).children[1];
      const cardView = animatedTouchable.children[0];
      const cardStyles = cardView.props.style;
      const flatStyle = Array.isArray(cardStyles)
        ? Object.assign({}, ...cardStyles.flat(Infinity).filter(Boolean))
        : cardStyles;

      expect(flatStyle.borderColor).toBe('#4ECDC4'); // colors.secondary.base
      expect(flatStyle.borderWidth).toBe(2);
    });

    it('should apply tinted background for selected card', () => {
      const { toJSON } = render(<MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={() => {}} />);
      const tree = toJSON();

      const animatedTouchable = (tree as any).children[1];
      const cardView = animatedTouchable.children[0];
      const cardStyles = cardView.props.style;
      const flatStyle = Array.isArray(cardStyles)
        ? Object.assign({}, ...cardStyles.flat(Infinity).filter(Boolean))
        : cardStyles;

      // 5% opacity of secondary color
      expect(flatStyle.backgroundColor).toBe('#4ECDC40D');
    });

    it('should show checkbox filled with checkmark when selected', () => {
      const { toJSON } = render(<MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={() => {}} />);
      const tree = toJSON();

      const animatedTouchable = (tree as any).children[1];
      const cardView = animatedTouchable.children[0];
      const checkbox = cardView.children[0];
      const checkboxStyles = checkbox.props.style;
      const flatStyle = Array.isArray(checkboxStyles)
        ? Object.assign({}, ...checkboxStyles.flat(Infinity).filter(Boolean))
        : checkboxStyles;

      expect(flatStyle.borderColor).toBe('#4ECDC4'); // colors.secondary.base
      expect(flatStyle.backgroundColor).toBe('#4ECDC4'); // colors.secondary.base
      // Check checkmark text exists
      expect(checkbox.children).toHaveLength(1);
      expect(checkbox.children[0].children[0]).toBe('✓');
    });

    it('should show empty checkbox when unselected', () => {
      const { toJSON } = render(<MultipleChoiceCards choices={choices} value={['Estresse']} onChange={() => {}} />);
      const tree = toJSON();

      // Get first card (Ansiedade - unselected)
      const animatedTouchable = (tree as any).children[1];
      const cardView = animatedTouchable.children[0];
      const checkbox = cardView.children[0];
      const checkboxStyles = checkbox.props.style;
      const flatStyle = Array.isArray(checkboxStyles)
        ? Object.assign({}, ...checkboxStyles.flat(Infinity).filter(Boolean))
        : checkboxStyles;

      expect(flatStyle.borderColor).toBe('#B0B0B0'); // colors.neutral.gray[400]
      expect(flatStyle.backgroundColor).toBe('#FFFFFF'); // colors.neutral.white
      // No checkmark
      expect(checkbox.children).toBeNull();
    });

    it('should have counter badge with animated style properties', () => {
      const { toJSON } = render(
        <MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />
      );

      // Counter badge should have animated style with opacity and transform
      const tree = toJSON();
      const header = (tree as any).children[0];
      const counterBadge = header.children[1];
      const styles = counterBadge.props.style;
      const flatStyle = Array.isArray(styles)
        ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
        : styles;

      // Verify animated properties exist (opacity and transform)
      expect(flatStyle).toHaveProperty('opacity');
      expect(flatStyle).toHaveProperty('transform');
    });

    it('should show counter badge when items are selected', () => {
      const { toJSON } = render(
        <MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={() => {}} />
      );

      const tree = toJSON();
      const header = (tree as any).children[0];
      const counterBadge = header.children[1];

      // Counter badge should exist and contain the count
      expect(counterBadge).toBeDefined();
      expect(counterBadge.children[0].children[0]).toBe('1');
    });

    it('should update counter display when selection count changes', () => {
      const { rerender, toJSON } = render(
        <MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={() => {}} />
      );

      // Check initial count
      let tree = toJSON();
      let header = (tree as any).children[0];
      let counterBadge = header.children[1];
      expect(counterBadge.children[0].children[0]).toBe('1');

      // Rerender with more selections
      rerender(<MultipleChoiceCards choices={choices} value={['Ansiedade', 'Estresse']} onChange={() => {}} />);

      tree = toJSON();
      header = (tree as any).children[0];
      counterBadge = header.children[1];
      expect(counterBadge.children[0].children[0]).toBe('2');
    });
  });
});
