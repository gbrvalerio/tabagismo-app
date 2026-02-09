export default `
INSERT INTO coin_transactions (amount, type, metadata, created_at)
SELECT
  1 as amount,
  'onboarding_answer' as type,
  json_object('questionKey', question_key) as metadata,
  answered_at as created_at
FROM onboarding_answers
WHERE coin_awarded = 1;
`.trim();
