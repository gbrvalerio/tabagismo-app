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
const mockUseSlidesStatus = jest.fn();

jest.mock('@/db/repositories', () => ({
  useOnboardingStatus: () => mockUseOnboardingStatus(),
}));

jest.mock('@/db/repositories/onboarding-slides.repository', () => ({
  useSlidesStatus: () => mockUseSlidesStatus(),
}));

describe('OnboardingGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: slides completed, onboarding completed
    mockUseSlidesStatus.mockReturnValue({
      data: true,
      isLoading: false,
    });
    mockUseOnboardingStatus.mockReturnValue({
      data: true,
      isLoading: false,
    });
  });

  describe('slides routing priority', () => {
    it('should redirect to /onboarding-slides when slides not completed', async () => {
      mockUseSlidesStatus.mockReturnValue({
        data: false,
        isLoading: false,
      });
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
        expect(mockReplace).toHaveBeenCalledWith('/onboarding-slides');
      });
    });

    it('should prioritize slides over onboarding redirect', async () => {
      mockUseSlidesStatus.mockReturnValue({
        data: false,
        isLoading: false,
      });
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
        expect(mockReplace).toHaveBeenCalledWith('/onboarding-slides');
        expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
      });
    });

    it('should redirect to /onboarding when slides completed but onboarding not', async () => {
      mockUseSlidesStatus.mockReturnValue({
        data: true,
        isLoading: false,
      });
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

    it('should not redirect when both slides and onboarding completed', async () => {
      mockUseSlidesStatus.mockReturnValue({
        data: true,
        isLoading: false,
      });
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
  });

  describe('loading states', () => {
    it('should not navigate while slides status is loading', () => {
      mockUseSlidesStatus.mockReturnValue({
        data: undefined,
        isLoading: true,
      });
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

    it('should not navigate while onboarding status is loading', () => {
      mockUseSlidesStatus.mockReturnValue({
        data: true,
        isLoading: false,
      });
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

    it('should not render children while any status is loading', () => {
      mockUseSlidesStatus.mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      mockUseOnboardingStatus.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { queryByText } = render(
        <OnboardingGuard>
          <Text>Content</Text>
        </OnboardingGuard>
      );

      expect(queryByText('Content')).toBeNull();
    });
  });

  describe('children rendering', () => {
    it('should render children when all steps completed', () => {
      mockUseSlidesStatus.mockReturnValue({
        data: true,
        isLoading: false,
      });
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

    it('should render children while redirecting to prevent unmount loop', () => {
      mockUseSlidesStatus.mockReturnValue({
        data: false,
        isLoading: false,
      });
      mockUseOnboardingStatus.mockReturnValue({
        data: false,
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
});
