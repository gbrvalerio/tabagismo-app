import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const getDefaultAnsweredAt = () => new Date();
export const getDefaultAnswerUpdatedAt = () => new Date();

export const onboardingAnswers = sqliteTable('onboarding_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionKey: text('question_key').notNull().unique(),
  userId: integer('user_id'),
  answer: text('answer').notNull(),
  coinAwarded: integer('coin_awarded', { mode: 'boolean' }).notNull().default(false),
  answeredAt: integer('answered_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultAnsweredAt),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultAnswerUpdatedAt),
});

export type OnboardingAnswer = typeof onboardingAnswers.$inferSelect;
export type NewOnboardingAnswer = typeof onboardingAnswers.$inferInsert;
