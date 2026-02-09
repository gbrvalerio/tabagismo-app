import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useUserCoins } from './coin-transactions.repository';
import { db } from '../client';

jest.mock('../client', () => {
  const mockGet = jest.fn().mockResolvedValue({ total: 0 });
  const mockExecute = jest.fn().mockResolvedValue(undefined);
  const mockReturning = jest.fn().mockResolvedValue([{ id: 1 }]);
  const mockWhere = jest.fn(() => ({
    get: mockGet,
    execute: mockExecute,
    returning: mockReturning,
  }));
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
      update: jest.fn(() => ({ set: mockWhere })),
      delete: jest.fn(() => ({ where: mockWhere, execute: mockExecute })),
    },
  };
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useUserCoins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 0 when no transactions exist', async () => {
    const mockGet = jest.fn().mockResolvedValue({ total: 0 });
    const mockFrom = jest.fn(() => ({ get: mockGet }));
    (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });

  it('should return correct sum with single transaction', async () => {
    const mockGet = jest.fn().mockResolvedValue({ total: 5 });
    const mockFrom = jest.fn(() => ({ get: mockGet }));
    (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(5);
  });

  it('should return correct sum with multiple transactions', async () => {
    const mockGet = jest.fn().mockResolvedValue({ total: 6 });
    const mockFrom = jest.fn(() => ({ get: mockGet }));
    (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(6);
  });

  it('should handle negative amounts correctly', async () => {
    const mockGet = jest.fn().mockResolvedValue({ total: 7 });
    const mockFrom = jest.fn(() => ({ get: mockGet }));
    (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(7);
  });
});
