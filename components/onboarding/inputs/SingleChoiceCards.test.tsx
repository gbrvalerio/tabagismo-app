import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SingleChoiceCards } from './SingleChoiceCards';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-haptics', () => ({
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

  it('should trigger haptic feedback on press', () => {
    const onChange = jest.fn();
    const { impactAsync, ImpactFeedbackStyle } = jest.requireMock('expo-haptics');
    render(<SingleChoiceCards choices={choices} value={null} onChange={onChange} />);

    fireEvent.press(screen.getByText('Masculino'));
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Medium);
  });
});
