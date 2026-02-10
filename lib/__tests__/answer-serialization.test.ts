import {
  deserializeAnswer,
  serializeAnswer,
  areAnswersEqual,
} from '../answer-serialization';

describe('answer-serialization', () => {
  describe('deserializeAnswer', () => {
    describe('MULTIPLE_CHOICE', () => {
      it('parses valid JSON array', () => {
        const result = deserializeAnswer(
          '["option1","option2"]',
          'MULTIPLE_CHOICE'
        );
        expect(result).toEqual(['option1', 'option2']);
      });

      it('handles empty array', () => {
        const result = deserializeAnswer('[]', 'MULTIPLE_CHOICE');
        expect(result).toEqual([]);
      });

      it('returns null for invalid JSON', () => {
        const result = deserializeAnswer('not valid json', 'MULTIPLE_CHOICE');
        expect(result).toBeNull();
      });

      it('returns null for non-array JSON', () => {
        const result = deserializeAnswer('{"key": "value"}', 'MULTIPLE_CHOICE');
        expect(result).toBeNull();
      });

      it('handles null input', () => {
        const result = deserializeAnswer(null, 'MULTIPLE_CHOICE');
        expect(result).toBeNull();
      });

      it('handles undefined input', () => {
        const result = deserializeAnswer(undefined, 'MULTIPLE_CHOICE');
        expect(result).toBeNull();
      });
    });

    describe('NUMBER', () => {
      it('converts string to number', () => {
        const result = deserializeAnswer('42', 'NUMBER');
        expect(result).toBe(42);
      });

      it('handles negative numbers', () => {
        const result = deserializeAnswer('-10', 'NUMBER');
        expect(result).toBe(-10);
      });

      it('handles decimals', () => {
        const result = deserializeAnswer('3.14', 'NUMBER');
        expect(result).toBe(3.14);
      });

      it('returns null for invalid numbers', () => {
        const result = deserializeAnswer('not a number', 'NUMBER');
        expect(result).toBeNull();
      });

      it('handles null input', () => {
        const result = deserializeAnswer(null, 'NUMBER');
        expect(result).toBeNull();
      });
    });

    describe('TEXT', () => {
      it('returns string as-is', () => {
        const result = deserializeAnswer('Hello World', 'TEXT');
        expect(result).toBe('Hello World');
      });

      it('handles empty string', () => {
        const result = deserializeAnswer('', 'TEXT');
        expect(result).toBe('');
      });

      it('handles null input', () => {
        const result = deserializeAnswer(null, 'TEXT');
        expect(result).toBeNull();
      });
    });

    describe('SINGLE_CHOICE', () => {
      it('returns string as-is', () => {
        const result = deserializeAnswer('Option A', 'SINGLE_CHOICE');
        expect(result).toBe('Option A');
      });

      it('handles null input', () => {
        const result = deserializeAnswer(null, 'SINGLE_CHOICE');
        expect(result).toBeNull();
      });
    });
  });

  describe('serializeAnswer', () => {
    describe('MULTIPLE_CHOICE', () => {
      it('stringifies array to JSON', () => {
        const result = serializeAnswer(['option1', 'option2'], 'MULTIPLE_CHOICE');
        expect(result).toBe('["option1","option2"]');
      });

      it('handles empty array', () => {
        const result = serializeAnswer([], 'MULTIPLE_CHOICE');
        expect(result).toBe('[]');
      });

      it('returns empty array for null', () => {
        const result = serializeAnswer(null, 'MULTIPLE_CHOICE');
        expect(result).toBe('');
      });

      it('returns empty array for non-array value', () => {
        const result = serializeAnswer('not an array', 'MULTIPLE_CHOICE');
        expect(result).toBe('[]');
      });
    });

    describe('NUMBER', () => {
      it('converts number to string', () => {
        const result = serializeAnswer(42, 'NUMBER');
        expect(result).toBe('42');
      });

      it('handles negative numbers', () => {
        const result = serializeAnswer(-10, 'NUMBER');
        expect(result).toBe('-10');
      });

      it('handles decimals', () => {
        const result = serializeAnswer(3.14, 'NUMBER');
        expect(result).toBe('3.14');
      });

      it('returns empty string for null', () => {
        const result = serializeAnswer(null, 'NUMBER');
        expect(result).toBe('');
      });
    });

    describe('TEXT', () => {
      it('returns string as-is', () => {
        const result = serializeAnswer('Hello World', 'TEXT');
        expect(result).toBe('Hello World');
      });

      it('returns empty string for null', () => {
        const result = serializeAnswer(null, 'TEXT');
        expect(result).toBe('');
      });
    });

    describe('SINGLE_CHOICE', () => {
      it('returns string as-is', () => {
        const result = serializeAnswer('Option A', 'SINGLE_CHOICE');
        expect(result).toBe('Option A');
      });

      it('returns empty string for null', () => {
        const result = serializeAnswer(null, 'SINGLE_CHOICE');
        expect(result).toBe('');
      });
    });
  });

  describe('areAnswersEqual', () => {
    describe('MULTIPLE_CHOICE', () => {
      it('returns true for equal arrays', () => {
        const result = areAnswersEqual(
          ['option1', 'option2'],
          '["option1","option2"]',
          'MULTIPLE_CHOICE'
        );
        expect(result).toBe(true);
      });

      it('returns false for different arrays', () => {
        const result = areAnswersEqual(
          ['option1', 'option2'],
          '["option1"]',
          'MULTIPLE_CHOICE'
        );
        expect(result).toBe(false);
      });

      it('returns true for empty arrays', () => {
        const result = areAnswersEqual([], '[]', 'MULTIPLE_CHOICE');
        expect(result).toBe(true);
      });

      it('handles different order as not equal', () => {
        const result = areAnswersEqual(
          ['option2', 'option1'],
          '["option1","option2"]',
          'MULTIPLE_CHOICE'
        );
        expect(result).toBe(false);
      });
    });

    describe('NUMBER', () => {
      it('returns true for equal numbers', () => {
        const result = areAnswersEqual(42, '42', 'NUMBER');
        expect(result).toBe(true);
      });

      it('returns false for different numbers', () => {
        const result = areAnswersEqual(42, '43', 'NUMBER');
        expect(result).toBe(false);
      });

      it('compares number to string by serializing', () => {
        const result = areAnswersEqual('42', '42', 'NUMBER');
        expect(result).toBe(true);
      });
    });

    describe('TEXT', () => {
      it('returns true for equal strings', () => {
        const result = areAnswersEqual('Hello', 'Hello', 'TEXT');
        expect(result).toBe(true);
      });

      it('returns false for different strings', () => {
        const result = areAnswersEqual('Hello', 'World', 'TEXT');
        expect(result).toBe(false);
      });
    });

    describe('SINGLE_CHOICE', () => {
      it('returns true for equal choices', () => {
        const result = areAnswersEqual('Option A', 'Option A', 'SINGLE_CHOICE');
        expect(result).toBe(true);
      });

      it('returns false for different choices', () => {
        const result = areAnswersEqual('Option A', 'Option B', 'SINGLE_CHOICE');
        expect(result).toBe(false);
      });
    });
  });

  describe('round-trip serialization', () => {
    it('preserves MULTIPLE_CHOICE data', () => {
      const original = ['option1', 'option2', 'option3'];
      const serialized = serializeAnswer(original, 'MULTIPLE_CHOICE');
      const deserialized = deserializeAnswer(serialized, 'MULTIPLE_CHOICE');
      expect(deserialized).toEqual(original);
    });

    it('preserves NUMBER data', () => {
      const original = 42;
      const serialized = serializeAnswer(original, 'NUMBER');
      const deserialized = deserializeAnswer(serialized, 'NUMBER');
      expect(deserialized).toBe(original);
    });

    it('preserves TEXT data', () => {
      const original = 'Hello World';
      const serialized = serializeAnswer(original, 'TEXT');
      const deserialized = deserializeAnswer(serialized, 'TEXT');
      expect(deserialized).toBe(original);
    });
  });
});
