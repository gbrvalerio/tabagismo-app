/**
 * Tests for db/index.ts exports
 * Verifies that all database modules are properly exported
 */

// Mock expo-sqlite before importing db modules
jest.mock('expo-sqlite', () => {
  const mockDb = {
    exec: jest.fn(),
    close: jest.fn(),
    serialize: jest.fn(),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
  };
});

// Mock drizzle-orm to return a db instance with query methods
jest.mock('drizzle-orm/expo-sqlite', () => {
  return {
    drizzle: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  };
});

describe('db/index.ts', () => {
  describe('exports', () => {
    let indexModule: Record<string, any>;

    beforeAll(() => {
      // Import the index module
      indexModule = require('./index');
    });

    describe('db client', () => {
      it('should export db client', () => {
        expect(indexModule.db).toBeDefined();
      });

      it('should export db as an object with drizzle methods', () => {
        expect(typeof indexModule.db).toBe('object');
        // Drizzle instance should have select, insert, update, delete methods
        expect(typeof indexModule.db.select).toBe('function');
        expect(typeof indexModule.db.insert).toBe('function');
        expect(typeof indexModule.db.update).toBe('function');
        expect(typeof indexModule.db.delete).toBe('function');
      });
    });

    describe('runMigrations function', () => {
      it('should export runMigrations function', () => {
        expect(indexModule.runMigrations).toBeDefined();
      });

      it('should export runMigrations as a function', () => {
        expect(typeof indexModule.runMigrations).toBe('function');
      });
    });

    describe('repositories', () => {
      it('should export settings repository hooks', () => {
        expect(indexModule.useOnboardingStatus).toBeDefined();
        expect(indexModule.useCompleteOnboarding).toBeDefined();
      });

      it('should export onboarding repository hooks', () => {
        expect(indexModule.useOnboardingQuestions).toBeDefined();
        expect(indexModule.useOnboardingAnswers).toBeDefined();
        expect(indexModule.useSaveAnswer).toBeDefined();
        expect(indexModule.useDeleteDependentAnswers).toBeDefined();
      });

      it('should export useOnboardingStatus as a function', () => {
        expect(typeof indexModule.useOnboardingStatus).toBe('function');
      });

      it('should export useCompleteOnboarding as a function', () => {
        expect(typeof indexModule.useCompleteOnboarding).toBe('function');
      });
    });

    describe('schema types and enums', () => {
      it('should export QuestionType enum', () => {
        expect(indexModule.QuestionType).toBeDefined();
        expect(indexModule.QuestionType.TEXT).toBe('TEXT');
        expect(indexModule.QuestionType.NUMBER).toBe('NUMBER');
        expect(indexModule.QuestionType.SINGLE_CHOICE).toBe('SINGLE_CHOICE');
        expect(indexModule.QuestionType.MULTIPLE_CHOICE).toBe('MULTIPLE_CHOICE');
      });

      it('should export QuestionCategory enum', () => {
        expect(indexModule.QuestionCategory).toBeDefined();
        expect(indexModule.QuestionCategory.PROFILE).toBe('PROFILE');
        expect(indexModule.QuestionCategory.ADDICTION).toBe('ADDICTION');
        expect(indexModule.QuestionCategory.HABITS).toBe('HABITS');
        expect(indexModule.QuestionCategory.MOTIVATION).toBe('MOTIVATION');
        expect(indexModule.QuestionCategory.GOALS).toBe('GOALS');
      });

      it('should not have runtime type-only exports', () => {
        // Type exports don't appear as properties in the runtime object
        expect(typeof indexModule.Setting).toBe('undefined');
        expect(typeof indexModule.NewSetting).toBe('undefined');
        expect(typeof indexModule.Question).toBe('undefined');
        expect(typeof indexModule.NewQuestion).toBe('undefined');
      });
    });

    describe('module accessibility', () => {
      it('should be able to access all main exports', () => {
        const requiredExports = [
          'db',
          'runMigrations',
          'useOnboardingStatus',
          'useCompleteOnboarding',
          'useOnboardingQuestions',
          'useOnboardingAnswers',
          'useSaveAnswer',
          'useDeleteDependentAnswers',
          'QuestionType',
          'QuestionCategory',
        ];
        requiredExports.forEach((exportName) => {
          expect(indexModule[exportName]).toBeDefined();
        });
      });

      it('should have no undefined primary exports', () => {
        expect(indexModule.db).not.toBeUndefined();
        expect(indexModule.runMigrations).not.toBeUndefined();
      });
    });
  });

  describe('import compatibility', () => {
    it('should be importable as ES module syntax', async () => {
      const module = require('./index');
      expect(module).toBeDefined();
      expect(Object.keys(module).length).toBeGreaterThan(0);
    });

    it('should have all expected named exports', () => {
      const indexModule = require('./index');
      const expectedExports = [
        'db',
        'runMigrations',
        'useOnboardingStatus',
        'useCompleteOnboarding',
        'useOnboardingQuestions',
        'useOnboardingAnswers',
        'useSaveAnswer',
        'useDeleteDependentAnswers',
        'QuestionType',
        'QuestionCategory',
      ];

      expectedExports.forEach((exportName) => {
        expect(indexModule).toHaveProperty(exportName);
      });
    });
  });
});
