import { describe, it, expect } from '@jest/globals';
import { onboardingQuestionsData, seedOnboardingQuestions } from './seed-questions';
import { QuestionType, QuestionCategory } from '../schema/questions';
import { db } from '../client';

// Mock db for seed function execution
jest.mock('../client', () => {
  const mockExecute = jest.fn().mockResolvedValue(undefined);
  const mockValues = jest.fn().mockResolvedValue(undefined);

  return {
    db: {
      delete: jest.fn(() => ({ execute: mockExecute })),
      insert: jest.fn(() => ({ values: mockValues })),
    },
  };
});

describe('onboardingQuestionsData', () => {
  it('should contain at least 10 questions', () => {
    expect(onboardingQuestionsData.length).toBeGreaterThanOrEqual(10);
  });

  it('should have questions in correct order', () => {
    for (let i = 0; i < onboardingQuestionsData.length - 1; i++) {
      expect(onboardingQuestionsData[i].order).toBeLessThan(
        onboardingQuestionsData[i + 1].order
      );
    }
  });

  it('should have unique keys', () => {
    const keys = onboardingQuestionsData.map(q => q.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('should have valid question types', () => {
    const validTypes = Object.values(QuestionType);
    for (const question of onboardingQuestionsData) {
      expect(validTypes).toContain(question.type);
    }
  });

  it('should have valid question categories', () => {
    const validCategories = Object.values(QuestionCategory);
    for (const question of onboardingQuestionsData) {
      expect(validCategories).toContain(question.category);
    }
  });

  it('should have name as the first question', () => {
    expect(onboardingQuestionsData[0].key).toBe('name');
    expect(onboardingQuestionsData[0].type).toBe(QuestionType.TEXT);
  });

  it('should have dependency questions for addiction_type', () => {
    const dependentOnAddiction = onboardingQuestionsData.filter(
      q => q.dependsOnQuestionKey === 'addiction_type'
    );
    expect(dependentOnAddiction.length).toBeGreaterThanOrEqual(2);
  });

  it('should have choices metadata for choice-type questions', () => {
    const choiceQuestions = onboardingQuestionsData.filter(
      q => q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.MULTIPLE_CHOICE
    );
    for (const question of choiceQuestions) {
      const metadata = question.metadata as { choices?: string[] };
      expect(metadata?.choices).toBeDefined();
      expect(Array.isArray(metadata?.choices)).toBe(true);
      expect(metadata?.choices?.length).toBeGreaterThan(0);
    }
  });
});

describe('seedOnboardingQuestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof seedOnboardingQuestions).toBe('function');
  });

  it('should delete existing questions before inserting', async () => {
    await seedOnboardingQuestions();

    expect(db.delete).toHaveBeenCalled();
  });

  it('should insert all question data', async () => {
    await seedOnboardingQuestions();

    expect(db.insert).toHaveBeenCalled();
  });

  it('should log the number of inserted questions', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await seedOnboardingQuestions();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(`[SEED] Inserted ${onboardingQuestionsData.length} questions`)
    );

    consoleSpy.mockRestore();
  });
});
