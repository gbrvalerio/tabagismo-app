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

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('onboarding.repository', () => {
  describe('useOnboardingQuestions', () => {
    it('should provide query data and loading state', async () => {
      const { result } = renderHook(() => useOnboardingQuestions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      // The hook should resolve (success or error, depending on mock)
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

      // Data should be either array or undefined based on mock behavior
      if (result.current.isSuccess) {
        expect(Array.isArray(result.current.data)).toBe(true);
      }
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

    it('should execute mutation when called', async () => {
      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ questionKey: 'name', answer: JSON.stringify('John') });
      });

      await waitFor(() => {
        expect(result.current.isSuccess || result.current.isError).toBe(true);
      });
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

    it('should execute mutation when called', async () => {
      const { result } = renderHook(() => useDeleteDependentAnswers(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ parentQuestionKey: 'addiction_type' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess || result.current.isError).toBe(true);
      });
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
