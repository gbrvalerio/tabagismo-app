import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OnboardingTextInput } from './TextInput';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

describe('OnboardingTextInput', () => {
  it('should render with placeholder', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    expect(screen.getByPlaceholderText('Nome')).toBeDefined();
  });

  it('should call onChange when text changes', () => {
    const onChange = jest.fn();
    render(<OnboardingTextInput value="" onChange={onChange} placeholder="Nome" />);

    const input = screen.getByPlaceholderText('Nome');
    fireEvent.changeText(input, 'John');

    expect(onChange).toHaveBeenCalledWith('John');
  });

  it('should display current value', () => {
    render(<OnboardingTextInput value="John" onChange={() => {}} placeholder="Nome" />);
    expect(screen.getByDisplayValue('John')).toBeDefined();
  });

  it('should have large font size', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    const input = screen.getByPlaceholderText('Nome');
    const styles = input.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontSize).toBe(18);
  });
});
