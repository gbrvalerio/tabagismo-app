import { describe, it, expect } from '@jest/globals';
import { getTableConfig } from 'drizzle-orm/sqlite-core';
import { questionAnswers, getDefaultQAAnsweredAt, getDefaultQAUpdatedAt } from './question-answers';

describe('questionAnswers schema', () => {
  it('should have all required columns defined', () => {
    expect(questionAnswers.id).toBeDefined();
    expect(questionAnswers.context).toBeDefined();
    expect(questionAnswers.questionKey).toBeDefined();
    expect(questionAnswers.userId).toBeDefined();
    expect(questionAnswers.answer).toBeDefined();
    expect(questionAnswers.answeredAt).toBeDefined();
    expect(questionAnswers.updatedAt).toBeDefined();
  });

  it('should have getDefaultQAAnsweredAt return a Date', () => {
    const result = getDefaultQAAnsweredAt();
    expect(result).toBeInstanceOf(Date);
  });

  it('should have getDefaultQAUpdatedAt return a Date', () => {
    const result = getDefaultQAUpdatedAt();
    expect(result).toBeInstanceOf(Date);
  });

  it('should have correct column names', () => {
    expect(questionAnswers.id.name).toBe('id');
    expect(questionAnswers.context.name).toBe('context');
    expect(questionAnswers.questionKey.name).toBe('question_key');
    expect(questionAnswers.userId.name).toBe('user_id');
    expect(questionAnswers.answer.name).toBe('answer');
    expect(questionAnswers.answeredAt.name).toBe('answered_at');
    expect(questionAnswers.updatedAt.name).toBe('updated_at');
  });

  it('should have context column as not null', () => {
    expect(questionAnswers.context.notNull).toBe(true);
  });

  it('should have questionKey column as not null', () => {
    expect(questionAnswers.questionKey.notNull).toBe(true);
  });

  it('should have answer column as not null', () => {
    expect(questionAnswers.answer.notNull).toBe(true);
  });

  it('should have userId column as nullable', () => {
    expect(questionAnswers.userId.notNull).toBe(false);
  });

  it('should have a unique index on context and questionKey', () => {
    const config = getTableConfig(questionAnswers);
    const uniqueIdx = config.indexes.find(
      (idx) => idx.config.name === 'question_answers_context_key_unique'
    );
    expect(uniqueIdx).toBeDefined();
    expect(uniqueIdx!.config.unique).toBe(true);
    const columnNames = uniqueIdx!.config.columns.map((c: any) => c.name);
    expect(columnNames).toEqual(['context', 'question_key']);
  });
});
