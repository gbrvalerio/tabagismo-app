import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react-native';
import { OnboardingContainer } from './OnboardingContainer';

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  impactAsync: jest.fn(),
}));

const mockQuestions = [
  {
    id: 1,
    key: 'name',
    order: 1,
    type: 'TEXT',
    category: 'PROFILE',
    questionText: 'Qual é o seu nome?',
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: {},
    createdAt: new Date(),
  },
];

const mockUseOnboardingQuestions = jest.fn();
const mockUseOnboardingAnswers = jest.fn();
const mockUseSaveAnswer = jest.fn();
const mockUseDeleteDependentAnswers = jest.fn();

jest.mock('@/db/repositories', () => ({
  useOnboardingQuestions: () => mockUseOnboardingQuestions(),
  useOnboardingAnswers: () => mockUseOnboardingAnswers(),
  useSaveAnswer: () => mockUseSaveAnswer(),
  useDeleteDependentAnswers: () => mockUseDeleteDependentAnswers(),
}));

describe('OnboardingContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it('should render loading state initially', () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });

    render(<OnboardingContainer />);
    expect(screen.getByTestId('loading')).toBeDefined();
  });

  it('should render first question after loading', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('Qual é o seu nome?')).toBeDefined();
    });
  });

  it('should show progress bar', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('0%')).toBeDefined();
    });
  });
});
