import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sql } from 'drizzle-orm';
import { db } from '../client';
import { users } from '../schema';

export function useUserCoins() {
  return useQuery({
    queryKey: ['users', 'coins'],
    queryFn: async () => {
      const user = await db.select().from(users).get();
      return user?.coins ?? 0;
    },
  });
}

export function useIncrementCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const existingUser = await db.select().from(users).get();

      if (existingUser) {
        await db
          .update(users)
          .set({ coins: sql`coins + ${amount}` })
          .where(sql`id = ${existingUser.id}`)
          .execute();
      } else {
        await db.insert(users).values({ coins: amount }).execute();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'coins'] });
    },
  });
}
