/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import OnboardingScreen from './onboarding';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const identity = (v: any) => v;
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (component: any) => component,
    },
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: (fn: () => object) => fn(),
    withSpring: (toValue: number) => toValue,
    withTiming: (toValue: number) => toValue,
    Easing: {
      out: () => identity,
      inOut: () => identity,
      cubic: identity,
      bezier: () => identity,
    },
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light' },
  impactAsync: jest.fn(),
}));

// Mock repository hooks
jest.mock('@/db/repositories', () => ({
  useOnboardingQuestions: () => ({ data: undefined, isLoading: true }),
  useOnboardingAnswers: () => ({ data: undefined, isLoading: true }),
  useSaveAnswer: () => ({ mutateAsync: jest.fn() }),
  useDeleteDependentAnswers: () => ({ mutateAsync: jest.fn() }),
  useCompleteOnboarding: () => ({ mutateAsync: jest.fn() }),
  useIncrementCoins: () => ({ mutateAsync: jest.fn() }),
  useUserCoins: () => ({ data: 0, isLoading: false }),
}));

describe('OnboardingScreen', () => {
  it('should render OnboardingContainer', () => {
    render(<OnboardingScreen />);
    expect(screen.getByTestId('loading')).toBeDefined();
  });

  it('should render full screen', () => {
    const { toJSON } = render(<OnboardingScreen />);
    expect(toJSON()).not.toBeNull();
  });
});
