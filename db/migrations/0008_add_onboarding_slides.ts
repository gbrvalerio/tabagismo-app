export default `CREATE TABLE \`onboarding_slides\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`order\` integer NOT NULL,
	\`icon\` text NOT NULL,
	\`title\` text NOT NULL,
	\`description\` text NOT NULL,
	\`metadata\` text,
	\`created_at\` integer NOT NULL
);
`;
