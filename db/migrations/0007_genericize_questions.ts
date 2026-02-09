export default `-- 1. Add context column to questions (defaults to 'onboarding' for existing rows)
ALTER TABLE questions ADD COLUMN context TEXT NOT NULL DEFAULT 'onboarding';
--> statement-breakpoint

-- 2. Drop old unique index on questions.key
DROP INDEX questions_key_unique;
--> statement-breakpoint

-- 3. Create unique index on (context, key)
CREATE UNIQUE INDEX questions_context_key_unique ON questions (context, key);
--> statement-breakpoint

-- 4. Create new question_answers table
CREATE TABLE question_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  context TEXT NOT NULL,
  question_key TEXT NOT NULL,
  user_id INTEGER,
  answer TEXT NOT NULL,
  answered_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint

-- 5. Create unique index on (context, question_key, user_id)
CREATE UNIQUE INDEX question_answers_context_key_user_unique ON question_answers (context, question_key, user_id);
--> statement-breakpoint

-- 6. Migrate data from onboarding_answers to question_answers
INSERT INTO question_answers (context, question_key, user_id, answer, answered_at, updated_at)
SELECT 'onboarding', question_key, user_id, answer, answered_at, updated_at
FROM onboarding_answers;
--> statement-breakpoint

-- 7. Update existing ONBOARDING_ANSWER transactions to QUESTION_ANSWER with context metadata
UPDATE coin_transactions
SET
  type = 'question_answer',
  metadata = json_object(
    'context', 'onboarding',
    'questionKey', json_extract(metadata, '$.questionKey')
  )
WHERE type = 'onboarding_answer';
--> statement-breakpoint

-- 8. Drop old onboarding_answers table
DROP TABLE onboarding_answers;
`;
