import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { QuestionInput } from './QuestionInput';
import type { Question } from '@/db/schema';

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

jest.mock('@/lib/haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  impactAsync: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

const makeQuestion = (overrides: Partial<Question>): Question => ({
  id: 1,
  key: 'test',
  order: 1,
  type: 'TEXT',
  category: 'PROFILE',
  questionText: 'Test?',
  required: true,
  dependsOnQuestionKey: null,
  dependsOnValue: null,
  metadata: {},
  createdAt: new Date(),
  ...overrides,
});

describe('QuestionInput', () => {
  it('should render TextInput for TEXT type', () => {
    const question = makeQuestion({ key: 'name', type: 'TEXT' });
    render(<QuestionInput question={question} value="" onChange={() => {}} />);
    expect(screen.getByText('Digite sua resposta')).toBeDefined();
  });

  it('should render NumberInput for NUMBER type', () => {
    const question = makeQuestion({ key: 'age', type: 'NUMBER' });
    render(<QuestionInput question={question} value={null} onChange={() => {}} />);
    expect(screen.getByText('Digite um número')).toBeDefined();
  });

  it('should render SingleChoiceCards for SINGLE_CHOICE type', () => {
    const question = makeQuestion({
      key: 'gender',
      type: 'SINGLE_CHOICE',
      metadata: { choices: ['Masculino', 'Feminino'] },
    });
    render(<QuestionInput question={question} value={null} onChange={() => {}} />);
    expect(screen.getByText('Masculino')).toBeDefined();
    expect(screen.getByText('Feminino')).toBeDefined();
  });

  it('should render MultipleChoiceCards for MULTIPLE_CHOICE type', () => {
    const question = makeQuestion({
      key: 'triggers',
      type: 'MULTIPLE_CHOICE',
      metadata: { choices: ['Ansiedade', 'Estresse'] },
    });
    render(<QuestionInput question={question} value={[]} onChange={() => {}} />);
    expect(screen.getByText('Ansiedade')).toBeDefined();
    expect(screen.getByText('Estresse')).toBeDefined();
  });

  it('should return null for unknown type', () => {
    const question = makeQuestion({ type: 'UNKNOWN' });
    const { toJSON } = render(<QuestionInput question={question} value={null} onChange={() => {}} />);
    expect(toJSON()).toBeNull();
  });
});
