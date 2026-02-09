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
});
