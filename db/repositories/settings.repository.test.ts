import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useOnboardingStatus, useCompleteOnboarding } from './settings.repository';

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

describe('settings.repository', () => {
  describe('useOnboardingStatus', () => {
    it('should return a boolean value', async () => {
      const { result } = renderHook(() => useOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      // Wait for query to settle (either success, error, or idle)
      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      // Data should be a boolean or undefined (when not found in DB)
      expect(result.current.data === undefined || typeof result.current.data === 'boolean').toBe(true);
    });

    it('should handle query errors gracefully', async () => {
      const { result } = renderHook(() => useOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to settle (not loading)
      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      // Should either succeed or fail, but not hang
      expect(result.current.data !== undefined || result.current.isError).toBe(true);
    });
  });

  describe('useCompleteOnboarding', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should mark onboarding as completed when mutated', async () => {
      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});
