import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../client";
import { coinTransactions, TransactionType } from "../schema/coin-transactions";

/**
 * Get user's total coins from transaction ledger
 * This is the new implementation that sums from coin_transactions table
 */
export function useUserCoinsFromTransactions() {
  return useQuery({
    queryKey: ["users", "coins"],
    queryFn: async () => {
      const result = await db
        .select({
          total: sql<number>`COALESCE(SUM(${coinTransactions.amount}), 0)`,
        })
        .from(coinTransactions)
        .get();
      return result?.total ?? 0;
    },
  });
}

/**
 * Get user's total coins from transaction ledger
 * Alias for useUserCoinsFromTransactions for cleaner API
 */
export function useUserCoins() {
  return useUserCoinsFromTransactions();
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
      queryClient.invalidateQueries({ queryKey: ["users", "coins"] });
    },
  });
}

export function useHasQuestionReward(context: string, questionKey: string) {
  return useQuery({
    queryKey: ["transactions", "question", context, questionKey],
    queryFn: async () => {
      const transaction = await db
        .select()
        .from(coinTransactions)
        .where(
          and(
            eq(coinTransactions.type, TransactionType.QUESTION_ANSWER),
            sql`json_extract(${coinTransactions.metadata}, '$.context') = ${context}`,
            sql`json_extract(${coinTransactions.metadata}, '$.questionKey') = ${questionKey}`,
          ),
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
      queryClient.invalidateQueries({ queryKey: ["users", "coins"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
