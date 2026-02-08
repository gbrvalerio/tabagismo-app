export default `CREATE TABLE \`questions\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`key\` text NOT NULL,
	\`order\` integer NOT NULL,
	\`type\` text NOT NULL,
	\`category\` text NOT NULL,
	\`question_text\` text NOT NULL,
	\`required\` integer DEFAULT true NOT NULL,
	\`depends_on_question_key\` text,
	\`depends_on_value\` text,
	\`metadata\` text,
	\`created_at\` integer NOT NULL
);
CREATE UNIQUE INDEX \`questions_key_unique\` ON \`questions\` (\`key\`);
CREATE TABLE \`onboarding_answers\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`question_key\` text NOT NULL,
	\`user_id\` integer,
	\`answer\` text NOT NULL,
	\`answered_at\` integer NOT NULL,
	\`updated_at\` integer NOT NULL
);
`;
