export default `DROP INDEX \`question_answers_context_key_user_unique\`;--> statement-breakpoint
DELETE FROM \`question_answers\`
WHERE id NOT IN (
  SELECT MAX(id)
  FROM \`question_answers\`
  GROUP BY context, question_key
);--> statement-breakpoint
CREATE UNIQUE INDEX \`question_answers_context_key_unique\` ON \`question_answers\` (\`context\`,\`question_key\`);`;
