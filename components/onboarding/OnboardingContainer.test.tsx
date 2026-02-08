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

const mockQuestionsWithDependency = [
  {
    id: 1,
    key: 'addiction_type',
    order: 1,
    type: 'SINGLE_CHOICE',
    category: 'ADDICTION',
    questionText: 'Tipo de dependência?',
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: { choices: ['Cigarro', 'Vape'] },
    createdAt: new Date(),
  },
  {
    id: 2,
    key: 'cigarettes_per_day',
    order: 2,
    type: 'NUMBER',
    category: 'ADDICTION',
    questionText: 'Quantos cigarros por dia?',
    required: true,
    dependsOnQuestionKey: 'addiction_type',
    dependsOnValue: 'Cigarro',
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

describe('OnboardingContainer - Dependent Answer Deletion', () => {
  const mockSaveMutateAsync = jest.fn().mockResolvedValue(undefined);
  const mockDeleteDependentMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: mockSaveMutateAsync });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: mockDeleteDependentMutateAsync });
    mockUseCompleteOnboarding.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it('should delete dependent answers when parent answer changes', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestionsWithDependency,
      isLoading: false,
      isSuccess: true,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [
        { questionKey: 'addiction_type', answer: JSON.stringify('Cigarro') },
        { questionKey: 'cigarettes_per_day', answer: JSON.stringify(10) },
      ],
      isLoading: false,
      isSuccess: true,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('Tipo de dependência?')).toBeDefined();
    });

    // Change parent answer — should trigger deletion of dependent answers
    fireEvent.press(screen.getByText('Vape'));

    await waitFor(() => {
      expect(mockDeleteDependentMutateAsync).toHaveBeenCalledWith({
        parentQuestionKey: 'addiction_type',
      });
    });
  });

  it('should not delete dependent answers for questions without dependents', async () => {
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
      expect(mockSaveMutateAsync).toHaveBeenCalled();
    });

    expect(mockDeleteDependentMutateAsync).not.toHaveBeenCalled();
  });
});

describe('OnboardingContainer - Infinite Loop Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: jest.fn().mockResolvedValue(undefined) });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseCompleteOnboarding.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it('should not re-initialize answers cache when existingAnswers reference changes after mutation', async () => {
    const answers = [{ questionKey: 'q1', answer: JSON.stringify('Answer') }];

    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: answers,
      isLoading: false,
      isSuccess: true,
    });

    const { rerender } = render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });

    // Navigate to second question and answer it
    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer 2');

    await waitFor(() => {
      expect(screen.getByText('Concluir')).toBeDefined();
    });

    // Simulate query refetch returning new array reference (as happens after invalidation)
    const newAnswersRef = [
      { questionKey: 'q1', answer: JSON.stringify('Answer') },
      { questionKey: 'q2', answer: JSON.stringify('Answer 2') },
    ];
    mockUseOnboardingAnswers.mockReturnValue({
      data: newAnswersRef,
      isLoading: false,
      isSuccess: true,
    });

    rerender(<OnboardingContainer />);

    // Should still show the last question, not reset to first unanswered
    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
      expect(screen.getByText('Concluir')).toBeDefined();
    });
  });
});

describe('OnboardingContainer - JSON Parse Safety', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseCompleteOnboarding.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it('should handle malformed JSON in existing answers gracefully', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [{ questionKey: 'name', answer: '{invalid json' }],
      isLoading: false,
      isSuccess: true,
    });

    render(<OnboardingContainer />);

    // Should not crash — should render the question
    await waitFor(() => {
      expect(screen.getByText('Qual é o seu nome?')).toBeDefined();
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
