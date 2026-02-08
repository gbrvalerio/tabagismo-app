import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OnboardingNumberInput } from './NumberInput';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

describe('OnboardingNumberInput', () => {
  it('should render with placeholder', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    expect(screen.getByPlaceholderText('Idade')).toBeDefined();
  });

  it('should have numeric keyboard', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    const input = screen.getByPlaceholderText('Idade');
    expect(input.props.keyboardType).toBe('numeric');
  });

  it('should call onChange with number when valid', () => {
    const onChange = jest.fn();
    render(<OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />);

    const input = screen.getByPlaceholderText('Idade');
    fireEvent.changeText(input, '25');

    expect(onChange).toHaveBeenCalledWith(25);
  });

  it('should not call onChange when invalid number', () => {
    const onChange = jest.fn();
    render(<OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />);

    const input = screen.getByPlaceholderText('Idade');
    fireEvent.changeText(input, 'abc');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should display current value', () => {
    render(<OnboardingNumberInput value={25} onChange={() => {}} placeholder="Idade" />);
    expect(screen.getByDisplayValue('25')).toBeDefined();
  });

  it('should display empty string when value is null', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    const input = screen.getByPlaceholderText('Idade');
    expect(input.props.value).toBe('');
  });
});
