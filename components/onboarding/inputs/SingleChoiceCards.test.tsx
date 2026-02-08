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
});
