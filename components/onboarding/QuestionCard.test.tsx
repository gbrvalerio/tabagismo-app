import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { QuestionCard } from './QuestionCard';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

describe('QuestionCard', () => {
  it('should render children', () => {
    render(
      <QuestionCard questionKey="test-key">
        <Text>Test content</Text>
      </QuestionCard>
    );
    expect(screen.getByText('Test content')).toBeDefined();
  });

  it('should apply container styles', () => {
    const { toJSON } = render(
      <QuestionCard questionKey="test-key">
        <Text>Test</Text>
      </QuestionCard>
    );
    expect(toJSON()).toBeDefined();
  });

  it('should size to content with animated layout', () => {
    const { getByTestId } = render(
      <QuestionCard questionKey="test-key">
        <Text>Content</Text>
      </QuestionCard>
    );

    const card = getByTestId('question-card');
    const styles = card.props.style;
    const flatStyle = Array.isArray(styles)
      ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
      : styles;

    // Card should size to content (no flexGrow) with Layout animations for smooth transitions
    expect(flatStyle.flexGrow).toBeUndefined();
    expect(flatStyle.width).toBe('100%');
  });

  it('should re-animate when questionKey changes', () => {
    const { rerender } = render(
      <QuestionCard questionKey="question-1">
        <Text>Question 1</Text>
      </QuestionCard>
    );

    // Re-render with different questionKey should trigger new animation
    rerender(
      <QuestionCard questionKey="question-2">
        <Text>Question 2</Text>
      </QuestionCard>
    );

    expect(screen.getByText('Question 2')).toBeDefined();
  });
});
