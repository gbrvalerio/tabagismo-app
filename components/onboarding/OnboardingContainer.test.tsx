import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
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

const mockTwoQuestions = [
  {
    id: 1,
    key: 'q1',
    order: 1,
    type: 'TEXT',
    category: 'PROFILE',
    questionText: 'First?',
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: {},
    createdAt: new Date(),
  },
  {
    id: 2,
    key: 'q2',
    order: 2,
    type: 'TEXT',
    category: 'PROFILE',
    questionText: 'Second?',
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
const mockUseCompleteOnboarding = jest.fn();

jest.mock('@/db/repositories', () => ({
  useOnboardingQuestions: () => mockUseOnboardingQuestions(),
  useOnboardingAnswers: () => mockUseOnboardingAnswers(),
  useSaveAnswer: () => mockUseSaveAnswer(),
  useDeleteDependentAnswers: () => mockUseDeleteDependentAnswers(),
  useCompleteOnboarding: () => mockUseCompleteOnboarding(),
}));

const mockRouterReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
}));

describe('OnboardingContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseCompleteOnboarding.mockReturnValue({ mutateAsync: jest.fn() });
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

describe('OnboardingContainer - Answer Handling', () => {
  const mockMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: mockMutateAsync });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it('should save answer when input changes', async () => {
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
      expect(screen.getByPlaceholderText('Digite sua resposta')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'João');

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        questionKey: 'name',
        answer: JSON.stringify('João'),
      });
    });
  });

  it('should update progress after answering', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
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

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer');

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeDefined();
    });
  });
});

describe('OnboardingContainer - Navigation', () => {
  const mockMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: mockMutateAsync });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it('should show next button when question is answered', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
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
      expect(screen.getByText('First?')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer');

    await waitFor(() => {
      expect(screen.getByText('Próxima')).toBeDefined();
    });
  });

  it('should advance to next question when next is pressed', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
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
      expect(screen.getByText('First?')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer');

    await waitFor(() => {
      expect(screen.getByText('Próxima')).toBeDefined();
    });

    fireEvent.press(screen.getByText('Próxima'));

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });
  });

  it('should show back button after first question', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [{ questionKey: 'q1', answer: JSON.stringify('Answer') }],
      isLoading: false,
      isSuccess: true,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
      expect(screen.getByText('Voltar')).toBeDefined();
    });
  });

  it('should go back when back button is pressed', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [{ questionKey: 'q1', answer: JSON.stringify('Answer') }],
      isLoading: false,
      isSuccess: true,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });

    fireEvent.press(screen.getByText('Voltar'));

    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });
  });
});

describe('OnboardingContainer - Completion', () => {
  const mockCompleteMutateAsync = jest.fn().mockResolvedValue(undefined);
  const mockSaveMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: mockSaveMutateAsync });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseCompleteOnboarding.mockReturnValue({ mutateAsync: mockCompleteMutateAsync });
  });

  it('should show finish button on last question when answered', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: [mockQuestions[0]],
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

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'João');

    await waitFor(() => {
      expect(screen.getByText('Concluir')).toBeDefined();
    });
  });

  it('should complete onboarding when finish is pressed', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: [mockQuestions[0]],
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

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'João');

    await waitFor(() => {
      expect(screen.getByText('Concluir')).toBeDefined();
    });

    fireEvent.press(screen.getByText('Concluir'));

    await waitFor(() => {
      expect(mockCompleteMutateAsync).toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
