import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sql, eq, and } from 'drizzle-orm';
import { db } from '../client';
import { coinTransactions, TransactionType } from '../schema';

export function useUserCoins() {
  return useQuery({
    queryKey: ['users', 'coins'],
    queryFn: async () => {
      const result = await db
        .select({
          total: sql<number>`COALESCE(SUM(${coinTransactions.amount}), 0)`
        })
        .from(coinTransactions)
        .get();
      return result?.total ?? 0;
    },
  });
}

export function useAwardCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      type,
      metadata,
    }: {
      amount: number;
      type: string;
      metadata?: Record<string, unknown>;
    }) => {
      const result = await db
        .insert(coinTransactions)
        .values({
          amount,
          type,
          metadata: metadata ? JSON.stringify(metadata) : null,
        })
        .returning();
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'coins'] });
    },
  });
}

export function useHasQuestionReward(questionKey: string) {
  return useQuery({
    queryKey: ['transactions', 'question', questionKey],
    queryFn: async () => {
      const transaction = await db
        .select()
        .from(coinTransactions)
        .where(
          and(
            eq(coinTransactions.type, TransactionType.ONBOARDING_ANSWER),
            sql`json_extract(${coinTransactions.metadata}, '$.questionKey') = ${questionKey}`
          )
        )
        .get();
      return !!transaction;
    },
  });
}

export function useResetUserCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await db.delete(coinTransactions).execute();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'coins'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
