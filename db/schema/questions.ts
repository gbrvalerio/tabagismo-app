import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const getDefaultCreatedAt = () => new Date();

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  order: integer('order').notNull(),
  type: text('type').notNull(),
  category: text('category').notNull(),
  questionText: text('question_text').notNull(),
  required: integer('required', { mode: 'boolean' }).notNull().default(true),
  dependsOnQuestionKey: text('depends_on_question_key'),
  dependsOnValue: text('depends_on_value'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultCreatedAt),
});

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export enum QuestionType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

export enum QuestionCategory {
  PROFILE = 'PROFILE',
  ADDICTION = 'ADDICTION',
  HABITS = 'HABITS',
  MOTIVATION = 'MOTIVATION',
  GOALS = 'GOALS',
}
