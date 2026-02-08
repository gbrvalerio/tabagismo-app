import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const getDefaultUpdatedAt = () => new Date();

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultUpdatedAt),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
