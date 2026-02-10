/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import OnboardingSlidesScreen from './onboarding-slides';
import { OnboardingGuard } from '@/components/question-flow/OnboardingGuard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Text } from 'react-native';
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

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

const mockUseOnboardingSlides = jest.fn();
const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
const mockUseMarkSlidesCompleted = jest.fn(() => ({
  mutateAsync: mockMutateAsync,
  isPending: false,
}));
const mockUseSlidesStatus = jest.fn();

jest.mock('@/db/repositories/onboarding-slides.repository', () => ({
  useOnboardingSlides: (...args: unknown[]) => mockUseOnboardingSlides(...args),
  useMarkSlidesCompleted: () => mockUseMarkSlidesCompleted(),
  useSlidesStatus: (...args: unknown[]) => mockUseSlidesStatus(...args),
}));

const mockUseOnboardingStatus = jest.fn();
jest.mock('@/db/repositories', () => ({
  useOnboardingStatus: () => mockUseOnboardingStatus(),
}));

const MOCK_SLIDES = [
  {
    id: 1,
    order: 1,
    icon: '@/assets/images/onboarding-1.svg',
    title: 'Parar de fumar é difícil sozinho',
    description: 'Você não está sozinho. Milhares de pessoas enfrentam essa mesma batalha todos os dias.',
    metadata: null,
    createdAt: new Date(),
  },
  {
    id: 2,
    order: 2,
    icon: '@/assets/images/onboarding-2.svg',
    title: 'Nós ajudamos você nessa jornada',
    description: 'Com ferramentas práticas e suporte personalizado:',
    metadata: JSON.stringify({
      showBenefits: true,
      benefits: [
        'Acompanhe seu progresso em tempo real',
        'Ganhe moedas e conquiste metas',
        'Receba lembretes motivacionais',
      ],
    }),
    createdAt: new Date(),
  },
  {
    id: 3,
    order: 3,
    icon: '@/assets/images/onboarding-3.svg',
    title: 'Vamos começar juntos',
    description: 'Responda algumas perguntas rápidas e inicie sua jornada livre do cigarro.',
    metadata: null,
    createdAt: new Date(),
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('Onboarding Slides Integration - Full User Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
    mockUseOnboardingSlides.mockReturnValue({
      data: MOCK_SLIDES,
      isLoading: false,
      isSuccess: true,
    });
    mockUseMarkSlidesCompleted.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    mockUseSlidesStatus.mockReturnValue({
      data: false,
      isLoading: false,
    });
    mockUseOnboardingStatus.mockReturnValue({
      data: false,
      isLoading: false,
    });
  });

  describe('OnboardingGuard routing behavior', () => {
    it('should redirect new user to /onboarding-slides first', async () => {
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
          <Text>App Content</Text>
        </OnboardingGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/onboarding-slides');
      });
      expect(mockReplace).not.toHaveBeenCalledWith('/onboarding');
    });

    it('should redirect to /onboarding after slides completed', async () => {
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
          <Text>App Content</Text>
        </OnboardingGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/onboarding');
      });
      expect(mockReplace).not.toHaveBeenCalledWith('/onboarding-slides');
    });

    it('should render app content when all onboarding complete', async () => {
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
          <Text>App Content</Text>
        </OnboardingGuard>
      );

      await waitFor(() => {
        expect(getByText('App Content')).toBeDefined();
      });
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should not navigate while status is loading', () => {
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
          <Text>App Content</Text>
        </OnboardingGuard>
      );

      expect(mockReplace).not.toHaveBeenCalled();
      expect(queryByText('App Content')).toBeNull();
    });
  });

  describe('complete CTA flow: slide 1 → slide 2 → slide 3 → CTA', () => {
    it('should display slide 1 with correct Portuguese content', async () => {
      const { getByText, queryByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByText('Parar de fumar é difícil sozinho')).toBeTruthy();
      });
      expect(getByText('Você não está sozinho. Milhares de pessoas enfrentam essa mesma batalha todos os dias.')).toBeTruthy();
      expect(queryByText('Pular')).toBeNull();
      expect(queryByText('Vamos Lá!')).toBeNull();
    });

    it('should show skip button on slide 2 after swipe', async () => {
      const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      // Swipe to slide 2
      const flatlist = getByTestId('slides-flatlist');
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 400 },
          layoutMeasurement: { width: 400 },
        },
      });

      // Skip button appears
      const skipButton = await findByText('Pular');
      expect(skipButton).toBeTruthy();
    });

    it('should render benefits when slide 2 metadata has showBenefits', async () => {
      // Render with only slide 2 to verify benefits rendering from metadata
      const slide2Only = [MOCK_SLIDES[1]];
      mockUseOnboardingSlides.mockReturnValue({
        data: slide2Only,
        isLoading: false,
        isSuccess: true,
      });

      const { getByText, getByTestId } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(getByText('Acompanhe seu progresso em tempo real')).toBeTruthy();
        expect(getByText('Ganhe moedas e conquiste metas')).toBeTruthy();
        expect(getByText('Receba lembretes motivacionais')).toBeTruthy();
        expect(getByTestId('benefits-card')).toBeTruthy();
      });
    });

    it('should show CTA and hide skip on last slide', async () => {
      const { getByTestId, findByText, queryByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      // Swipe to slide 3 (last)
      const flatlist = getByTestId('slides-flatlist');
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 800 },
          layoutMeasurement: { width: 400 },
        },
      });

      // CTA appears, skip hidden
      const ctaButton = await findByText('Vamos Lá!');
      expect(ctaButton).toBeTruthy();
      expect(queryByText('Pular')).toBeNull();
    });

    it('should mark completed and navigate to onboarding on CTA press', async () => {
      const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      // Swipe to last slide
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
        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith('/onboarding');
      });
    });
  });

  describe('skip flow: slide 1 → slide 2 → skip', () => {
    it('should mark completed and navigate to onboarding on skip press', async () => {
      const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      // Swipe to slide 2
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
        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith('/onboarding');
      });
    });

    it('should trigger light haptic on skip', async () => {
      const Haptics = require('expo-haptics');

      const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      // Swipe to slide 2
      const flatlist = getByTestId('slides-flatlist');
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 400 },
          layoutMeasurement: { width: 400 },
        },
      });

      const skipButton = await findByText('Pular');
      fireEvent.press(skipButton);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });
  });

  describe('pagination tracking through swipes', () => {
    it('should update pagination dots correctly through full slide sequence', async () => {
      const { getByTestId, getAllByTestId } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      const flatlist = getByTestId('slides-flatlist');

      // Initially on slide 1
      await waitFor(() => {
        const dots = getAllByTestId('pagination-dot');
        expect(dots).toHaveLength(3);
        expect(dots[0].props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#FF6B35' })
        );
        expect(dots[1].props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#D1D1D1' })
        );
        expect(dots[2].props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#D1D1D1' })
        );
      });

      // Swipe to slide 2
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 400 },
          layoutMeasurement: { width: 400 },
        },
      });

      await waitFor(() => {
        const dots = getAllByTestId('pagination-dot');
        expect(dots[0].props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#D1D1D1' })
        );
        expect(dots[1].props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#FF6B35' })
        );
        expect(dots[2].props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#D1D1D1' })
        );
      });

      // Swipe to slide 3
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 800 },
          layoutMeasurement: { width: 400 },
        },
      });

      await waitFor(() => {
        const dots = getAllByTestId('pagination-dot');
        expect(dots[0].props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#D1D1D1' })
        );
        expect(dots[1].props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#D1D1D1' })
        );
        expect(dots[2].props.style).toContainEqual(
          expect.objectContaining({ backgroundColor: '#FF6B35' })
        );
      });
    });

    it('should trigger haptic feedback on each swipe', async () => {
      const Haptics = require('expo-haptics');

      const { getByTestId } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      const flatlist = getByTestId('slides-flatlist');

      // Swipe to slide 2
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 400 },
          layoutMeasurement: { width: 400 },
        },
      });

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);

      // Swipe to slide 3
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 800 },
          layoutMeasurement: { width: 400 },
        },
      });

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('UI element visibility state machine', () => {
    it('slide 1: no skip, no CTA', async () => {
      const { queryByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(queryByText('Pular')).toBeNull();
        expect(queryByText('Vamos Lá!')).toBeNull();
      });
    });

    it('slide 2 (middle): skip visible, no CTA', async () => {
      const { getByTestId, queryByText, findByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      const flatlist = getByTestId('slides-flatlist');
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 400 },
          layoutMeasurement: { width: 400 },
        },
      });

      await findByText('Pular');
      expect(queryByText('Vamos Lá!')).toBeNull();
    });

    it('slide 3 (last): CTA visible, no skip', async () => {
      const { getByTestId, queryByText, findByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      const flatlist = getByTestId('slides-flatlist');
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 800 },
          layoutMeasurement: { width: 400 },
        },
      });

      await findByText('Vamos Lá!');
      expect(queryByText('Pular')).toBeNull();
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when slides are loading', () => {
      mockUseOnboardingSlides.mockReturnValue({
        data: undefined,
        isLoading: true,
        isSuccess: false,
      });

      const { getByTestId, queryByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      expect(getByTestId('loading-indicator')).toBeTruthy();
      expect(queryByText('Pular')).toBeNull();
      expect(queryByText('Vamos Lá!')).toBeNull();
    });
  });

  describe('swipe back behavior', () => {
    it('should hide skip when swiping back to slide 1', async () => {
      const { getByTestId, findByText, queryByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      const flatlist = getByTestId('slides-flatlist');

      // Swipe to slide 2
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 400 },
          layoutMeasurement: { width: 400 },
        },
      });

      await findByText('Pular');

      // Swipe back to slide 1
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 0 },
          layoutMeasurement: { width: 400 },
        },
      });

      await waitFor(() => {
        expect(queryByText('Pular')).toBeNull();
      });
    });

    it('should hide CTA and show skip when swiping back from last slide', async () => {
      const { getByTestId, findByText, queryByText } = render(<OnboardingSlidesScreen />, {
        wrapper: createWrapper(),
      });

      const flatlist = getByTestId('slides-flatlist');

      // Swipe to last slide
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 800 },
          layoutMeasurement: { width: 400 },
        },
      });

      await findByText('Vamos Lá!');

      // Swipe back to slide 2
      fireEvent(flatlist, 'onMomentumScrollEnd', {
        nativeEvent: {
          contentOffset: { x: 400 },
          layoutMeasurement: { width: 400 },
        },
      });

      await waitFor(() => {
        expect(queryByText('Vamos Lá!')).toBeNull();
      });
      await findByText('Pular');
    });
  });
});
