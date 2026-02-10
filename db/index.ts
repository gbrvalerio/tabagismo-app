// Export database client
export { db } from './client';

// Export repositories (hooks for components)
export * from './repositories';

// Export migration runner
export { runMigrations } from './migrate';

// Export schema types (for type annotations)
export type { Setting, NewSetting } from './schema/settings';
export type { Question, NewQuestion } from './schema/questions';
export { QuestionType, QuestionCategory } from './schema/questions';
export type { OnboardingSlide, NewOnboardingSlide } from './schema/onboarding-slides';
