import { describe, it, expect } from '@jest/globals';
import { computeApplicableQuestions } from './onboarding-flow';

// Define the type inline since the schema may not exist yet
type MockQuestion = {
  id: number;
  key: string;
  order: number;
  type: string;
  category: string;
  questionText: string;
  required: boolean;
  dependsOnQuestionKey: string | null;
  dependsOnValue: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

describe('computeApplicableQuestions', () => {
  const mockQuestions: MockQuestion[] = [
    {
      id: 1,
      key: 'name',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'Qual é o seu nome?',
      required: true,
      dependsOnQuestionKey: null,
      dependsOnValue: null,
      metadata: {},
      createdAt: new Date(),
    },
    {
      id: 2,
      key: 'addiction_type',
      order: 2,
      type: 'SINGLE_CHOICE',
      category: 'ADDICTION',
      questionText: 'Qual é o seu vício?',
      required: true,
      dependsOnQuestionKey: null,
      dependsOnValue: null,
      metadata: { choices: ['Cigarro/Tabaco', 'Pod/Vape'] },
      createdAt: new Date(),
    },
    {
      id: 3,
      key: 'cigarettes_per_day',
      order: 3,
      type: 'NUMBER',
      category: 'HABITS',
      questionText: 'Quantos cigarros por dia?',
      required: true,
      dependsOnQuestionKey: 'addiction_type',
      dependsOnValue: 'Cigarro/Tabaco',
      metadata: {},
      createdAt: new Date(),
    },
    {
      id: 4,
      key: 'pod_duration_days',
      order: 4,
      type: 'NUMBER',
      category: 'HABITS',
      questionText: 'Quantos dias dura um pod?',
      required: true,
      dependsOnQuestionKey: 'addiction_type',
      dependsOnValue: 'Pod/Vape',
      metadata: {},
      createdAt: new Date(),
    },
  ];

  it('should return all questions when no dependencies', () => {
    const result = computeApplicableQuestions(mockQuestions, {});
    expect(result).toHaveLength(2); // Only name and addiction_type
    expect(result[0].key).toBe('name');
    expect(result[1].key).toBe('addiction_type');
  });

  it('should show cigarette questions when addiction_type is Cigarro', () => {
    const answers = { addiction_type: 'Cigarro/Tabaco' };
    const result = computeApplicableQuestions(mockQuestions, answers);

    expect(result).toHaveLength(3);
    expect(result.find(q => q.key === 'cigarettes_per_day')).toBeDefined();
    expect(result.find(q => q.key === 'pod_duration_days')).toBeUndefined();
  });

  it('should show pod questions when addiction_type is Pod', () => {
    const answers = { addiction_type: 'Pod/Vape' };
    const result = computeApplicableQuestions(mockQuestions, answers);

    expect(result).toHaveLength(3);
    expect(result.find(q => q.key === 'pod_duration_days')).toBeDefined();
    expect(result.find(q => q.key === 'cigarettes_per_day')).toBeUndefined();
  });

  it('should maintain order by order field', () => {
    const answers = { addiction_type: 'Cigarro/Tabaco' };
    const result = computeApplicableQuestions(mockQuestions, answers);

    expect(result[0].order).toBe(1);
    expect(result[1].order).toBe(2);
    expect(result[2].order).toBe(3);
  });
});
