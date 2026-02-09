import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OnboardingNumberInput } from './NumberInput';

// Mock expo-haptics
jest.mock('@/lib/haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('OnboardingNumberInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with placeholder as floating label', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    expect(screen.getByText('Idade')).toBeDefined();
  });

  it('should have numeric keyboard', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    const input = screen.getByDisplayValue('');
    expect(input.props.keyboardType).toBe('numeric');
  });

  it('should call onChange with number when valid', () => {
    const onChange = jest.fn();
    render(<OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, '25');

    expect(onChange).toHaveBeenCalledWith(25);
  });

  it('should not call onChange when invalid number', () => {
    const onChange = jest.fn();
    render(<OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, 'abc');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should display current value', () => {
    render(<OnboardingNumberInput value={25} onChange={() => {}} placeholder="Idade" />);
    expect(screen.getByDisplayValue('25')).toBeDefined();
  });

  it('should display empty string when value is null', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    const input = screen.getByDisplayValue('');
    expect(input.props.value).toBe('');
  });

  it('should auto-focus on mount', () => {
    jest.useFakeTimers();
    const onChange = jest.fn();

    render(<OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />);

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
    const { unmount } = render(
      <OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />
    );

    unmount();

    // Verify no timers are pending
    expect(jest.getTimerCount()).toBe(0);

    jest.useRealTimers();
  });

  it('should call onChange with null when field is cleared', () => {
    const onChange = jest.fn();
    render(<OnboardingNumberInput value={25} onChange={onChange} placeholder="Idade" />);

    const input = screen.getByDisplayValue('25');
    fireEvent.changeText(input, '');

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should allow deleting digits one by one', () => {
    const onChange = jest.fn();
    render(<OnboardingNumberInput value={25} onChange={onChange} placeholder="Idade" />);

    const input = screen.getByDisplayValue('25');

    // Delete last digit
    fireEvent.changeText(input, '2');
    expect(onChange).toHaveBeenCalledWith(2);

    // Clear completely
    fireEvent.changeText(input, '');
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should trigger haptic feedback on focus', () => {
    const Haptics = require('@/lib/haptics');
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);

    const input = screen.getByDisplayValue('');
    fireEvent(input, 'focus');

    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('should show number badge when valid number is entered', () => {
    render(<OnboardingNumberInput value={25} onChange={() => {}} placeholder="Idade" />);
    expect(screen.getByText('#')).toBeDefined();
  });

  it('should have Poppins Regular font family on input', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    const input = screen.getByDisplayValue('');
    const styles = input.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontFamily).toBe('Poppins_400Regular');
  });

  it('should have 16px font size on input', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    const input = screen.getByDisplayValue('');
    const styles = input.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontSize).toBe(16);
  });
});
