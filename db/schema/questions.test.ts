import { describe, it, expect } from '@jest/globals';
import { questions, QuestionType, QuestionCategory, getDefaultCreatedAt } from './questions';

describe('questions schema', () => {
  it('should export QuestionType enum', () => {
    expect(QuestionType.TEXT).toBe('TEXT');
    expect(QuestionType.NUMBER).toBe('NUMBER');
    expect(QuestionType.SINGLE_CHOICE).toBe('SINGLE_CHOICE');
    expect(QuestionType.MULTIPLE_CHOICE).toBe('MULTIPLE_CHOICE');
  });

  it('should export QuestionCategory enum', () => {
    expect(QuestionCategory.PROFILE).toBe('PROFILE');
    expect(QuestionCategory.ADDICTION).toBe('ADDICTION');
    expect(QuestionCategory.HABITS).toBe('HABITS');
    expect(QuestionCategory.MOTIVATION).toBe('MOTIVATION');
    expect(QuestionCategory.GOALS).toBe('GOALS');
  });

  it('should have all required columns defined', () => {
    expect(questions.id).toBeDefined();
    expect(questions.key).toBeDefined();
    expect(questions.order).toBeDefined();
    expect(questions.type).toBeDefined();
    expect(questions.category).toBeDefined();
    expect(questions.questionText).toBeDefined();
    expect(questions.required).toBeDefined();
    expect(questions.dependsOnQuestionKey).toBeDefined();
    expect(questions.dependsOnValue).toBeDefined();
    expect(questions.metadata).toBeDefined();
    expect(questions.createdAt).toBeDefined();
  });

  it('should have getDefaultCreatedAt return a Date', () => {
    const result = getDefaultCreatedAt();
    expect(result).toBeInstanceOf(Date);
  });

  it('should have correct column names', () => {
    expect(questions.id.name).toBe('id');
    expect(questions.key.name).toBe('key');
    expect(questions.order.name).toBe('order');
    expect(questions.type.name).toBe('type');
    expect(questions.category.name).toBe('category');
    expect(questions.questionText.name).toBe('question_text');
    expect(questions.required.name).toBe('required');
    expect(questions.dependsOnQuestionKey.name).toBe('depends_on_question_key');
    expect(questions.dependsOnValue.name).toBe('depends_on_value');
    expect(questions.metadata.name).toBe('metadata');
    expect(questions.createdAt.name).toBe('created_at');
  });
});
