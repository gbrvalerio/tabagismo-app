import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { renderHook, waitFor , act } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useUserCoins, useAwardCoins, useHasQuestionReward, useResetUserCoins, useHasNotificationReward } from './coin-transactions.repository';
import { db } from '../client';
import { coinTransactions, TransactionType } from '../schema/coin-transactions';

// Shared state for the mock database
const mockDbState = {
  transactions: [] as {
    id: number;
    amount: number;
    type: string;
    metadata: string | null;
  }[],
  nextId: 1,
  selectColumns: null as any,
  whereFilters: null as any, // Store where filters in a structured way
};

jest.mock('../client', () => {
  let pendingWhereConditions: any = null;
  let pendingInsertValues: any = null;

  const mockExecuteDelete = jest.fn().mockImplementation(() => {
    mockDbState.transactions = [];
    mockDbState.nextId = 1;
    pendingWhereConditions = null;
    return Promise.resolve(undefined);
  });

  const mockExecuteGeneric = jest.fn().mockResolvedValue(undefined);

  const mockGet = jest.fn().mockImplementation(() => {
    // If we selected aggregate columns (like { total: ... }), return total
    if (mockDbState.selectColumns?.total !== undefined) {
      const total = mockDbState.transactions.reduce((sum, t) => sum + t.amount, 0);
      mockDbState.selectColumns = null;
      return Promise.resolve({ total });
    }

    // If we have where conditions, filter transactions
    let filteredTransactions = [...mockDbState.transactions];
    if (pendingWhereConditions) {
      filteredTransactions = mockDbState.transactions.filter(tx => {
        const { type, questionKey, context } = pendingWhereConditions;

        if (type && tx.type !== type) {
          return false;
        }

        if (!tx.metadata) {
          if (questionKey !== undefined || context !== undefined) return false;
          return true;
        }

        try {
          const metadata = JSON.parse(tx.metadata);
          if (questionKey !== undefined && metadata.questionKey !== questionKey) {
            return false;
          }
          if (context !== undefined && metadata.context !== context) {
            return false;
          }
        } catch {
          return false;
        }

        return true;
      });

      pendingWhereConditions = null;
    }

    // Return the first matching transaction
    const result = filteredTransactions[0] || undefined;
    return Promise.resolve(result);
  });

  const mockAll = jest.fn().mockImplementation(() => {
    let filteredTransactions = [...mockDbState.transactions];
    if (pendingWhereConditions) {
      // Reset conditions after use
      pendingWhereConditions = null;
    }
    return Promise.resolve(filteredTransactions);
  });

  const mockReturning = jest.fn().mockImplementation(() => {
    if (pendingInsertValues) {
      const valuesToInsert = Array.isArray(pendingInsertValues)
        ? pendingInsertValues
        : [pendingInsertValues];

      const inserted = valuesToInsert.map(values => {
        const newTx = {
          id: mockDbState.nextId++,
          ...values,
        };
        mockDbState.transactions.push(newTx);
        return newTx;
      });

      pendingInsertValues = null;
      return Promise.resolve(inserted);
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

  // Recursively extract filter info from Drizzle condition tree
  const extractFilters = (node: any, filters: any) => {
    if (!node) return;

    // If this node has queryChunks, inspect them
    if (node.queryChunks && Array.isArray(node.queryChunks)) {
      const chunks = node.queryChunks;
      const serialized = JSON.stringify(chunks, (key, val) => {
        if (key === 'table' || key === 'encoder' || key === 'decoder') return undefined;
        return val;
      });

      // Check for eq() pattern: column = value
      // Look for type column with a string value
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk && typeof chunk === 'object' && chunk.name === 'type') {
          // Next meaningful chunk after ' = ' should be the value
          for (let j = i + 1; j < chunks.length; j++) {
            if (chunks[j] && typeof chunks[j] === 'object' && typeof chunks[j].value === 'string' && !chunks[j].name) {
              filters.type = chunks[j].value;
              return;
            }
          }
        }
      }

      // Check for json_extract pattern
      if (serialized.includes('$.context')) {
        // Find the param value (plain string in queryChunks)
        for (const chunk of chunks) {
          if (typeof chunk === 'string') {
            filters.context = chunk;
            return;
          }
        }
      }

      if (serialized.includes('$.questionKey')) {
        for (const chunk of chunks) {
          if (typeof chunk === 'string') {
            filters.questionKey = chunk;
            return;
          }
        }
      }

      // Recurse into sub-chunks
      for (const chunk of chunks) {
        if (chunk && typeof chunk === 'object') {
          extractFilters(chunk, filters);
        }
      }
    }
  };

  const mockWhere = jest.fn((conditions?: any) => {
    if (conditions) {
      const filters: any = {};
      extractFilters(conditions, filters);
      pendingWhereConditions = Object.keys(filters).length > 0 ? filters : null;
    } else {
      pendingWhereConditions = null;
    }

    return {
      get: mockGet,
      all: mockAll,
      execute: mockExecuteGeneric,
      returning: mockReturning,
    };
  });

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

let queryClient: ReturnType<typeof createTestQueryClient>;

const createWrapper = () => {
  queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

// Reset mock database state before each test
beforeEach(() => {
  mockDbState.transactions = [];
  mockDbState.nextId = 1;
  mockDbState.selectColumns = null;
  mockDbState.whereFilters = null;
});

// Clean up query client after each test to prevent open handles
afterEach(() => {
  if (queryClient) {
    queryClient.clear();
  }
});

describe('useUserCoins', () => {
  it('should return 0 when no transactions exist', async () => {
    // mockDbState is already empty from beforeEach
    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });

  it('should return correct sum with single transaction', async () => {
    // Add a transaction to mockDbState
    mockDbState.transactions.push({
      id: 1,
      amount: 5,
      type: 'onboarding_answer',
      metadata: null,
    });

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(5);
  });

  it('should return correct sum with multiple transactions', async () => {
    // Add multiple transactions
    mockDbState.transactions.push(
      { id: 1, amount: 2, type: 'onboarding_answer', metadata: null },
      { id: 2, amount: 4, type: 'bonus', metadata: null }
    );

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(6);
  });

  it('should handle negative amounts correctly', async () => {
    // Add transactions with negative amounts
    mockDbState.transactions.push(
      { id: 1, amount: 10, type: 'bonus', metadata: null },
      { id: 2, amount: -3, type: 'purchase', metadata: null }
    );

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(7);
  });
});

describe('useAwardCoins', () => {
  // State is already reset in the global beforeEach

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
  // State is already reset in the global beforeEach

  it('should return false when no transaction exists', async () => {
    const { result } = renderHook(() => useHasQuestionReward('onboarding', 'q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should return true when transaction exists for question', async () => {
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.QUESTION_ANSWER,
      metadata: JSON.stringify({ context: 'onboarding', questionKey: 'q1' }),
    }).returning();

    const { result } = renderHook(() => useHasQuestionReward('onboarding', 'q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it('should return false for different question key', async () => {
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.QUESTION_ANSWER,
      metadata: JSON.stringify({ context: 'onboarding', questionKey: 'q1' }),
    }).returning();

    const { result } = renderHook(() => useHasQuestionReward('onboarding', 'q2'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should ignore non-question-answer transactions', async () => {
    await db.insert(coinTransactions).values({
      amount: 5,
      type: TransactionType.BONUS,
      metadata: JSON.stringify({ context: 'onboarding', questionKey: 'q1' }),
    }).returning();

    const { result } = renderHook(() => useHasQuestionReward('onboarding', 'q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should handle multiple transactions for same question', async () => {
    await db.insert(coinTransactions).values([
      {
        amount: 1,
        type: TransactionType.QUESTION_ANSWER,
        metadata: JSON.stringify({ context: 'onboarding', questionKey: 'q1' }),
      },
      {
        amount: 1,
        type: TransactionType.QUESTION_ANSWER,
        metadata: JSON.stringify({ context: 'onboarding', questionKey: 'q1' }),
      },
    ]).returning();

    const { result } = renderHook(() => useHasQuestionReward('onboarding', 'q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });
});

describe('useResetUserCoins', () => {
  // State is already reset in the global beforeEach

  it('should delete all transactions and reset balance to 0', async () => {
    // Create some transactions
    await db.insert(coinTransactions).values([
      { amount: 1, type: 'onboarding_answer', metadata: '{"questionKey":"q1"}' },
      { amount: 2, type: 'onboarding_answer', metadata: '{"questionKey":"q2"}' },
      { amount: 3, type: 'bonus', metadata: null },
    ]).returning();

    const { result } = renderHook(
      () => ({
        coins: useUserCoins(),
        reset: useResetUserCoins(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.coins.isSuccess).toBe(true));
    expect(result.current.coins.data).toBe(6);

    await act(async () => {
      await result.current.reset.mutateAsync();
    });

    await waitFor(() => expect(result.current.coins.data).toBe(0));

    // Verify transactions were deleted
    const transactions = await db.select().from(coinTransactions).all();
    expect(transactions.length).toBe(0);
  });

  it('should handle empty transaction table', async () => {
    const { result } = renderHook(() => useResetUserCoins(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    const transactions = await db.select().from(coinTransactions).all();
    expect(transactions.length).toBe(0);
  });
});

describe('useHasQuestionReward - context support', () => {
  it('should check if question has been rewarded in specific context', async () => {
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.QUESTION_ANSWER,
      metadata: JSON.stringify({
        context: 'onboarding',
        questionKey: 'name',
      }),
    }).returning();

    const { result } = renderHook(
      () => useHasQuestionReward('onboarding', 'name'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it('should return false for question not rewarded in context', async () => {
    const { result } = renderHook(
      () => useHasQuestionReward('onboarding', 'age'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should distinguish between same question in different contexts', async () => {
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.QUESTION_ANSWER,
      metadata: JSON.stringify({
        context: 'onboarding',
        questionKey: 'mood',
      }),
    }).returning();

    const { result: onboardingResult } = renderHook(
      () => useHasQuestionReward('onboarding', 'mood'),
      { wrapper: createWrapper() }
    );

    const { result: checkinResult } = renderHook(
      () => useHasQuestionReward('daily_checkin', 'mood'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(onboardingResult.current.isSuccess).toBe(true));
    await waitFor(() => expect(checkinResult.current.isSuccess).toBe(true));

    expect(onboardingResult.current.data).toBe(true);
    expect(checkinResult.current.data).toBe(false);
  });
});

describe('useHasNotificationReward', () => {
  it('should return false when no notification permission transaction exists', async () => {
    const { result } = renderHook(() => useHasNotificationReward(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should return true when notification permission transaction exists', async () => {
    // Insert a notification permission transaction
    await db.insert(coinTransactions).values({
      amount: 15,
      type: TransactionType.NOTIFICATION_PERMISSION,
      metadata: JSON.stringify({ source: 'notification_permission' }),
    }).returning();

    const { result } = renderHook(() => useHasNotificationReward(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it('should use correct query key', async () => {
    const { result } = renderHook(() => useHasNotificationReward(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(['transactions', 'notification_permission'])).toBeDefined();
  });
});
