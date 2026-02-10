export default `DROP INDEX \`question_answers_context_key_user_unique\`;--> statement-breakpoint
CREATE UNIQUE INDEX \`question_answers_context_key_unique\` ON \`question_answers\` (\`context\`,\`question_key\`);`;
