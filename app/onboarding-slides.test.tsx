import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import OnboardingSlidesScreen from './onboarding-slides';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as repository from '@/db/repositories/onboarding-slides.repository';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  impactAsync: jest.fn(),
}));

jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    default: {
      View,
    },
    FadeInDown: {
      springify: () => ({
        damping: () => ({
          stiffness: () => ({}),
        }),
      }),
    },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/db/repositories/onboarding-slides.repository', () => ({
  useOnboardingSlides: jest.fn(),
  useMarkSlidesCompleted: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
  useSlidesStatus: jest.fn(() => ({
    data: false,
    isSuccess: true,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OnboardingSlidesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });

    const { getByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should render slides when loaded', async () => {
    const mockSlides = [
      {
        id: 1,
        order: 1,
        icon: '@/assets/images/onboarding-1.svg',
        title: 'Slide 1',
        description: 'Description 1',
        metadata: null,
        createdAt: new Date(),
      },
      {
        id: 2,
        order: 2,
        icon: '@/assets/images/onboarding-2.svg',
        title: 'Slide 2',
        description: 'Description 2',
        metadata: null,
        createdAt: new Date(),
      },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Slide 1')).toBeTruthy();
    });
  });

  it('should not render loading indicator when data is loaded', () => {
    const mockSlides = [
      {
        id: 1,
        order: 1,
        icon: '@/assets/images/onboarding-1.svg',
        title: 'Slide 1',
        description: 'Description 1',
        metadata: null,
        createdAt: new Date(),
      },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { queryByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    expect(queryByTestId('loading-indicator')).toBeNull();
  });

  it('should render SafeAreaView in loading state', () => {
    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });

    const { getByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should render FlatList with slides', async () => {
    const mockSlides = [
      {
        id: 1,
        order: 1,
        icon: '@/assets/images/onboarding-1.svg',
        title: 'Slide 1',
        description: 'Description 1',
        metadata: null,
        createdAt: new Date(),
      },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('slides-flatlist')).toBeTruthy();
    });
  });

  it('should render slide items with title and description', async () => {
    const mockSlides = [
      {
        id: 1,
        order: 1,
        icon: '@/assets/images/onboarding-1.svg',
        title: 'Test Slide',
        description: 'Test Description',
        metadata: null,
        createdAt: new Date(),
      },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Test Slide')).toBeTruthy();
      expect(getByText('Test Description')).toBeTruthy();
    });
  });

  it('should render benefits when metadata has showBenefits', async () => {
    const mockSlides = [
      {
        id: 1,
        order: 1,
        icon: '@/assets/images/onboarding-2.svg',
        title: 'Slide with Benefits',
        description: 'Description',
        metadata: JSON.stringify({
          showBenefits: true,
          benefits: ['Benefit A', 'Benefit B'],
        }),
        createdAt: new Date(),
      },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Benefit A')).toBeTruthy();
      expect(getByText('Benefit B')).toBeTruthy();
    });
  });

  it('should handle invalid metadata gracefully', async () => {
    const mockSlides = [
      {
        id: 1,
        order: 1,
        icon: '@/assets/images/onboarding-1.svg',
        title: 'Slide Invalid Meta',
        description: 'Description',
        metadata: 'not-valid-json{{{',
        createdAt: new Date(),
      },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Slide Invalid Meta')).toBeTruthy();
    });
  });

  it('should configure FlatList for horizontal paging', async () => {
    const mockSlides = [
      {
        id: 1,
        order: 1,
        icon: '@/assets/images/onboarding-1.svg',
        title: 'S1',
        description: 'D1',
        metadata: null,
        createdAt: new Date(),
      },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const flatlist = getByTestId('slides-flatlist');
      expect(flatlist.props.horizontal).toBe(true);
      expect(flatlist.props.pagingEnabled).toBe(true);
      expect(flatlist.props.showsHorizontalScrollIndicator).toBe(false);
    });
  });
});
