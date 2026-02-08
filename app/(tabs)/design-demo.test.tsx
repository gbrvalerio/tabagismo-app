// app/(tabs)/design-demo.test.tsx
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import DesignDemo from './design-demo';

describe('DesignDemo Screen', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render screen title', () => {
    const { getByText } = render(<DesignDemo />);
    expect(getByText('Design System')).toBeTruthy();
  });

  it('should render all button variants', () => {
    const { getByText } = render(<DesignDemo />);

    expect(getByText('Primary Button')).toBeTruthy();
    expect(getByText('Secondary Button')).toBeTruthy();
    expect(getByText('Minimal Button')).toBeTruthy();
    expect(getByText('Outline Button')).toBeTruthy();
    expect(getByText('Disabled Button')).toBeTruthy();
    expect(getByText('Loading Button')).toBeTruthy();
  });

  it('should render text field examples', () => {
    const { getByText } = render(<DesignDemo />);

    expect(getByText('Nome')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Idade')).toBeTruthy();
  });

  it('should handle primary button press and show loading state', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const { getByText } = render(<DesignDemo />);

    const primaryButton = getByText('Primary Button');
    fireEvent.press(primaryButton);

    expect(consoleSpy).toHaveBeenCalledWith('Primary button pressed');

    // Fast-forward time to complete loading
    await act(() => {
      jest.advanceTimersByTime(2000);
    });

    consoleSpy.mockRestore();
  });

  it('should handle secondary button press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const { getByText } = render(<DesignDemo />);

    const secondaryButton = getByText('Secondary Button');
    fireEvent.press(secondaryButton);

    expect(consoleSpy).toHaveBeenCalledWith('Secondary');
    consoleSpy.mockRestore();
  });

  it('should handle outline button press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const { getByText } = render(<DesignDemo />);

    const outlineButton = getByText('Outline Button');
    fireEvent.press(outlineButton);

    expect(consoleSpy).toHaveBeenCalledWith('Outline');
    consoleSpy.mockRestore();
  });

  it('should handle minimal button press', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const { getByText } = render(<DesignDemo />);

    const minimalButton = getByText('Minimal Button');
    fireEvent.press(minimalButton);

    expect(consoleSpy).toHaveBeenCalledWith('Minimal');
    consoleSpy.mockRestore();
  });

  it('should validate email and show error message', () => {
    const { getByText, getByPlaceholderText } = render(<DesignDemo />);

    const emailInput = getByPlaceholderText('seu@email.com');

    // Test invalid email
    fireEvent.changeText(emailInput, 'invalidemail');
    expect(getByText('Por favor, digite um email válido')).toBeTruthy();

    // Test valid email
    fireEvent.changeText(emailInput, 'valid@email.com');
    expect(() => getByText('Por favor, digite um email válido')).toThrow();
  });

  it('should render color palette', () => {
    const { getByText } = render(<DesignDemo />);

    expect(getByText('Primary')).toBeTruthy();
    expect(getByText('Secondary')).toBeTruthy();
    expect(getByText('Gold')).toBeTruthy();
    expect(getByText('Purple')).toBeTruthy();
    expect(getByText('Pink')).toBeTruthy();
  });
});
