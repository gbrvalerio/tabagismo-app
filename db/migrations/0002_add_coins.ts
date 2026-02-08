export default `CREATE TABLE \`users\` (
\t\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
\t\`coins\` integer DEFAULT 0 NOT NULL,
\t\`created_at\` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE \`onboarding_answers\` ADD \`coin_awarded\` integer DEFAULT false NOT NULL;`;
