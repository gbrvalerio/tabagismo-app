import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { QuestionText } from './QuestionText';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

describe('QuestionText', () => {
  it('should render question text', () => {
    render(<QuestionText text="Qual é o seu nome?" />);
    expect(screen.getByText('Qual é o seu nome?')).toBeDefined();
  });

  it('should apply large font size', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    const styles = element.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontSize).toBe(32); // Updated to match typography.fontSize.xxl
  });

  it('should apply bold weight', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    const styles = element.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontWeight).toBe('900'); // Updated to match typography.fontWeight.black
  });

  it('should apply theme color', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    const styles = element.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.color).toBe('#1A1A2E'); // Updated to match colors.neutral.black
  });
});
