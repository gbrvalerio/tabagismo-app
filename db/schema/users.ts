import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const getDefaultUserCreatedAt = () => new Date();

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  coins: integer('coins').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultUserCreatedAt),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
