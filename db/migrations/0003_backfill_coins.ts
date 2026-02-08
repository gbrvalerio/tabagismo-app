export default `UPDATE onboarding_answers SET coin_awarded = 1 WHERE coin_awarded = 0;
--> statement-breakpoint
INSERT OR IGNORE INTO users (id, coins, created_at)
SELECT 1, COUNT(*), strftime('%s', 'now')
FROM onboarding_answers;`;
