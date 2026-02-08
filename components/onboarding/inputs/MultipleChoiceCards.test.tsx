import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MultipleChoiceCards } from './MultipleChoiceCards';

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
    const { impactAsync, ImpactFeedbackStyle } = jest.requireMock('expo-haptics');
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={onChange} />);

    fireEvent.press(screen.getByText('Ansiedade'));
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Medium);
  });

  it('should show selection counter when items are selected', () => {
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade', 'Estresse']} onChange={() => {}} />);
    expect(screen.getByText('2')).toBeDefined();
  });

  it('should show counter when one item is selected', () => {
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={() => {}} />);
    expect(screen.getByText('1')).toBeDefined();
  });
});
