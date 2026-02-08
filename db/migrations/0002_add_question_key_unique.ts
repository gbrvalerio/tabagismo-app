export default `DELETE FROM \`onboarding_answers\` WHERE \`id\` NOT IN (
  SELECT MAX(\`id\`) FROM \`onboarding_answers\` GROUP BY \`question_key\`
);
CREATE UNIQUE INDEX \`onboarding_answers_question_key_unique\` ON \`onboarding_answers\` (\`question_key\`);
`;
