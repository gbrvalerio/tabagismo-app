import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const getDefaultQAAnsweredAt = () => new Date();
export const getDefaultQAUpdatedAt = () => new Date();

export const questionAnswers = sqliteTable('question_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  context: text('context').notNull(),
  questionKey: text('question_key').notNull(),
  userId: integer('user_id'),
  answer: text('answer').notNull(),
  answeredAt: integer('answered_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultQAAnsweredAt),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultQAUpdatedAt),
}, (table) => ({
  contextKeyUserIdx: uniqueIndex('question_answers_context_key_user_unique').on(table.context, table.questionKey, table.userId),
}));

export type QuestionAnswer = typeof questionAnswers.$inferSelect;
export type NewQuestionAnswer = typeof questionAnswers.$inferInsert;
