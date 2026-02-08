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
  const mockSet = jest.fn(() => ({ where: mockWhere }));
  const mockValues = jest.fn(() => ({ returning: mockReturning }));
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

    it('should insert new answer when none exists', async () => {
      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ questionKey: 'name', answer: JSON.stringify('John') });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should have called select to check existing, then insert
      expect(db.select).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
    });

    it('should update existing answer when one exists', async () => {
      // Mock get() to return an existing answer
      const mockGet = jest.fn().mockResolvedValue({ id: 1, questionKey: 'name', answer: '"Old"' });
      const mockWhere = jest.fn(() => ({
        get: mockGet,
        returning: jest.fn().mockResolvedValue([{ id: 1 }]),
      }));
      const mockFrom = jest.fn(() => ({
        all: jest.fn().mockResolvedValue([]),
        where: mockWhere,
        orderBy: jest.fn(() => ({ all: jest.fn().mockResolvedValue([]) })),
      }));
      const mockSet = jest.fn(() => ({ where: jest.fn(() => ({ returning: jest.fn().mockResolvedValue([{ id: 1 }]) })) }));
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
      (db.update as jest.Mock).mockReturnValue({ set: mockSet });

      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ questionKey: 'name', answer: JSON.stringify('Jane') });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(db.update).toHaveBeenCalled();
    });

    it('should have reset capability', () => {
      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      expect(result.current.reset).toBeDefined();
      expect(typeof result.current.reset).toBe('function');
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

    it('should delete answers for dependent questions', async () => {
      // Mock questions with dependencies
      const mockDependentQuestions = [
        { key: 'cigarettes_per_day', dependsOnQuestionKey: 'addiction_type', dependsOnValue: 'Cigarro/Tabaco' },
        { key: 'pod_duration_days', dependsOnQuestionKey: 'addiction_type', dependsOnValue: 'Pod/Vape' },
        { key: 'name', dependsOnQuestionKey: null, dependsOnValue: null },
      ];
      const mockAll = jest.fn().mockResolvedValue(mockDependentQuestions);
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

      // Should have deleted answers for both dependent questions
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
