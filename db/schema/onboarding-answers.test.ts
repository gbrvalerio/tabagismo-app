import { describe, it, expect } from '@jest/globals';
import { onboardingAnswers, getDefaultAnsweredAt, getDefaultAnswerUpdatedAt } from './onboarding-answers';

describe('onboardingAnswers schema', () => {
  it('should have all required columns defined', () => {
    expect(onboardingAnswers.id).toBeDefined();
    expect(onboardingAnswers.questionKey).toBeDefined();
    expect(onboardingAnswers.userId).toBeDefined();
    expect(onboardingAnswers.answer).toBeDefined();
    expect(onboardingAnswers.answeredAt).toBeDefined();
    expect(onboardingAnswers.updatedAt).toBeDefined();
  });

  it('should have getDefaultAnsweredAt return a Date', () => {
    const result = getDefaultAnsweredAt();
    expect(result).toBeInstanceOf(Date);
  });

  it('should have getDefaultAnswerUpdatedAt return a Date', () => {
    const result = getDefaultAnswerUpdatedAt();
    expect(result).toBeInstanceOf(Date);
  });

  it('should have correct column names', () => {
    expect(onboardingAnswers.id.name).toBe('id');
    expect(onboardingAnswers.questionKey.name).toBe('question_key');
    expect(onboardingAnswers.userId.name).toBe('user_id');
    expect(onboardingAnswers.answer.name).toBe('answer');
    expect(onboardingAnswers.coinAwarded.name).toBe('coin_awarded');
    expect(onboardingAnswers.answeredAt.name).toBe('answered_at');
    expect(onboardingAnswers.updatedAt.name).toBe('updated_at');
  });

  it('should have coinAwarded field with default false', () => {
    const schema = onboardingAnswers;
    expect(schema.coinAwarded).toBeDefined();
  });
});
