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

  it('should apply hero font size of 30px', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    const styles = element.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontSize).toBe(30);
  });

  it('should apply Poppins Bold font family', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    const styles = element.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.fontFamily).toBe('Poppins_700Bold');
  });

  it('should apply letter spacing of -0.3', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    const styles = element.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.letterSpacing).toBe(-0.3);
  });

  it('should apply dark text color', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    const styles = element.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.color).toBe('#1A1A2E');
  });

  it('should apply hero line height of 38', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    const styles = element.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;
    expect(flatStyle.lineHeight).toBe(38);
  });
});
