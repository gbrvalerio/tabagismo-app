import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import { OnboardingGuard } from './OnboardingGuard';
import { Text } from 'react-native';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockUseOnboardingStatus = jest.fn();

jest.mock('@/db/repositories', () => ({
  useOnboardingStatus: () => mockUseOnboardingStatus(),
}));

describe('OnboardingGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to onboarding when not completed', async () => {
    mockUseOnboardingStatus.mockReturnValue({
      data: false,
      isLoading: false,
    });

    render(
      <OnboardingGuard>
        <Text>Content</Text>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('should not navigate when onboarding is completed', async () => {
    mockUseOnboardingStatus.mockReturnValue({
      data: true,
      isLoading: false,
    });

    render(
      <OnboardingGuard>
        <Text>Content</Text>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it('should not navigate while loading', () => {
    mockUseOnboardingStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <OnboardingGuard>
        <Text>Content</Text>
      </OnboardingGuard>
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should render children', () => {
    mockUseOnboardingStatus.mockReturnValue({
      data: true,
      isLoading: false,
    });

    const { getByText } = render(
      <OnboardingGuard>
        <Text>Content</Text>
      </OnboardingGuard>
    );

    expect(getByText('Content')).toBeDefined();
  });
});
