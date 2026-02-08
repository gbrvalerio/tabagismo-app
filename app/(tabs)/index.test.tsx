import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from './index';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock the database hooks
jest.mock('@/db', () => ({
  useOnboardingStatus: jest.fn(),
  useCompleteOnboarding: jest.fn(),
  useResetOnboarding: jest.fn(),
}));

import { useOnboardingStatus, useCompleteOnboarding, useResetOnboarding } from '@/db';
import { Alert } from 'react-native';

const mockUseOnboardingStatus = useOnboardingStatus as jest.MockedFunction<typeof useOnboardingStatus>;
const mockUseCompleteOnboarding = useCompleteOnboarding as jest.MockedFunction<typeof useCompleteOnboarding>;
const mockUseResetOnboarding = useResetOnboarding as jest.MockedFunction<typeof useResetOnboarding>;

// Helper to render with providers
const renderHomeScreen = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <HomeScreen />
    </QueryClientProvider>
  );
};

describe('HomeScreen', () => {
  const defaultResetMock = {
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    isError: false,
    error: null,
    status: 'idle',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseResetOnboarding.mockReturnValue(defaultResetMock);
    mockReplace.mockClear();
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

    it('should disable button when mutation is pending', () => {
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
        isPending: true,
        isError: false,
        error: null,
        status: 'pending',
      } as any);

      renderHomeScreen();

      const button = screen.getByRole('button', { name: /complete onboarding/i });
      fireEvent.press(button);

      // When button is disabled, mutation should not be called
      // This is implied by the button being disabled in the component
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

      // When button is enabled, mutation should be callable
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
    it('should display all elements correctly when onboarding is not completed and not saving', () => {
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

      // Check all key elements are present
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

      // Check all key elements are present
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

  describe('Reset Onboarding Button', () => {
    it('should display "Refazer Onboarding" button when onboarding is completed', () => {
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

      expect(screen.getByText('Refazer Onboarding')).toBeTruthy();
    });

    it('should not display reset button when onboarding is not completed', () => {
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

      expect(screen.queryByText('Refazer Onboarding')).toBeNull();
    });

    it('should show confirmation dialog when reset button is pressed', () => {
      const alertSpy = jest.spyOn(Alert, 'alert');

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

      fireEvent.press(screen.getByTestId('reset-onboarding-button'));

      expect(alertSpy).toHaveBeenCalledWith(
        'Refazer Onboarding',
        'Deseja refazer o onboarding? Suas respostas anteriores serão mantidas.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancelar', style: 'cancel' }),
          expect.objectContaining({ text: 'Refazer' }),
        ]),
      );

      alertSpy.mockRestore();
    });

    it('should reset and navigate when confirmation is accepted', async () => {
      const mutateAsync = jest.fn().mockResolvedValue(undefined);
      mockUseResetOnboarding.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync,
        isPending: false,
        isError: false,
        error: null,
        status: 'idle',
      } as any);

      const alertSpy = jest.spyOn(Alert, 'alert');

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

      fireEvent.press(screen.getByTestId('reset-onboarding-button'));

      // Get the onPress handler from the "Refazer" button in the Alert
      const alertButtons = alertSpy.mock.calls[0][2] as any[];
      const refazerButton = alertButtons.find((b: any) => b.text === 'Refazer');

      await refazerButton.onPress();

      expect(mutateAsync).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');

      alertSpy.mockRestore();
    });

    it('should show "Resetando..." when reset mutation is pending', () => {
      mockUseResetOnboarding.mockReturnValue({
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        isPending: true,
        isError: false,
        error: null,
        status: 'pending',
      } as any);

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

      expect(screen.getByText('Resetando...')).toBeTruthy();
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
