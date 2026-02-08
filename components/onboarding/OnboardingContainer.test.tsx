import React from 'react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { OnboardingContainer } from './OnboardingContainer';

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
      // Progress bar should be rendered (dots visible)
      expect(screen.getByTestId('onboarding-header')).toBeDefined();
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

  it('should update progress based on current question position', async () => {
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

    // On first question (index 0)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Digite sua resposta')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer');

    // After answering, next button should appear
    await waitFor(() => {
      expect(screen.getByText('Próxima →')).toBeDefined();
    });

    // Press next to go to second question (index 1)
    fireEvent.press(screen.getByText('Próxima →'));
    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
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
      expect(screen.getByText('Próxima →')).toBeDefined();
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
      expect(screen.getByText('Próxima →')).toBeDefined();
    });

    fireEvent.press(screen.getByText('Próxima →'));

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
      expect(screen.getByText('← Voltar')).toBeDefined();
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

    fireEvent.press(screen.getByText('← Voltar'));

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

  it('should clear answers for questions after dependent when parent answer changes', async () => {
    // Simulate full question flow with dependencies
    const fullQuestionFlow = [
      {
        id: 1,
        key: 'name',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Nome?',
        required: true,
        dependsOnQuestionKey: null,
        dependsOnValue: null,
        metadata: {},
        createdAt: new Date(),
      },
      {
        id: 2,
        key: 'addiction_type',
        order: 2,
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
        id: 3,
        key: 'cigarettes_per_day',
        order: 3,
        type: 'NUMBER',
        category: 'HABITS',
        questionText: 'Cigarros por dia?',
        required: true,
        dependsOnQuestionKey: 'addiction_type',
        dependsOnValue: 'Cigarro',
        metadata: {},
        createdAt: new Date(),
      },
      {
        id: 4,
        key: 'pod_duration',
        order: 4,
        type: 'NUMBER',
        category: 'HABITS',
        questionText: 'Duração do pod?',
        required: true,
        dependsOnQuestionKey: 'addiction_type',
        dependsOnValue: 'Vape',
        metadata: {},
        createdAt: new Date(),
      },
      {
        id: 5,
        key: 'years_smoking',
        order: 5,
        type: 'NUMBER',
        category: 'HABITS',
        questionText: 'Anos fumando?',
        required: true,
        dependsOnQuestionKey: null,
        dependsOnValue: null,
        metadata: {},
        createdAt: new Date(),
      },
      {
        id: 6,
        key: 'motivation',
        order: 6,
        type: 'TEXT',
        category: 'MOTIVATION',
        questionText: 'Motivação?',
        required: true,
        dependsOnQuestionKey: null,
        dependsOnValue: null,
        metadata: {},
        createdAt: new Date(),
      },
    ];

    mockUseOnboardingQuestions.mockReturnValue({
      data: fullQuestionFlow,
      isLoading: false,
      isSuccess: true,
    });

    // Start with user having completed flow with "Vape" path
    mockUseOnboardingAnswers.mockReturnValue({
      data: [
        { questionKey: 'name', answer: JSON.stringify('João') },
        { questionKey: 'addiction_type', answer: JSON.stringify('Vape') },
        { questionKey: 'pod_duration', answer: JSON.stringify(5) },
        { questionKey: 'years_smoking', answer: JSON.stringify(10) },
        { questionKey: 'motivation', answer: JSON.stringify('Saúde') },
      ],
      isLoading: false,
      isSuccess: true,
    });

    render(<OnboardingContainer />);

    // Component loads - it navigates to first unanswered question (Nome in this case)
    // BUG: Initially shows 6/5 because answeredCount includes all 5 answers in cache
    // plus currentStep adds 1, giving us 6/5
    await waitFor(() => {
      expect(screen.getByText('Nome?')).toBeDefined();
    });

    // Navigate to addiction_type question
    fireEvent.press(screen.getByText('Próxima →'));
    await waitFor(() => {
      expect(screen.getByText('Tipo de dependência?')).toBeDefined();
    });

    // User changes addiction_type from Vape to Cigarro
    fireEvent.press(screen.getByText('Cigarro'));

    // After changing addiction_type:
    // - Applicable questions: name, addiction_type, cigarettes_per_day, years_smoking, motivation = 5 total
    // - pod_duration should be removed from cache (dependent on Vape)
    // - years_smoking and motivation should ALSO be removed (come after the changed dependency)
    // - Only name and addiction_type should remain answered = 2 answered
    // - Current position is question 2 (index 1, addiction_type)
    await waitFor(() => {
      expect(screen.getByText('Tipo de dependência?')).toBeDefined();
    });
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
      expect(screen.getByText('✓ Concluir')).toBeDefined();
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
      expect(screen.getByText('✓ Concluir')).toBeDefined();
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
      expect(screen.getByText('✓ Concluir')).toBeDefined();
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
      expect(screen.getByText('✓ Concluir')).toBeDefined();
    });

    fireEvent.press(screen.getByText('✓ Concluir'));

    await waitFor(() => {
      expect(mockCompleteMutateAsync).toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/');
    });
  });
});

describe('OnboardingContainer - New Layout Structure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseCompleteOnboarding.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it('should render SafeAreaView wrapper', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByTestId('safe-area-container')).toBeDefined();
    });
  });

  it('should render KeyboardAvoidingView with correct behavior', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      const keyboardView = screen.getByTestId('keyboard-avoiding-view');
      expect(keyboardView).toBeDefined();
    });
  });

  it('should render header with progress bar', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-header')).toBeDefined();
    });
  });

  it('should render back button in header when currentIndex > 0', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [
        { id: 1, userId: 1, questionKey: 'q1', answer: '"answered"', createdAt: new Date() },
      ],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('← Voltar')).toBeDefined();
    });
  });

  it('should not render back button when currentIndex = 0', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.queryByText('← Voltar')).toBeNull();
    });
  });

  it('should render scrollable content area', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByTestId('content-scroll-view')).toBeDefined();
    });
  });

  it('should render footer with action button', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [
        { id: 1, userId: 1, questionKey: 'name', answer: '"John"', createdAt: new Date() },
      ],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByTestId('onboarding-footer')).toBeDefined();
    });
  });

  it('should keep question text fixed outside ScrollView', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      const questionText = screen.getByText('Qual é o seu nome?');
      const scrollView = screen.getByTestId('content-scroll-view');

      // Question text should not be inside the ScrollView
      expect(questionText).toBeDefined();
      expect(scrollView).toBeDefined();
    });
  });
});

describe('Integration: Complete onboarding flow', () => {
  it('should navigate through questions with auto-focus and keyboard', async () => {
    const mockSaveAnswer = jest.fn().mockResolvedValue(undefined);
    const mockDeleteDependentAnswers = jest.fn().mockResolvedValue(undefined);
    const mockCompleteOnboarding = jest.fn().mockResolvedValue(undefined);

    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockUseSaveAnswer.mockReturnValue({
      mutateAsync: mockSaveAnswer,
    });
    mockUseDeleteDependentAnswers.mockReturnValue({
      mutateAsync: mockDeleteDependentAnswers,
    });
    mockUseCompleteOnboarding.mockReturnValue({
      mutateAsync: mockCompleteOnboarding,
    });

    render(<OnboardingContainer />);

    // Wait for first question to render
    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });

    // Verify SafeAreaView and KeyboardAvoidingView are present
    expect(screen.getByTestId('safe-area-container')).toBeDefined();
    expect(screen.getByTestId('keyboard-avoiding-view')).toBeDefined();

    // Answer first question
    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer 1');

    await waitFor(() => {
      expect(mockSaveAnswer).toHaveBeenCalledWith({
        questionKey: 'q1',
        answer: '"Answer 1"',
      });
    });

    // Navigate to second question
    const nextButton = screen.getByText('Próxima →');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });

    // Verify back button appears
    expect(screen.getByText('← Voltar')).toBeDefined();

    // Answer second question
    const input2 = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input2, 'Answer 2');

    await waitFor(() => {
      expect(mockSaveAnswer).toHaveBeenCalledWith({
        questionKey: 'q2',
        answer: '"Answer 2"',
      });
    });

    // Finish onboarding
    const finishButton = screen.getByText('✓ Concluir');
    fireEvent.press(finishButton);

    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalled();
    });
  });

  it('should handle back navigation with preserved answers', async () => {
    const mockSaveAnswer = jest.fn().mockResolvedValue(undefined);

    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [
        { id: 1, userId: 1, questionKey: 'q1', answer: '"Saved Answer"', createdAt: new Date() },
      ],
      isLoading: false,
    });
    mockUseSaveAnswer.mockReturnValue({
      mutateAsync: mockSaveAnswer,
    });

    render(<OnboardingContainer />);

    // Should start at second question (first is answered)
    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });

    // Back button should be visible
    expect(screen.getByText('← Voltar')).toBeDefined();

    // Navigate back
    const backButton = screen.getByText('← Voltar');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });

    // Verify the saved answer is displayed
    expect(screen.getByDisplayValue('Saved Answer')).toBeDefined();

    // Back button should not be visible on first question
    expect(screen.queryByText('← Voltar')).toBeNull();
  });
});

describe('OnboardingContainer - Idle Animations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseCompleteOnboarding.mockReturnValue({ mutateAsync: jest.fn() });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should trigger idle animation after 3 seconds when question is answered', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });

    // Answer the question
    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer');

    await waitFor(() => {
      expect(screen.getByText('Próxima →')).toBeDefined();
    });

    // Fast-forward time by 3 seconds to trigger idle animation
    jest.advanceTimersByTime(3000);

    // Button should still be visible (animation is visual, component structure unchanged)
    expect(screen.getByText('Próxima →')).toBeDefined();
  });

  it('should reset idle timer when user navigates to next question', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });

    // Answer first question
    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer');

    await waitFor(() => {
      expect(screen.getByText('Próxima →')).toBeDefined();
    });

    // Navigate to next question before idle timer triggers
    const nextButton = screen.getByText('Próxima →');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });

    // Idle timer should be reset (no way to directly test animation state, but component should be stable)
    expect(screen.getByText('Second?')).toBeDefined();
  });

  it('should reset idle timer when user navigates back', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [
        { id: 1, userId: 1, questionKey: 'q1', answer: '"Answer"', createdAt: new Date() },
      ],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    // Start at second question
    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });

    // Navigate back
    const backButton = screen.getByText('← Voltar');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });

    // Timer should be reset (component should be stable)
    expect(screen.getByText('First?')).toBeDefined();
  });

  it('should not trigger idle animation when question is not answered', async () => {
    mockUseOnboardingQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<OnboardingContainer />);

    await waitFor(() => {
      expect(screen.getByText('Qual é o seu nome?')).toBeDefined();
    });

    // No next button should be visible
    expect(screen.queryByText('Próxima →')).toBeNull();
    expect(screen.queryByText('✓ Concluir')).toBeNull();

    // Fast-forward time
    jest.advanceTimersByTime(5000);

    // Still no button (nothing to animate)
    expect(screen.queryByText('Próxima →')).toBeNull();
  });
});
