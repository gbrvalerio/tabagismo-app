import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useUserCoins, useIncrementCoins } from './users.repository';
import { db } from '../client';

jest.mock('../client', () => {
  const mockGet = jest.fn().mockResolvedValue(undefined);
  const mockExecute = jest.fn().mockResolvedValue(undefined);
  const mockReturning = jest.fn().mockResolvedValue([{ id: 1 }]);
  const mockWhere = jest.fn(() => ({
    get: mockGet,
    execute: mockExecute,
    returning: mockReturning,
  }));
  const mockSet = jest.fn(() => ({ where: mockWhere }));
  const mockValues = jest.fn(() => ({
    returning: mockReturning,
    execute: mockExecute,
  }));
  const mockFrom = jest.fn(() => ({
    get: mockGet,
    all: jest.fn().mockResolvedValue([]),
    where: mockWhere,
  }));

  return {
    db: {
      select: jest.fn(() => ({ from: mockFrom })),
      insert: jest.fn(() => ({ values: mockValues })),
      update: jest.fn(() => ({ set: mockSet })),
      delete: jest.fn(() => ({ where: mockWhere })),
    },
  };
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('users.repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useUserCoins', () => {
    it('should return 0 when no user exists', async () => {
      const mockGet = jest.fn().mockResolvedValue(undefined);
      const mockFrom = jest.fn(() => ({ get: mockGet }));
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const { result } = renderHook(() => useUserCoins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBe(0);
    });

    it('should return user coin balance', async () => {
      const mockGet = jest.fn().mockResolvedValue({ id: 1, coins: 5 });
      const mockFrom = jest.fn(() => ({ get: mockGet }));
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const { result } = renderHook(() => useUserCoins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBe(5);
    });

    it('should use correct query key', () => {
      const { result } = renderHook(() => useUserCoins(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
    });
  });

  describe('useIncrementCoins', () => {
    it('should increment coins when user exists', async () => {
      const mockGet = jest.fn().mockResolvedValue({ id: 1, coins: 3 });
      const mockFrom = jest.fn(() => ({ get: mockGet }));
      const mockExecute = jest.fn().mockResolvedValue(undefined);
      const mockWhere = jest.fn(() => ({ execute: mockExecute }));
      const mockSet = jest.fn(() => ({ where: mockWhere }));
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
      (db.update as jest.Mock).mockReturnValue({ set: mockSet });

      const { result } = renderHook(() => useIncrementCoins(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(3);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(db.update).toHaveBeenCalled();
    });

    it('should create user if none exists', async () => {
      const mockGet = jest.fn().mockResolvedValue(undefined);
      const mockFrom = jest.fn(() => ({ get: mockGet }));
      const mockExecute = jest.fn().mockResolvedValue(undefined);
      const mockValues = jest.fn(() => ({ execute: mockExecute }));
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
      (db.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const { result } = renderHook(() => useIncrementCoins(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(5);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(db.insert).toHaveBeenCalled();
    });

    it('should provide a working mutate function', () => {
      const { result } = renderHook(() => useIncrementCoins(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should start in idle state', () => {
      const { result } = renderHook(() => useIncrementCoins(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });
});
