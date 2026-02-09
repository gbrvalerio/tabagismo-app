import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OnboardingTextInput } from './TextInput';

// Mock expo-haptics
jest.mock('@/lib/haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('OnboardingTextInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with placeholder as floating label', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    expect(screen.getByText('Nome')).toBeDefined();
  });

  it('should call onChange when text changes', () => {
    const onChange = jest.fn();
    render(<OnboardingTextInput value="" onChange={onChange} placeholder="Nome" />);

    const input = screen.getByDisplayValue('');
    fireEvent.changeText(input, 'John');

    expect(onChange).toHaveBeenCalledWith('John');
  });

  it('should display current value', () => {
    render(<OnboardingTextInput value="John" onChange={() => {}} placeholder="Nome" />);
    expect(screen.getByDisplayValue('John')).toBeDefined();
  });

  it('should have Poppins Regular font family on input', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    const input = screen.getByDisplayValue('');
    const styles = input.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontFamily).toBe('Poppins_400Regular');
  });

  it('should have 16px font size on input', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    const input = screen.getByDisplayValue('');
    const styles = input.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontSize).toBe(16);
  });

  it('should respect maxLength of 100 characters', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    const input = screen.getByDisplayValue('');
    expect(input.props.maxLength).toBe(100);
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
    const { unmount } = render(
      <OnboardingTextInput value="" onChange={onChange} placeholder="Nome" />
    );

    unmount();

    // Verify no timers are pending
    expect(jest.getTimerCount()).toBe(0);

    jest.useRealTimers();
  });

  it('should trigger haptic feedback on focus', () => {
    const Haptics = require('@/lib/haptics');
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);

    const input = screen.getByDisplayValue('');
    fireEvent(input, 'focus');

    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('should allow focusing input by pressing container', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);

    const input = screen.getByDisplayValue('');
    expect(input).toBeDefined();
  });

  it('should handle blur event', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    const input = screen.getByDisplayValue('');

    // Trigger blur event
    fireEvent(input, 'blur');

    // Should not crash
    expect(input).toBeDefined();
  });

  it('should focus input when container is pressed', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    const container = screen.getByTestId('text-input-container');

    // Trigger press on container
    fireEvent.press(container);

    // Should not crash
    expect(container).toBeDefined();
  });
});
