import { useQuery } from '@tanstack/react-query';
import { sql } from 'drizzle-orm';
import { db } from '../client';
import { coinTransactions } from '../schema';

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
