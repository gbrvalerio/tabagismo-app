/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import OnboardingSlidesScreen from './onboarding-slides';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as repository from '@/db/repositories/onboarding-slides.repository';

// Mock SVG imports used by SlideItem
jest.mock('@/assets/images/onboarding-1.svg', () => {
  const { View } = require('react-native');
  const MockIcon = (props: any) => <View {...props} testID={props.testID || 'onboarding-1-icon'} />;
  MockIcon.displayName = 'MockOnboarding1';
  return MockIcon;
});

jest.mock('@/assets/images/onboarding-2.svg', () => {
  const { View } = require('react-native');
  const MockIcon = (props: any) => <View {...props} testID={props.testID || 'onboarding-2-icon'} />;
  MockIcon.displayName = 'MockOnboarding2';
  return MockIcon;
});

jest.mock('@/assets/images/onboarding-3.svg', () => {
  const { View } = require('react-native');
  const MockIcon = (props: any) => <View {...props} testID={props.testID || 'onboarding-3-icon'} />;
  MockIcon.displayName = 'MockOnboarding3';
  return MockIcon;
});

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
   
  const { View } = require('react-native');
  return {
    __esModule: true,
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

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
  }),
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
  // eslint-disable-next-line react/display-name
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

  it('should render pagination dots', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
      { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getAllByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const dots = getAllByTestId('pagination-dot');
      expect(dots).toHaveLength(3);
    });
  });

  it('should highlight first dot by default', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getAllByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const dots = getAllByTestId('pagination-dot');
      expect(dots[0].props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#FF6B35' })
      );
      expect(dots[1].props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#D1D1D1' })
      );
    });
  });

  it('should update pagination on scroll', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId, getAllByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('slides-flatlist')).toBeTruthy();
    });

    // Simulate scroll to second slide
    const flatlist = getByTestId('slides-flatlist');
    fireEvent(flatlist, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 400 },
        layoutMeasurement: { width: 400 },
      },
    });

    await waitFor(() => {
      const dots = getAllByTestId('pagination-dot');
      expect(dots[1].props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#FF6B35' })
      );
    });
  });

  it('should have onMomentumScrollEnd handler on FlatList', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
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
      expect(flatlist.props.onMomentumScrollEnd).toBeDefined();
    });
  });

  it('should trigger haptic feedback on scroll', async () => {
     
    const Haptics = require('expo-haptics');

    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
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

    const flatlist = getByTestId('slides-flatlist');
    fireEvent(flatlist, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 400 },
        layoutMeasurement: { width: 400 },
      },
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('should NOT show skip button on slide 1', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { queryByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(queryByText('Pular')).toBeNull();
    });
  });

  it('should show skip button on slide 2', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
      { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    // Scroll to slide 2 (not last)
    const flatlist = getByTestId('slides-flatlist');
    fireEvent(flatlist, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 400 },
        layoutMeasurement: { width: 400 },
      },
    });

    const skipButton = await findByText('Pular');
    expect(skipButton).toBeTruthy();
  });

  it('should call markCompleted and navigate on skip', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    (repository.useMarkSlidesCompleted as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
      { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    // Scroll to slide 2
    const flatlist = getByTestId('slides-flatlist');
    fireEvent(flatlist, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 400 },
        layoutMeasurement: { width: 400 },
      },
    });

    const skipButton = await findByText('Pular');
    fireEvent.press(skipButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('should NOT show CTA button on slides 1-2', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
      { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { queryByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(queryByText('Vamos Lá!')).toBeNull();
    });
  });

  it('should show CTA button on last slide', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
      { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    // Scroll to slide 3 (last slide)
    const flatlist = getByTestId('slides-flatlist');
    fireEvent(flatlist, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 800 },
        layoutMeasurement: { width: 400 },
      },
    });

    const ctaButton = await findByText('Vamos Lá!');
    expect(ctaButton).toBeTruthy();
  });

  it('should NOT show CTA button on slide 2 of 3', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
      { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId, queryByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    // Scroll to slide 2 (not last)
    const flatlist = getByTestId('slides-flatlist');
    fireEvent(flatlist, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 400 },
        layoutMeasurement: { width: 400 },
      },
    });

    await waitFor(() => {
      expect(queryByText('Vamos Lá!')).toBeNull();
    });
  });

  it('should call markCompleted and navigate on CTA press', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    (repository.useMarkSlidesCompleted as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
      { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    // Scroll to last slide
    const flatlist = getByTestId('slides-flatlist');
    fireEvent(flatlist, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 800 },
        layoutMeasurement: { width: 400 },
      },
    });

    const ctaButton = await findByText('Vamos Lá!');
    fireEvent.press(ctaButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('should trigger medium haptic feedback on CTA press', async () => {
     
    const Haptics = require('expo-haptics');

    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    (repository.useMarkSlidesCompleted as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
      { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    // Scroll to last slide
    const flatlist = getByTestId('slides-flatlist');
    fireEvent(flatlist, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 800 },
        layoutMeasurement: { width: 400 },
      },
    });

    const ctaButton = await findByText('Vamos Lá!');
    fireEvent.press(ctaButton);

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('should handle undefined slides gracefully for pagination dots', () => {
    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: true,
    });

    const { queryByTestId, queryAllByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    // Should render without crashing when slides is undefined but not loading
    expect(queryByTestId('slides-flatlist')).toBeTruthy();
    // The ?? 0 fallback should result in zero pagination dots
    expect(queryAllByTestId('pagination-dot')).toHaveLength(0);
  });

  it('should hide skip button on last slide when CTA is shown', async () => {
    const mockSlides = [
      { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
      { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
      { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
    ];

    (repository.useOnboardingSlides as jest.Mock).mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    });

    const { getByTestId, queryByText, findByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    // Scroll to last slide
    const flatlist = getByTestId('slides-flatlist');
    fireEvent(flatlist, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 800 },
        layoutMeasurement: { width: 400 },
      },
    });

    // CTA should show, skip should hide
    await findByText('Vamos Lá!');
    expect(queryByText('Pular')).toBeNull();
  });
});
