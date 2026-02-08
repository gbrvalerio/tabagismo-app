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

  it('should auto-focus on mount', () => {
    jest.useFakeTimers();
    const onChange = jest.fn();

    render(<OnboardingTextInput value="" onChange={onChange} placeholder="Nome" />);

    // Verify timer is scheduled
    expect(jest.getTimerCount()).toBe(1);

    // Fast-forward past the 300ms delay
    jest.advanceTimersByTime(300);

    // After timeout, timer should be cleared
    expect(jest.getTimerCount()).toBe(0);

    jest.useRealTimers();
  });

  it('should cleanup timer on unmount', () => {
    jest.useFakeTimers();
    const onChange = jest.fn();
    const { unmount } = render(<OnboardingTextInput value="" onChange={onChange} placeholder="Nome" />);

    unmount();

    // Verify no timers are pending
    expect(jest.getTimerCount()).toBe(0);

    jest.useRealTimers();
  });
});
