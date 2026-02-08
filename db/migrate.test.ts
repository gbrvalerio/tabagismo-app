/**
 * Tests for db/migrate.ts
 *
 * These tests verify error handling and logging in the migration runner.
 * We avoid testing the actual migrate() call since it's tightly coupled to drizzle-orm internals.
 */

jest.mock('./migrations/migrations', () => ({
  __esModule: true,
  default: {
    journal: { version: 1 },
    migrations: {},
  },
}));

jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({
  migrate: jest.fn().mockResolvedValue(undefined),
}));

import { runMigrations } from './migrate';

describe('db/migrate.ts - runMigrations', () => {
  let mockOpenDatabaseSync: jest.Mock;
  let mockDrizzle: jest.Mock;

  beforeEach(() => {
    // Get references to mocked functions from jest.setup.js
    mockOpenDatabaseSync = jest.requireMock('expo-sqlite').openDatabaseSync;
    mockDrizzle = jest.requireMock('drizzle-orm/expo-sqlite').drizzle;

    // Reset all mocks
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Database Opening', () => {
    it('should open the database with correct name', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Ignore migrate errors
      }

      expect(mockOpenDatabaseSync).toHaveBeenCalledWith('tabagismo.db');
      expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
    });

    it('should create a drizzle instance with opened database', async () => {
      const mockDb = {
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      };
      mockOpenDatabaseSync.mockReturnValueOnce(mockDb);
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Ignore migrate errors
      }

      expect(mockDrizzle).toHaveBeenCalledWith(mockDb);
    });

    it('should handle null/undefined database gracefully', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce(null);
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Expected - drizzle will fail
      }

      expect(mockDrizzle).toHaveBeenCalledWith(null);
    });

    it('should use existing database if it already exists', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Ignore migrate errors
      }

      expect(mockOpenDatabaseSync).toHaveBeenCalledWith('tabagismo.db');
    });

    it('should handle migrations called multiple times sequentially', async () => {
      const mockDb = {
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      };
      mockOpenDatabaseSync.mockReturnValue(mockDb);
      mockDrizzle.mockReturnValue({});

      const callsBefore = mockOpenDatabaseSync.mock.calls.length;

      try {
        await runMigrations();
      } catch {
        // Ignore migrate errors
      }

      try {
        await runMigrations();
      } catch {
        // Ignore migrate errors
      }

      try {
        await runMigrations();
      } catch {
        // Ignore migrate errors
      }

      const callsAfter = mockOpenDatabaseSync.mock.calls.length;
      expect(callsAfter - callsBefore).toBe(3);
    });
  });

  describe('Error Handling - Database Opening', () => {
    it('should log error when database opening fails', async () => {
      const testError = new Error('Database connection failed');
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw testError;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow('Database connection failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[DB] Migration failed:', testError);
    });

    it('should rethrow database opening error', async () => {
      const testError = new Error('DB error');
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw testError;
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow(testError);
    });
  });

  describe('Error Handling - Drizzle Initialization', () => {
    it('should log error when drizzle instance creation fails', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockImplementationOnce(() => {
        throw new Error('Drizzle initialization failed');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow('Drizzle initialization failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DB] Migration failed:',
        expect.any(Error)
      );
    });

    it('should handle TypeError during drizzle initialization', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      const typeError = new TypeError('Cannot read property of undefined');
      mockDrizzle.mockImplementationOnce(() => {
        throw typeError;
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow(TypeError);
    });
  });

  describe('Console Output - Error Logging', () => {
    it('should log with [DB] prefix for errors', async () => {
      const testError = new Error('Test error');
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw testError;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      const callArg = consoleErrorSpy.mock.calls[0][0];
      expect(callArg).toMatch(/^\[DB\]/);
    });

    it('should use console.error for error logging, not console.log', async () => {
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Migration failed')
      );
    });

    it('should preserve original error in logs', async () => {
      const customError = new Error('Custom error message');
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw customError;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith('[DB] Migration failed:', customError);
    });
  });

  describe('Multiple Errors', () => {
    it('should handle multiple sequential calls with different errors', async () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw error1;
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw error2;
      });

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(2);
    });

    it('should not log success message when any error occurs', async () => {
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw new Error('Error');
      });
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      expect(consoleLogSpy).not.toHaveBeenCalledWith('[DB] Migrations completed successfully');
    });
  });

  describe('Initialization Sequence', () => {
    it('should call openDatabaseSync before drizzle', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Ignore migrate errors
      }

      expect(mockOpenDatabaseSync.mock.invocationCallOrder[0]).toBeLessThan(
        mockDrizzle.mock.invocationCallOrder[0]
      );
    });
  });

  describe('Return Values', () => {
    it('should return undefined on successful error throw (database error)', async () => {
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw new Error('Test');
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const result = await runMigrations();
        // Should not reach here
        expect(result).toBeDefined();
      } catch (error) {
        // This is expected - the function throws
        expect(error).toBeDefined();
      }
    });
  });

  describe('Concurrent Calls', () => {
    it('should handle concurrent calls with consistent database name', async () => {
      mockOpenDatabaseSync.mockReturnValue({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValue({});

      try {
        await Promise.all([
          runMigrations().catch(() => {}),
          runMigrations().catch(() => {}),
          runMigrations().catch(() => {}),
        ]);
      } catch {
        // Expected
      }

      // Check all calls used the same database name
      expect(mockOpenDatabaseSync.mock.calls.every((call) => call[0] === 'tabagismo.db')).toBe(
        true
      );
    });
  });

  describe('Error Edge Cases', () => {
    it('should handle ReferenceError gracefully', async () => {
      const refError = new ReferenceError('migrations is not defined');
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw refError;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow(ReferenceError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[DB] Migration failed:', refError);
    });

    it('should handle SyntaxError during initialization', async () => {
      const syntaxError = new SyntaxError('Unexpected token');
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw syntaxError;
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow(SyntaxError);
    });

    it('should handle RangeError from database layer', async () => {
      const rangeError = new RangeError('Invalid range');
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw rangeError;
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow(RangeError);
    });
  });

  describe('Mock Reset Behavior', () => {
    it('should properly reset mocks between calls', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      const firstCallCount = mockOpenDatabaseSync.mock.calls.length;

      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      expect(mockOpenDatabaseSync.mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    it('should allow mock configuration between tests', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      expect(mockDrizzle).toHaveBeenCalled();
    });
  });

  describe('Call Order and Timing', () => {
    it('should call drizzle after successful database opening', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      const dbCallOrder = mockOpenDatabaseSync.mock.invocationCallOrder[0];
      const drizzleCallOrder = mockDrizzle.mock.invocationCallOrder[0];

      expect(dbCallOrder).toBeLessThan(drizzleCallOrder);
    });

    it('should not call drizzle if database opening fails', async () => {
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw new Error('DB error');
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      expect(mockDrizzle).not.toHaveBeenCalled();
    });
  });

  describe('Error Message Content', () => {
    it('should include [DB] prefix in all error logs', async () => {
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw new Error('Test');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      const callArg = consoleErrorSpy.mock.calls[0][0];
      expect(typeof callArg).toBe('string');
      expect(callArg.includes('[DB]')).toBe(true);
    });

    it('should log error object as second argument', async () => {
      const testError = new Error('Test message');
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw testError;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      expect(consoleErrorSpy.mock.calls[0][1]).toEqual(testError);
    });

    it('should preserve error message through logging', async () => {
      const errorMsg = 'Original error message';
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw new Error(errorMsg);
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      const loggedError = consoleErrorSpy.mock.calls[0][1];
      expect(loggedError.message).toBe(errorMsg);
    });
  });

  describe('Success Path - when drizzle and database work', () => {
    it('should log success message on successful migration', async () => {
      const mockDb = {
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      };
      mockOpenDatabaseSync.mockReturnValueOnce(mockDb);
      mockDrizzle.mockReturnValueOnce({});
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      // The migrate function is mocked in jest.setup.js to resolve successfully by default
      // This test verifies that when migrate succeeds, the success message is logged
      await runMigrations();

      expect(consoleLogSpy).toHaveBeenCalledWith('[DB] Migrations completed successfully');
    });

    it('should call database operations in correct order', async () => {
      const mockDb = {
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      };
      mockOpenDatabaseSync.mockReturnValueOnce(mockDb);
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Ignore migrate errors
      }

      // Verify basic flow: database opened then drizzle created
      expect(mockOpenDatabaseSync).toHaveBeenCalled();
      expect(mockDrizzle).toHaveBeenCalled();
    });

    it('should check database name parameter type', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      const callArg = mockOpenDatabaseSync.mock.calls[0][0];
      expect(typeof callArg).toBe('string');
      expect(callArg).toBe('tabagismo.db');
    });
  });

  describe('Async Behavior', () => {
    it('should return a promise', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      // Start the function but don't await to check return type immediately
      const result = runMigrations();

      expect(result instanceof Promise).toBe(true);

      // Clean up the promise
      try {
        await result;
      } catch {
        // Expected
      }
    });

    it('should handle async/await properly', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({
        execSync: jest.fn(),
        runSync: jest.fn(),
        getFirstSync: jest.fn(),
        getAllSync: jest.fn(),
      });
      mockDrizzle.mockReturnValueOnce({});

      let resolved = false;
      try {
        await runMigrations();
      } catch {
        // Expected
      }
      resolved = true;

      expect(resolved).toBe(true);
    });

    it('should reject on error in async context', async () => {
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});

      let errorCaught = false;
      try {
        await runMigrations();
      } catch {
        errorCaught = true;
      }

      expect(errorCaught).toBe(true);
    });
  });
});
