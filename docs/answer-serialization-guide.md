# Answer Serialization Guide

## Overview

This guide explains how to properly handle question answer serialization/deserialization between the database (strings) and component state (typed values) to prevent data corruption.

## The Problem

Question answers are stored in the database as strings, but components work with typed values:
- **TEXT**: `string`
- **NUMBER**: `number`
- **SINGLE_CHOICE**: `string`
- **MULTIPLE_CHOICE**: `string[]` (array)

Without proper serialization, multiple choice answers get corrupted:
```typescript
// ❌ WRONG - Direct string assignment
const answer = '["option1", "option2"]';  // JSON string from DB
component.value = answer;  // Passed as string, not array!
// When component calls .includes(), it operates on characters: [",","o","p","t",...]
```

## The Solution

Use the **answer-serialization** utility module from `@/lib/answer-serialization`:

```typescript
import {
  deserializeAnswer,
  serializeAnswer,
  areAnswersEqual,
} from '@/lib/answer-serialization';
```

## API Reference

### `deserializeAnswer(answer, questionType)`

Converts database string to typed component value.

**Parameters:**
- `answer`: `string | null | undefined` - Raw answer from database
- `questionType`: `QuestionType` - Type of question (TEXT, NUMBER, SINGLE_CHOICE, MULTIPLE_CHOICE)

**Returns:** `string | number | string[] | null`

**Examples:**
```typescript
// MULTIPLE_CHOICE
deserializeAnswer('["option1","option2"]', 'MULTIPLE_CHOICE')
// Returns: ["option1", "option2"]

// NUMBER
deserializeAnswer('42', 'NUMBER')
// Returns: 42

// TEXT
deserializeAnswer('Hello', 'TEXT')
// Returns: "Hello"
```

### `serializeAnswer(value, questionType)`

Converts typed component value to database string.

**Parameters:**
- `value`: `string | number | string[] | null` - Typed value from component
- `questionType`: `QuestionType` - Type of question

**Returns:** `string`

**Examples:**
```typescript
// MULTIPLE_CHOICE
serializeAnswer(["option1", "option2"], 'MULTIPLE_CHOICE')
// Returns: '["option1","option2"]'

// NUMBER
serializeAnswer(42, 'NUMBER')
// Returns: "42"

// TEXT
serializeAnswer('Hello', 'TEXT')
// Returns: "Hello"
```

### `areAnswersEqual(a, b, questionType)`

Compares deserialized value with database string for equality.

**Parameters:**
- `a`: `string | number | string[] | null` - Deserialized value
- `b`: `string | null | undefined` - Database string
- `questionType`: `QuestionType` - Type of question

**Returns:** `boolean`

**Examples:**
```typescript
// MULTIPLE_CHOICE
areAnswersEqual(["option1"], '["option1"]', 'MULTIPLE_CHOICE')
// Returns: true

// NUMBER
areAnswersEqual(42, '42', 'NUMBER')
// Returns: true

// Different values
areAnswersEqual(["option1", "option2"], '["option1"]', 'MULTIPLE_CHOICE')
// Returns: false
```

## Usage Patterns

### Loading Answers from Database

```typescript
useEffect(() => {
  if (question && databaseAnswer) {
    const deserialized = deserializeAnswer(databaseAnswer, question.type);
    setState(deserialized);
  }
}, [question, databaseAnswer]);
```

### Saving Answers to Database

```typescript
const handleSave = () => {
  if (!question) return;

  const serialized = serializeAnswer(stateValue, question.type);
  saveMutation.mutate({ questionKey: question.key, answer: serialized });
};
```

### Detecting Changes

```typescript
const hasChanged = question
  ? !areAnswersEqual(stateValue, databaseAnswer, question.type)
  : false;
```

## Database Storage Format

| Question Type | Component Type | Database String | Example |
|--------------|----------------|-----------------|---------|
| TEXT | `string` | Plain string | `"João"` |
| NUMBER | `number` | String representation | `"42"` |
| SINGLE_CHOICE | `string` | Plain string | `"Option A"` |
| MULTIPLE_CHOICE | `string[]` | JSON array | `'["option1","option2"]'` |

## Migration Checklist

When adding new screens or components that work with question answers:

- [ ] Use `deserializeAnswer()` when loading from database
- [ ] Use `serializeAnswer()` when saving to database
- [ ] Use `areAnswersEqual()` for change detection
- [ ] Write tests for all three question types (TEXT, NUMBER, MULTIPLE_CHOICE)
- [ ] Verify answers display correctly
- [ ] Verify answers save correctly

## Examples in Codebase

### ProfileEditModal

See `/components/settings/ProfileEditModal.tsx` for a complete example:

```typescript
// Loading
useEffect(() => {
  if (visible && question) {
    const deserialized = deserializeAnswer(currentAnswer, question.type);
    setAnswer(deserialized);
  }
}, [visible, currentAnswer, question]);

// Change detection
const hasChanged = question
  ? !areAnswersEqual(answer, currentAnswer, question.type)
  : false;

// Saving
const handleSave = () => {
  if (!hasChanged || !question) return;
  const serialized = serializeAnswer(answer, question.type);
  onSave(serialized);
};
```

### QuestionFlowContainer

See `/components/question-flow/QuestionFlowContainer.tsx` for batch loading:

```typescript
// Load all answers with proper deserialization
const cache = existingAnswers.reduce((acc, answer) => {
  const question = allQuestions.find((q) => q.key === answer.questionKey);
  if (question) {
    acc[answer.questionKey] = deserializeAnswer(answer.answer, question.type);
  }
  return acc;
}, {} as Record<string, unknown>);
```

## Testing

Always test answer serialization with all question types:

```typescript
describe('MyComponent', () => {
  it('handles MULTIPLE_CHOICE answers correctly', () => {
    const jsonAnswer = '["option1","option2"]';

    render(<MyComponent question={multipleChoiceQuestion} answer={jsonAnswer} />);

    // Should display as array, not character array
    expect(displayValue).toBe('option1, option2');
  });

  it('saves MULTIPLE_CHOICE answers as JSON', async () => {
    const onSave = jest.fn();
    render(<MyComponent question={multipleChoiceQuestion} onSave={onSave} />);

    // User selects options...
    fireEvent.press(saveButton);

    // Should save as JSON string
    expect(onSave).toHaveBeenCalledWith('["option1","option2"]');
  });
});
```

## Common Mistakes

### ❌ Direct JSON.parse/JSON.stringify

```typescript
// ❌ BAD - Doesn't handle all types correctly
const value = JSON.parse(databaseAnswer);
await save(JSON.stringify(value));
```

### ❌ Type casting without parsing

```typescript
// ❌ BAD - TypeScript cast doesn't parse!
const value = databaseAnswer as string[];
// value is still a string at runtime!
```

### ❌ String comparison for arrays

```typescript
// ❌ BAD - Array never equals string
const hasChanged = value !== databaseAnswer;
// ["option1"] !== '["option1"]' is always true!
```

### ✅ Correct Usage

```typescript
// ✅ GOOD - Use utility functions
const value = deserializeAnswer(databaseAnswer, question.type);
await save(serializeAnswer(value, question.type));
const hasChanged = !areAnswersEqual(value, databaseAnswer, question.type);
```

## See Also

- Tests: `/lib/__tests__/answer-serialization.test.ts`
- ProfileEditModal: `/components/settings/ProfileEditModal.tsx`
- QuestionFlowContainer: `/components/question-flow/QuestionFlowContainer.tsx`
