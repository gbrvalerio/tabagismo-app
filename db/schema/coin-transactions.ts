import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const getDefaultTransactionCreatedAt = () => new Date();

export const coinTransactions = sqliteTable('coin_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultTransactionCreatedAt),
});

export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type NewCoinTransaction = typeof coinTransactions.$inferInsert;

export enum TransactionType {
  ONBOARDING_ANSWER = 'onboarding_answer', // @deprecated - Use QUESTION_ANSWER instead
  QUESTION_ANSWER = 'question_answer',
  DAILY_REWARD = 'daily_reward',
  PURCHASE = 'purchase',
  BONUS = 'bonus',
}
