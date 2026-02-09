CREATE TABLE `question_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`context` text NOT NULL,
	`question_key` text NOT NULL,
	`user_id` integer,
	`answer` text NOT NULL,
	`answered_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_answers_context_key_user_unique` ON `question_answers` (`context`,`question_key`,`user_id`);--> statement-breakpoint
DROP TABLE `onboarding_answers`;--> statement-breakpoint
DROP INDEX `questions_key_unique`;--> statement-breakpoint
ALTER TABLE `questions` ADD `context` text DEFAULT 'onboarding' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `questions_context_key_unique` ON `questions` (`context`,`key`);