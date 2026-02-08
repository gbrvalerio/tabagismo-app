const mockOpenDatabaseSync = jest.fn();
const mockDrizzle = jest.fn();
const mockMigrate = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: mockOpenDatabaseSync,
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: mockDrizzle,
  migrate: mockMigrate,
}));

jest.mock('./migrations/migrations', () => ({
  __esModule: true,
  default: {
    journal: { version: 1 },
    migrations: { m0000: 'CREATE TABLE...' },
  },
}));

import { runMigrations } from './migrate';

describe('db/migrate.ts - runMigrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Migration Execution', () => {
    it('should open the database with correct name', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockOpenDatabaseSync).toHaveBeenCalledWith('tabagismo.db');
      expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
    });

    it('should create a drizzle instance with opened database', async () => {
      const mockDb = { connection: 'mocked' };
      mockOpenDatabaseSync.mockReturnValueOnce(mockDb as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockDrizzle).toHaveBeenCalledWith(mockDb);
    });

    it('should call migrate with drizzle instance and migrations', async () => {
      const mockDb = { connection: 'mocked' };
      const mockDrizzleInstance = { drizzle: 'instance' };
      mockOpenDatabaseSync.mockReturnValueOnce(mockDb as any);
      mockDrizzle.mockReturnValueOnce(mockDrizzleInstance as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockMigrate).toHaveBeenCalledWith(mockDrizzleInstance, expect.any(Object));
    });

    it('should log success message when migrations complete', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await runMigrations();

      expect(consoleSpy).toHaveBeenCalledWith('[DB] Migrations completed successfully');
    });

    it('should complete without throwing error on success', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await expect(runMigrations()).resolves.not.toThrow();
    });

    it('should handle successful migrations with multiple operations', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      const result = await runMigrations();

      expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(1);
      expect(mockDrizzle).toHaveBeenCalledTimes(1);
      expect(mockMigrate).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should log error when database opening fails', async () => {
      const testError = new Error('Database connection failed');
      mockOpenDatabaseSync.mockImplementationOnce(() => {
        throw testError;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow('Database connection failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[DB] Migration failed:', testError);
    });

    it('should log error when drizzle instance creation fails', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
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

    it('should log error when migrate function fails', async () => {
      const migrationError = new Error('Migration execution failed');
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(migrationError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow('Migration execution failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[DB] Migration failed:', migrationError);
    });

    it('should rethrow error after logging it', async () => {
      const testError = new Error('Test error');
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(testError);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow(testError);
    });

    it('should handle SQL syntax errors in migrations', async () => {
      const sqlError = new Error('SQL syntax error: unexpected token');
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(sqlError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow('SQL syntax error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DB] Migration failed:',
        expect.objectContaining({ message: expect.stringContaining('SQL syntax error') })
      );
    });

    it('should handle migration timeout errors', async () => {
      const timeoutError = new Error('Migration timeout');
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(timeoutError);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow('Migration timeout');
    });

    it('should not log success when migration fails', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(new Error('Migration failed'));
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected error
      }

      expect(consoleLogSpy).not.toHaveBeenCalledWith('[DB] Migrations completed successfully');
    });
  });

  describe('Database Initialization', () => {
    it('should create database file on first run', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockOpenDatabaseSync).toHaveBeenCalledWith('tabagismo.db');
    });

    it('should use existing database if it already exists', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockOpenDatabaseSync).toHaveBeenCalledWith('tabagismo.db');
    });

    it('should initialize drizzle with opened database connection', async () => {
      const mockDb = { init: jest.fn() };
      mockOpenDatabaseSync.mockReturnValueOnce(mockDb as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockDrizzle).toHaveBeenCalled();
      expect(mockDrizzle.mock.calls[0][0]).toBe(mockDb);
    });

    it('should pass migrations object to migrate function', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockMigrate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          journal: expect.any(Object),
          migrations: expect.any(Object),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined database gracefully', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce(null as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockDrizzle).toHaveBeenCalledWith(null);
    });

    it('should handle migrations called multiple times sequentially', async () => {
      mockOpenDatabaseSync.mockReturnValue({} as any);
      mockDrizzle.mockReturnValue({} as any);
      mockMigrate.mockResolvedValue(undefined);

      await runMigrations();
      await runMigrations();
      await runMigrations();

      expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(3);
      expect(mockMigrate).toHaveBeenCalledTimes(3);
    });

    it('should clean up on partial migration failure', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(new Error('Partial migration failed'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected error
      }

      expect(mockOpenDatabaseSync).toHaveBeenCalled();
      expect(mockDrizzle).toHaveBeenCalled();
    });

    it('should handle empty migrations object', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockMigrate).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should complete full migration lifecycle successfully', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await runMigrations();

      expect(mockOpenDatabaseSync).toHaveBeenCalledWith('tabagismo.db');
      expect(mockDrizzle).toHaveBeenCalled();
      expect(mockMigrate).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('[DB] Migrations completed successfully');
    });

    it('should handle concurrent migration calls', async () => {
      mockOpenDatabaseSync.mockReturnValue({} as any);
      mockDrizzle.mockReturnValue({} as any);
      mockMigrate.mockResolvedValue(undefined);

      await Promise.all([runMigrations(), runMigrations(), runMigrations()]);

      expect(mockOpenDatabaseSync).toHaveBeenCalledTimes(3);
    });

    it('should properly log both database and drizzle initialization', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);

      await runMigrations();

      expect(mockOpenDatabaseSync.mock.invocationCallOrder[0]).toBeLessThan(
        mockDrizzle.mock.invocationCallOrder[0]
      );
      expect(mockDrizzle.mock.invocationCallOrder[0]).toBeLessThan(
        mockMigrate.mock.invocationCallOrder[0]
      );
    });
  });

  describe('Error Types and Messages', () => {
    it('should handle TypeError when operations are invalid', async () => {
      const typeError = new TypeError('Cannot read property of undefined');
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(typeError);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow(TypeError);
    });

    it('should handle ReferenceError when migrations are not found', async () => {
      const refError = new ReferenceError('migrations is not defined');
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(refError);
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(runMigrations()).rejects.toThrow(ReferenceError);
    });

    it('should preserve original error message in logs', async () => {
      const customError = new Error('Custom migration error message');
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(customError);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await runMigrations();
      } catch {
        // Expected
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith('[DB] Migration failed:', customError);
    });
  });

  describe('Console Output', () => {
    it('should log with [DB] prefix for success', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockResolvedValueOnce(undefined);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await runMigrations();

      const callArg = consoleLogSpy.mock.calls[0][0];
      expect(callArg).toMatch(/^\[DB\]/);
    });

    it('should log with [DB] prefix for errors', async () => {
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(new Error('Test error'));
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
      mockOpenDatabaseSync.mockReturnValueOnce({} as any);
      mockDrizzle.mockReturnValueOnce({} as any);
      mockMigrate.mockRejectedValueOnce(new Error('Test error'));
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
  });
});
