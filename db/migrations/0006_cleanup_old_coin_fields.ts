export default `
ALTER TABLE onboarding_answers DROP COLUMN coin_awarded;
--> statement-breakpoint
ALTER TABLE users DROP COLUMN coins;
`.trim();