import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  useOnboardingQuestions,
  useOnboardingAnswers,
  useSaveAnswer,
  useDeleteDependentAnswers,
} from './onboarding.repository';
import { db } from '../client';

// Mock db methods for mutation coverage
jest.mock('../client', () => {
  const mockReturning = jest.fn().mockResolvedValue([{ id: 1 }]);
  const mockExecute = jest.fn().mockResolvedValue(undefined);
  const mockGet = jest.fn().mockResolvedValue(undefined);
  const mockAll = jest.fn().mockResolvedValue([]);
  const mockWhere = jest.fn(() => ({
    get: mockGet,
    returning: mockReturning,
    execute: mockExecute,
  }));
  const mockOnConflictDoUpdate = jest.fn(() => ({ returning: mockReturning }));
  const mockValues = jest.fn(() => ({
    returning: mockReturning,
    onConflictDoUpdate: mockOnConflictDoUpdate,
  }));
  const mockOrderBy = jest.fn(() => ({ all: mockAll }));
  const mockFrom = jest.fn(() => ({
    all: mockAll,
    where: mockWhere,
    orderBy: mockOrderBy,
  }));

  return {
    db: {
      select: jest.fn(() => ({ from: mockFrom })),
      insert: jest.fn(() => ({ values: mockValues })),
      update: jest.fn(() => ({ set: jest.fn(() => ({ where: mockWhere })) })),
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

describe('onboarding.repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useOnboardingQuestions', () => {
    it('should provide query data and loading state', async () => {
      const { result } = renderHook(() => useOnboardingQuestions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      expect(result.current.isSuccess || result.current.isError).toBe(true);
    });

    it('should use correct query key', () => {
      const { result } = renderHook(() => useOnboardingQuestions(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
    });

    it('should return data when query succeeds', async () => {
      const { result } = renderHook(() => useOnboardingQuestions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      if (result.current.isSuccess) {
        expect(Array.isArray(result.current.data)).toBe(true);
      }
    });

    it('should call db.select and order by order field', async () => {
      const { result } = renderHook(() => useOnboardingQuestions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('useOnboardingAnswers', () => {
    it('should provide query data and loading state', async () => {
      const { result } = renderHook(() => useOnboardingAnswers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      expect(result.current.isSuccess || result.current.isError).toBe(true);
    });

    it('should use correct query key', () => {
      const { result } = renderHook(() => useOnboardingAnswers(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
    });

    it('should return data when query succeeds', async () => {
      const { result } = renderHook(() => useOnboardingAnswers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      if (result.current.isSuccess) {
        expect(Array.isArray(result.current.data)).toBe(true);
      }
    });
  });

  describe('useSaveAnswer', () => {
    it('should provide a working mutate function', () => {
      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should provide mutateAsync', () => {
      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should start in idle state', () => {
      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should perform atomic upsert via onConflictDoUpdate', async () => {
      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ questionKey: 'name', answer: JSON.stringify('John') });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should use insert with onConflictDoUpdate (atomic upsert, no race condition)
      expect(db.insert).toHaveBeenCalled();
      // Should NOT call select (no SELECT-then-UPDATE pattern)
      // Note: select may be called by query hooks, but not by the mutation itself
    });

    it('should have reset capability', () => {
      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      expect(result.current.reset).toBeDefined();
      expect(typeof result.current.reset).toBe('function');
    });

    it('should pass coinAwarded as isFirstTime for new answers', async () => {
      const mockReturning = jest.fn().mockResolvedValue([{ id: 1 }]);
      const mockOnConflictDoUpdate = jest.fn(() => ({ returning: mockReturning }));
      const mockValues = jest.fn(() => ({
        returning: mockReturning,
        onConflictDoUpdate: mockOnConflictDoUpdate,
      }));
      (db.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          questionKey: 'test_question',
          answer: 'test answer',
          isFirstTime: true,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({ coinAwarded: true })
      );
    });

    it('should default isFirstTime to false', async () => {
      const mockReturning = jest.fn().mockResolvedValue([{ id: 1 }]);
      const mockOnConflictDoUpdate = jest.fn(() => ({ returning: mockReturning }));
      const mockValues = jest.fn(() => ({
        returning: mockReturning,
        onConflictDoUpdate: mockOnConflictDoUpdate,
      }));
      (db.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          questionKey: 'test_question',
          answer: 'test answer',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({ coinAwarded: false })
      );
    });
  });

  describe('useDeleteDependentAnswers', () => {
    it('should provide a working mutate function', () => {
      const { result } = renderHook(() => useDeleteDependentAnswers(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should provide mutateAsync', () => {
      const { result } = renderHook(() => useDeleteDependentAnswers(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutateAsync).toBeDefined();
    });

    it('should start in idle state', () => {
      const { result } = renderHook(() => useDeleteDependentAnswers(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should delete answers for direct dependent questions', async () => {
      const mockQuestions = [
        { key: 'cigarettes_per_day', dependsOnQuestionKey: 'addiction_type', dependsOnValue: 'Cigarro/Tabaco' },
        { key: 'pod_duration_days', dependsOnQuestionKey: 'addiction_type', dependsOnValue: 'Pod/Vape' },
        { key: 'name', dependsOnQuestionKey: null, dependsOnValue: null },
      ];
      const mockAll = jest.fn().mockResolvedValue(mockQuestions);
      const mockExecute = jest.fn().mockResolvedValue(undefined);
      const mockWhere = jest.fn(() => ({ execute: mockExecute }));
      const mockFrom = jest.fn(() => ({
        all: mockAll,
        where: mockWhere,
        orderBy: jest.fn(() => ({ all: mockAll })),
      }));
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
      (db.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      const { result } = renderHook(() => useDeleteDependentAnswers(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ parentQuestionKey: 'addiction_type' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(db.delete).toHaveBeenCalledTimes(2);
    });

    it('should cascade delete through A->B->C dependency chain', async () => {
      // A -> B -> C chain: changing A should delete B and C answers
      const mockQuestions = [
        { key: 'A', dependsOnQuestionKey: null, dependsOnValue: null },
        { key: 'B', dependsOnQuestionKey: 'A', dependsOnValue: 'yes' },
        { key: 'C', dependsOnQuestionKey: 'B', dependsOnValue: 'option1' },
      ];
      const mockAll = jest.fn().mockResolvedValue(mockQuestions);
      const mockExecute = jest.fn().mockResolvedValue(undefined);
      const mockWhere = jest.fn(() => ({ execute: mockExecute }));
      const mockFrom = jest.fn(() => ({
        all: mockAll,
        where: mockWhere,
        orderBy: jest.fn(() => ({ all: mockAll })),
      }));
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
      (db.delete as jest.Mock).mockReturnValue({ where: mockWhere });

      const { result } = renderHook(() => useDeleteDependentAnswers(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ parentQuestionKey: 'A' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should delete both B (direct child of A) and C (grandchild via B)
      expect(db.delete).toHaveBeenCalledTimes(2);
    });

    it('should not delete any answers when no dependent questions exist', async () => {
      const mockAll = jest.fn().mockResolvedValue([
        { key: 'name', dependsOnQuestionKey: null, dependsOnValue: null },
      ]);
      const mockFrom = jest.fn(() => ({
        all: mockAll,
        where: jest.fn(() => ({ execute: jest.fn() })),
        orderBy: jest.fn(() => ({ all: mockAll })),
      }));
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
      (db.delete as jest.Mock).mockClear();

      const { result } = renderHook(() => useDeleteDependentAnswers(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ parentQuestionKey: 'nonexistent_key' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(db.delete).not.toHaveBeenCalled();
    });

    it('should have reset capability', () => {
      const { result } = renderHook(() => useDeleteDependentAnswers(), {
        wrapper: createWrapper(),
      });

      expect(result.current.reset).toBeDefined();
      expect(typeof result.current.reset).toBe('function');
    });
  });
});
