import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const getDefaultSlideCreatedAt = () => new Date();

export const onboardingSlides = sqliteTable('onboarding_slides', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  order: integer('order').notNull(),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultSlideCreatedAt),
});

export type OnboardingSlide = typeof onboardingSlides.$inferSelect;
export type NewOnboardingSlide = typeof onboardingSlides.$inferInsert;
