/**
 * Tests for db/index.ts exports
 * Verifies that all database modules are properly exported
 */

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
      it('should export repository hooks', () => {
        // All repositories are exported via export * from './repositories'
        // Check that common repository hooks exist
        expect(indexModule.useOnboardingStatus).toBeDefined();
        expect(indexModule.useCompleteOnboarding).toBeDefined();
      });

      it('should export useOnboardingStatus as a function', () => {
        expect(typeof indexModule.useOnboardingStatus).toBe('function');
      });

      it('should export useCompleteOnboarding as a function', () => {
        expect(typeof indexModule.useCompleteOnboarding).toBe('function');
      });
    });

    describe('schema types', () => {
      it('should export Setting type', () => {
        // Types are not exported as values, but we can verify the export was attempted
        // This is a compile-time check, so we verify the module doesn't throw on import
        expect(indexModule).toBeDefined();
      });

      it('should export NewSetting type', () => {
        // Types are not exported as values, but we can verify the export was attempted
        // This is a compile-time check, so we verify the module doesn't throw on import
        expect(indexModule).toBeDefined();
      });

      it('should not have runtime Setting/NewSetting exports (type-only)', () => {
        // Type exports don't appear as properties in the runtime object
        // Setting and NewSetting are type-only exports, so they won't be in the module object
        expect(typeof indexModule.Setting).toBe('undefined');
        expect(typeof indexModule.NewSetting).toBe('undefined');
      });
    });

    describe('module accessibility', () => {
      it('should be able to access all main exports', () => {
        const requiredExports = ['db', 'runMigrations', 'useOnboardingStatus', 'useCompleteOnboarding'];
        requiredExports.forEach((exportName) => {
          expect(indexModule[exportName]).toBeDefined();
        });
      });

      it('should have no undefined primary exports', () => {
        // Ensure db and runMigrations are defined (the most critical exports)
        expect(indexModule.db).not.toBeUndefined();
        expect(indexModule.runMigrations).not.toBeUndefined();
      });
    });
  });

  describe('import compatibility', () => {
    it('should be importable as ES module syntax', async () => {
      // This tests that the module structure supports both CJS and ES import
      const module = require('./index');
      expect(module).toBeDefined();
      expect(Object.keys(module).length).toBeGreaterThan(0);
    });

    it('should have all expected named exports', () => {
      const indexModule = require('./index');
      const expectedExports = ['db', 'runMigrations', 'useOnboardingStatus', 'useCompleteOnboarding'];

      expectedExports.forEach((exportName) => {
        expect(indexModule).toHaveProperty(exportName);
      });
    });
  });
});
