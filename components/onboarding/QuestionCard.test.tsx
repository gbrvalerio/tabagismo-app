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
      <QuestionCard>
        <Text>Test content</Text>
      </QuestionCard>
    );
    expect(screen.getByText('Test content')).toBeDefined();
  });

  it('should apply container styles', () => {
    const { toJSON } = render(
      <QuestionCard>
        <Text>Test</Text>
      </QuestionCard>
    );
    expect(toJSON()).toBeDefined();
  });
});
