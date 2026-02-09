export default `CREATE TABLE \`coin_transactions\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`amount\` integer NOT NULL,
	\`type\` text NOT NULL,
	\`metadata\` text,
	\`created_at\` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX \`tx_type_idx\` ON \`coin_transactions\` (\`type\`);
--> statement-breakpoint
CREATE INDEX \`tx_created_idx\` ON \`coin_transactions\` (\`created_at\`);`;
