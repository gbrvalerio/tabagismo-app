import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import HomeScreen from './index';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/db', () => ({
  useOnboardingStatus: jest.fn(),
  useCompleteOnboarding: jest.fn(),
}));

import { useOnboardingStatus, useCompleteOnboarding } from '@/db';

const mockUseOnboardingStatus = useOnboardingStatus as jest.MockedFunction<typeof useOnboardingStatus>;
const mockUseCompleteOnboarding = useCompleteOnboarding as jest.MockedFunction<typeof useCompleteOnboarding>;

const renderHomeScreen = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <HomeScreen />
    </QueryClientProvider>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      const { toJSON } = renderHomeScreen();
      expect(toJSON()).not.toBeNull();
    });

    it('should display loading state when onboarding status is loading', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        status: 'pending',
      } as any);

      renderHomeScreen();
      expect(screen.getByText('Loading onboarding status...')).toBeTruthy();
    });
  });

  describe('Title Display', () => {
    it('should display the Database Test title', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      expect(screen.getByText('Database Test')).toBeTruthy();
    });
  });

  describe('Onboarding Status Display', () => {
    it('should display "Onboarding Status:" label', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      expect(screen.getByText('Onboarding Status:')).toBeTruthy();
    });

    it('should display "Completed ✅" when onboarding is completed', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: true,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      expect(screen.getByText('Completed ✅')).toBeTruthy();
    });

    it('should display "Not Completed ❌" when onboarding is not completed', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      expect(screen.getByText('Not Completed ❌')).toBeTruthy();
    });
  });

  describe('Complete Onboarding Button', () => {
    it('should display "Complete Onboarding" button when onboarding is not completed', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      expect(screen.getByRole('button', { name: /complete onboarding/i })).toBeTruthy();
    });

    it('should not display button when onboarding is already completed', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: true,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      const button = screen.queryByRole('button', { name: /complete onboarding/i });
      expect(button).toBeNull();
    });

    it('should call mutate when button is pressed', () => {
      const mutate = jest.fn();
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate,
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      const button = screen.getByRole('button', { name: /complete onboarding/i });
      fireEvent.press(button);
      expect(mutate).toHaveBeenCalled();
    });

    it('should handle button press when mutation is pending', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        isError: false,
        error: null,
        status: 'pending',
      } as any);

      renderHomeScreen();
      const button = screen.getByRole('button', { name: /complete onboarding/i });
      expect(button).toBeTruthy();
    });

    it('should enable button when mutation is not pending', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      const mutate = jest.fn();
      mockUseCompleteOnboarding.mockReturnValue({
        mutate,
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      const button = screen.getByRole('button', { name: /complete onboarding/i });
      fireEvent.press(button);
      expect(mutate).toHaveBeenCalled();
    });
  });

  describe('Saving Indicator', () => {
    it('should display "Saving..." text when mutation is pending', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: true,
        isError: false,
        error: null,
        status: 'pending',
      } as any);

      renderHomeScreen();
      expect(screen.getByText('Saving...')).toBeTruthy();
    });

    it('should not display "Saving..." text when mutation is not pending', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      const savingText = screen.queryByText('Saving...');
      expect(savingText).toBeNull();
    });
  });

  describe('Integration', () => {
    it('should display all elements correctly when onboarding is not completed', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      expect(screen.getByText('Database Test')).toBeTruthy();
      expect(screen.getByText('Onboarding Status:')).toBeTruthy();
      expect(screen.getByText('Not Completed ❌')).toBeTruthy();
      expect(screen.getByRole('button', { name: /complete onboarding/i })).toBeTruthy();
      expect(screen.queryByText('Saving...')).toBeNull();
    });

    it('should display all elements correctly when onboarding is completed', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: true,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      expect(screen.getByText('Database Test')).toBeTruthy();
      expect(screen.getByText('Onboarding Status:')).toBeTruthy();
      expect(screen.getByText('Completed ✅')).toBeTruthy();
      expect(screen.queryByRole('button', { name: /complete onboarding/i })).toBeNull();
      expect(screen.queryByText('Saving...')).toBeNull();
    });

    it('should display loading state correctly', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        status: 'pending',
      } as any);

      renderHomeScreen();
      expect(screen.getByText('Loading onboarding status...')).toBeTruthy();
      expect(screen.queryByText('Database Test')).toBeNull();
    });
  });

  describe('Hook Usage', () => {
    it('should call useOnboardingStatus hook', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      expect(mockUseOnboardingStatus).toHaveBeenCalled();
    });

    it('should call useCompleteOnboarding hook', () => {
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
        isLoading: false,
        error: null,
        isError: false,
        status: 'success',
      } as any);

      mockUseCompleteOnboarding.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      renderHomeScreen();
      expect(mockUseCompleteOnboarding).toHaveBeenCalled();
    });
  });
});
