import { describe, it, expect } from '@jest/globals';
import { coinTransactions, TransactionType } from './coin-transactions';

describe('coinTransactions schema', () => {
  it('should have required fields', () => {
    const schema = coinTransactions;
    expect(schema.id).toBeDefined();
    expect(schema.amount).toBeDefined();
    expect(schema.type).toBeDefined();
    expect(schema.metadata).toBeDefined();
    expect(schema.createdAt).toBeDefined();
  });

  it('should infer correct types', () => {
    type CoinTransaction = typeof coinTransactions.$inferSelect;
    type NewCoinTransaction = typeof coinTransactions.$inferInsert;

    const transaction: CoinTransaction = {
      id: 1,
      amount: 1,
      type: TransactionType.ONBOARDING_ANSWER,
      metadata: '{"questionKey":"q1"}',
      createdAt: new Date(),
    };

    expect(transaction).toBeDefined();
  });

  it('should have TransactionType enum', () => {
    expect(TransactionType.ONBOARDING_ANSWER).toBe('onboarding_answer');
    expect(TransactionType.QUESTION_ANSWER).toBe('question_answer');
    expect(TransactionType.DAILY_REWARD).toBe('daily_reward');
    expect(TransactionType.PURCHASE).toBe('purchase');
    expect(TransactionType.BONUS).toBe('bonus');
  });

  it('should use QUESTION_ANSWER type in transaction objects', () => {
    type CoinTransaction = typeof coinTransactions.$inferSelect;

    const transaction: CoinTransaction = {
      id: 1,
      amount: 1,
      type: TransactionType.QUESTION_ANSWER,
      metadata: JSON.stringify({
        context: 'onboarding',
        questionKey: 'name',
      }),
      createdAt: new Date(),
    };

    expect(transaction.type).toBe('question_answer');
    expect(JSON.parse(transaction.metadata!).context).toBe('onboarding');
  });
});
