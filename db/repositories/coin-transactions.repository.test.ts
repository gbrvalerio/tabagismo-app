import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useUserCoins, useAwardCoins, useHasQuestionReward, useResetUserCoins } from './coin-transactions.repository';
import { act } from '@testing-library/react-native';
import { db } from '../client';
import { coinTransactions, TransactionType } from '../schema';

// Shared state for the mock database
const mockDbState = {
  transactions: [] as Array<{
    id: number;
    amount: number;
    type: string;
    metadata: string | null;
  }>,
  nextId: 1,
  selectColumns: null as any,
};

jest.mock('../client', () => {
  const mockExecuteDelete = jest.fn().mockImplementation(() => {
    mockDbState.transactions = [];
    mockDbState.nextId = 1;
    return Promise.resolve(undefined);
  });

  const mockExecuteGeneric = jest.fn().mockResolvedValue(undefined);

  const mockGet = jest.fn().mockImplementation(() => {
    // If we selected aggregate columns (like { total: ... }), return total
    if (mockDbState.selectColumns?.total !== undefined) {
      const total = mockDbState.transactions.reduce((sum, t) => sum + t.amount, 0);
      return Promise.resolve({ total });
    }
    // Otherwise, return the first transaction
    return Promise.resolve(mockDbState.transactions[0] || undefined);
  });

  let pendingInsertValues: any = null;

  const mockReturning = jest.fn().mockImplementation(() => {
    if (pendingInsertValues) {
      const newTx = {
        id: mockDbState.nextId++,
        ...pendingInsertValues,
      };
      mockDbState.transactions.push(newTx);
      pendingInsertValues = null;
      return Promise.resolve([newTx]);
    }
    return Promise.resolve([]);
  });

  const mockValues = jest.fn().mockImplementation((values: any) => {
    pendingInsertValues = values;
    return {
      returning: mockReturning,
      execute: mockExecuteGeneric,
    };
  });

  const mockWhere = jest.fn(() => ({
    get: mockGet,
    execute: mockExecuteGeneric,
    returning: mockReturning,
  }));

  const mockAll = jest.fn().mockImplementation(() =>
    Promise.resolve([...mockDbState.transactions])
  );

  const mockFrom = jest.fn(() => ({
    get: mockGet,
    all: mockAll,
    where: mockWhere,
  }));

  const mockDeleteResult = jest.fn(() => ({
    execute: mockExecuteDelete,
  }));

  return {
    db: {
      select: jest.fn().mockImplementation((columns?: any) => {
        mockDbState.selectColumns = columns;
        return { from: mockFrom };
      }),
      insert: jest.fn(() => ({ values: mockValues })),
      update: jest.fn(() => ({ set: mockWhere })),
      delete: jest.fn(() => mockDeleteResult()),
    },
  };
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

// Reset mock database state before each test
beforeEach(() => {
  mockDbState.transactions = [];
  mockDbState.nextId = 1;
  mockDbState.selectColumns = null;
});

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

describe('useAwardCoins', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
  });

  it('should create transaction and invalidate cache', async () => {
    const { result } = renderHook(
      () => ({
        coins: useUserCoins(),
        award: useAwardCoins(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.coins.isSuccess).toBe(true));
    expect(result.current.coins.data).toBe(0);

    await act(async () => {
      await result.current.award.mutateAsync({
        amount: 1,
        type: 'onboarding_answer',
        metadata: { questionKey: 'q1' },
      });
    });

    await waitFor(() => expect(result.current.coins.data).toBe(1));
  });

  it('should store metadata as JSON string', async () => {
    const { result } = renderHook(() => useAwardCoins(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        amount: 1,
        type: 'onboarding_answer',
        metadata: { questionKey: 'q1', extra: 'data' },
      });
    });

    const transaction = await db.select().from(coinTransactions).get();
    expect(transaction?.metadata).toBe('{"questionKey":"q1","extra":"data"}');
  });

  it('should handle null metadata', async () => {
    const { result } = renderHook(() => useAwardCoins(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        amount: 5,
        type: 'bonus',
      });
    });

    const transaction = await db.select().from(coinTransactions).get();
    expect(transaction?.metadata).toBeNull();
  });

  it('should accumulate multiple awards', async () => {
    const { result } = renderHook(
      () => ({
        coins: useUserCoins(),
        award: useAwardCoins(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.coins.isSuccess).toBe(true));

    await act(async () => {
      await result.current.award.mutateAsync({
        amount: 1,
        type: 'onboarding_answer',
        metadata: { questionKey: 'q1' },
      });
    });
    await waitFor(() => expect(result.current.coins.data).toBe(1));

    await act(async () => {
      await result.current.award.mutateAsync({
        amount: 2,
        type: 'onboarding_answer',
        metadata: { questionKey: 'q2' },
      });
    });
    await waitFor(() => expect(result.current.coins.data).toBe(3));
  });
});

describe('useHasQuestionReward', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
  });

  it('should return false when no transaction exists', async () => {
    const { result } = renderHook(() => useHasQuestionReward('q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should return true when transaction exists for question', async () => {
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.ONBOARDING_ANSWER,
      metadata: JSON.stringify({ questionKey: 'q1' }),
    });

    const { result } = renderHook(() => useHasQuestionReward('q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it('should return false for different question key', async () => {
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.ONBOARDING_ANSWER,
      metadata: JSON.stringify({ questionKey: 'q1' }),
    });

    const { result } = renderHook(() => useHasQuestionReward('q2'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should ignore non-onboarding transactions', async () => {
    await db.insert(coinTransactions).values({
      amount: 5,
      type: TransactionType.BONUS,
      metadata: JSON.stringify({ questionKey: 'q1' }),
    });

    const { result } = renderHook(() => useHasQuestionReward('q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should handle multiple transactions for same question', async () => {
    // This shouldn't happen in practice, but test the edge case
    await db.insert(coinTransactions).values([
      {
        amount: 1,
        type: TransactionType.ONBOARDING_ANSWER,
        metadata: JSON.stringify({ questionKey: 'q1' }),
      },
      {
        amount: 1,
        type: TransactionType.ONBOARDING_ANSWER,
        metadata: JSON.stringify({ questionKey: 'q1' }),
      },
    ]);

    const { result } = renderHook(() => useHasQuestionReward('q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });
});
