/**
 * Answer Serialization Utilities
 *
 * Handles serialization/deserialization of question answers between database (strings)
 * and component state (typed values).
 *
 * Database storage format:
 * - TEXT: plain string
 * - NUMBER: string representation of number
 * - SINGLE_CHOICE: plain string
 * - MULTIPLE_CHOICE: JSON array string (e.g., '["option1", "option2"]')
 */

import { QuestionType } from '@/db/schema/questions';

export type AnswerValue = string | number | string[] | null;

// Accept both enum values and string literals
type QuestionTypeParam = QuestionType | string;

/**
 * Deserializes a database answer string to the appropriate typed value
 * based on question type.
 *
 * @param answer - Raw answer string from database
 * @param questionType - Type of question (TEXT, NUMBER, SINGLE_CHOICE, MULTIPLE_CHOICE)
 * @returns Typed answer value for use in components
 *
 * @example
 * deserializeAnswer('["option1", "option2"]', 'MULTIPLE_CHOICE')
 * // Returns: ["option1", "option2"]
 *
 * deserializeAnswer('42', 'NUMBER')
 * // Returns: 42
 */
export function deserializeAnswer(
  answer: string | null | undefined,
  questionType: QuestionTypeParam
): AnswerValue {
  if (answer === null || answer === undefined) return null;

  switch (questionType) {
    case QuestionType.MULTIPLE_CHOICE:
    case 'MULTIPLE_CHOICE':
      try {
        const parsed = JSON.parse(answer);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return null;
      } catch {
        // If parsing fails, treat as corrupted data
        return null;
      }

    case QuestionType.NUMBER:
    case 'NUMBER':
      const num = Number(answer);
      return isNaN(num) ? null : num;

    case QuestionType.TEXT:
    case 'TEXT':
    case QuestionType.SINGLE_CHOICE:
    case 'SINGLE_CHOICE':
    default:
      return answer;
  }
}

/**
 * Serializes a typed answer value to a database-compatible string
 * based on question type.
 *
 * @param value - Typed answer value from component
 * @param questionType - Type of question (TEXT, NUMBER, SINGLE_CHOICE, MULTIPLE_CHOICE)
 * @returns String representation for database storage
 *
 * @example
 * serializeAnswer(["option1", "option2"], 'MULTIPLE_CHOICE')
 * // Returns: '["option1","option2"]'
 *
 * serializeAnswer(42, 'NUMBER')
 * // Returns: "42"
 */
export function serializeAnswer(
  value: AnswerValue,
  questionType: QuestionTypeParam
): string {
  if (value === null || value === undefined) return '';

  switch (questionType) {
    case QuestionType.MULTIPLE_CHOICE:
    case 'MULTIPLE_CHOICE':
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      // Fallback for invalid data
      return '[]';

    case QuestionType.NUMBER:
    case 'NUMBER':
      return String(value);

    case QuestionType.TEXT:
    case 'TEXT':
    case QuestionType.SINGLE_CHOICE:
    case 'SINGLE_CHOICE':
    default:
      return String(value);
  }
}

/**
 * Compares two answer values for equality, handling type conversions correctly.
 *
 * @param a - First answer value (deserialized)
 * @param b - Second answer value (usually from database as string)
 * @param questionType - Type of question
 * @returns true if answers are equal
 *
 * @example
 * areAnswersEqual(["option1"], '["option1"]', 'MULTIPLE_CHOICE')
 * // Returns: true
 *
 * areAnswersEqual(42, '42', 'NUMBER')
 * // Returns: true
 *
 * areAnswersEqual(["option1", "option2"], '["option1"]', 'MULTIPLE_CHOICE')
 * // Returns: false
 */
export function areAnswersEqual(
  a: AnswerValue,
  b: string | null | undefined,
  questionType: QuestionTypeParam
): boolean {
  // Compare by serializing both values
  const serializedA = serializeAnswer(a, questionType);
  const serializedB = b ?? '';

  return serializedA === serializedB;
}
