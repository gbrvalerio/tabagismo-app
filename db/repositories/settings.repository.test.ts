import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

// Create mock db object
const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
};

// Mock the client module before importing the repository
jest.mock('../client', () => ({
  db: mockDb,
}));

// Now import the repository after mocking
import { useOnboardingStatus, useCompleteOnboarding } from './settings.repository';

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('settings.repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useOnboardingStatus', () => {
    it('should return true when onboarding is completed', async () => {
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ key: 'onboardingCompleted', value: 'true' }),
      };

      mockDb.select.mockReturnValue(mockChain);

      const { result } = renderHook(() => useOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      expect(result.current.data).toBe(true);
    });

    it('should return false when onboarding value is not "true"', async () => {
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ key: 'onboardingCompleted', value: 'false' }),
      };

      mockDb.select.mockReturnValue(mockChain);

      const { result } = renderHook(() => useOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      expect(result.current.data).toBe(false);
    });

    it('should return false when setting does not exist in database', async () => {
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.select.mockReturnValue(mockChain);

      const { result } = renderHook(() => useOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      expect(result.current.data).toBe(false);
    });

    it('should handle database query errors gracefully', async () => {
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      };

      mockDb.select.mockReturnValue(mockChain);

      const { result } = renderHook(() => useOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toBe('Database connection failed');
    });

    it('should execute correct database query chain', async () => {
      const mockChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ value: 'true' }),
      };

      mockDb.select.mockReturnValue(mockChain);

      const { result } = renderHook(() => useOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
      expect(mockChain.get).toHaveBeenCalled();
    });
  });

  describe('useCompleteOnboarding', () => {
    it('should provide mutate function', () => {
      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should provide mutateAsync function', () => {
      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutateAsync).toBeDefined();
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('should successfully execute insert mutation', async () => {
      const mockChain = {
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.insert.mockReturnValue(mockChain);

      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(result.current.isSuccess).toBe(true);
      expect(mockChain.values).toHaveBeenCalledWith({
        key: 'onboardingCompleted',
        value: 'true',
      });
      expect(mockChain.onConflictDoUpdate).toHaveBeenCalled();
    });

    it('should handle insert mutation errors', async () => {
      const mockChain = {
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: jest.fn().mockRejectedValue(new Error('Insert operation failed')),
      };

      mockDb.insert.mockReturnValue(mockChain);

      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync();
        } catch (error) {
          // Error expected
        }
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toBe('Insert operation failed');
    });

    it('should call onConflictDoUpdate with correct values', async () => {
      const mockChain = {
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.insert.mockReturnValue(mockChain);

      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync();
      });

      const onConflictCall = mockChain.onConflictDoUpdate.mock.calls[0][0];
      expect(onConflictCall.set).toEqual(
        expect.objectContaining({
          value: 'true',
        })
      );
      expect(onConflictCall.set.updatedAt).toBeInstanceOf(Date);
    });

    it('should have correct initial mutation states', () => {
      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should execute mutation with correct database call sequence', async () => {
      const mockChain = {
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
      };

      mockDb.insert.mockReturnValue(mockChain);

      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(mockDb.insert).toHaveBeenCalled();
      // Verify values was called before onConflictDoUpdate
      expect(mockChain.values.mock.invocationCallOrder[0]).toBeLessThan(
        mockChain.onConflictDoUpdate.mock.invocationCallOrder[0]
      );
    });
  });
});
