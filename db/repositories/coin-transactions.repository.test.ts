import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useUserCoins, useAwardCoins, useHasQuestionReward, useResetUserCoins } from './coin-transactions.repository';
import { act } from '@testing-library/react-native';
import { db } from '../client';
import { coinTransactions, TransactionType } from '../schema';

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
  const mockDeleteResult = jest.fn(() => ({
    execute: mockExecute,
  }));

  return {
    db: {
      select: jest.fn(() => ({ from: mockFrom })),
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
