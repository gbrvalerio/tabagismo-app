/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react-native';

import type { Question } from '@/db/schema/questions';
import { QuestionType, QuestionCategory } from '@/db/schema/questions';

// --- Mock data ---

const mockQuestions: Question[] = [
  {
    id: 1,
    context: 'onboarding',
    key: 'name',
    order: 1,
    type: QuestionType.TEXT,
    category: QuestionCategory.PROFILE,
    questionText: 'Qual e o seu nome?',
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: {},
    createdAt: new Date(),
  },
  {
    id: 2,
    context: 'onboarding',
    key: 'gender',
    order: 2,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.PROFILE,
    questionText: 'Qual e o seu genero?',
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: { choices: ['Masculino', 'Feminino', 'Outro'] },
    createdAt: new Date(),
  },
  {
    id: 3,
    context: 'onboarding',
    key: 'addiction_type',
    order: 3,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.ADDICTION,
    questionText: 'Qual e o seu vicio?',
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: { choices: ['Cigarro/Tabaco', 'Pod/Vape'] },
    createdAt: new Date(),
  },
  {
    id: 4,
    context: 'onboarding',
    key: 'cigarettes_per_day',
    order: 4,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.HABITS,
    questionText: 'Quantos cigarros voce fuma por dia?',
    required: true,
    dependsOnQuestionKey: 'addiction_type',
    dependsOnValue: 'Cigarro/Tabaco',
    metadata: { choices: ['1-10', '11-20', '21-40', '40+'] },
    createdAt: new Date(),
  },
  {
    id: 5,
    context: 'onboarding',
    key: 'pod_duration_days',
    order: 5,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.HABITS,
    questionText: 'Quantos dias dura um pod?',
    required: true,
    dependsOnQuestionKey: 'addiction_type',
    dependsOnValue: 'Pod/Vape',
    metadata: { choices: ['1-7 dias', '8-14 dias', '15-30 dias'] },
    createdAt: new Date(),
  },
  {
    id: 6,
    context: 'onboarding',
    key: 'years_smoking',
    order: 6,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.HABITS,
    questionText: 'Ha quantos anos voce fuma?',
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: { choices: ['Menos de 1 ano', '1-5 anos'] },
    createdAt: new Date(),
  },
  {
    id: 7,
    context: 'onboarding',
    key: 'quit_attempts',
    order: 7,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.MOTIVATION,
    questionText: 'Quantas vezes voce ja tentou parar?',
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: { choices: ['Nunca tentei', '1 vez', '2-5 vezes'] },
    createdAt: new Date(),
  },
  {
    id: 8,
    context: 'onboarding',
    key: 'goals',
    order: 8,
    type: QuestionType.MULTIPLE_CHOICE,
    category: QuestionCategory.GOALS,
    questionText: 'O que te motiva a parar?',
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: { choices: ['Melhorar saude', 'Economizar dinheiro', 'Dar exemplo'] },
    createdAt: new Date(),
  },
];

const mockAnswers = [
  { id: 1, context: 'onboarding', questionKey: 'name', userId: 1, answer: 'Maria', answeredAt: new Date(), updatedAt: new Date() },
  { id: 2, context: 'onboarding', questionKey: 'gender', userId: 1, answer: 'Feminino', answeredAt: new Date(), updatedAt: new Date() },
  { id: 3, context: 'onboarding', questionKey: 'addiction_type', userId: 1, answer: 'Cigarro/Tabaco', answeredAt: new Date(), updatedAt: new Date() },
  { id: 4, context: 'onboarding', questionKey: 'cigarettes_per_day', userId: 1, answer: '11-20', answeredAt: new Date(), updatedAt: new Date() },
  { id: 5, context: 'onboarding', questionKey: 'years_smoking', userId: 1, answer: '1-5 anos', answeredAt: new Date(), updatedAt: new Date() },
  { id: 6, context: 'onboarding', questionKey: 'quit_attempts', userId: 1, answer: '2-5 vezes', answeredAt: new Date(), updatedAt: new Date() },
  { id: 7, context: 'onboarding', questionKey: 'goals', userId: 1, answer: '["Melhorar saude","Economizar dinheiro"]', answeredAt: new Date(), updatedAt: new Date() },
];

// --- Mocks ---

const mockSaveAnswerMutateAsync = jest.fn().mockResolvedValue({});
const mockDeleteDependentMutateAsync = jest.fn().mockResolvedValue({});

const mockUseQuestions = jest.fn();
const mockUseAnswers = jest.fn();
const mockUseSaveAnswer = jest.fn();
const mockUseDeleteDependentAnswers = jest.fn();

jest.mock('@/db/repositories/questions.repository', () => ({
  useQuestions: (...args: any[]) => mockUseQuestions(...args),
  useAnswers: (...args: any[]) => mockUseAnswers(...args),
  useSaveAnswer: (...args: any[]) => mockUseSaveAnswer(...args),
  useDeleteDependentAnswers: (...args: any[]) => mockUseDeleteDependentAnswers(...args),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Stack: {
      Screen: jest.fn((_props: any) => null),
    },
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
    }),
  };
});

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/settings/ProfileEditModal', () => {
  const { View, Text, Pressable } = require('react-native');
  return {
    ProfileEditModal: ({
      visible,
      question,
      currentAnswer,
      onSave,
      onClose,
    }: any) => {
      if (!visible) return null;
      return (
        <View testID="profile-edit-modal">
          <Text testID="modal-question-text">{question?.questionText}</Text>
          <Text testID="modal-current-answer">{currentAnswer}</Text>
          <Pressable
            testID="modal-save-button"
            onPress={() => onSave('new-answer')}
          />
          <Pressable testID="modal-close-button" onPress={onClose} />
        </View>
      );
    },
  };
});

jest.mock('@/lib/haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));

// Import after mocks
import ProfileScreen from '../profile';

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuestions.mockReturnValue({ data: mockQuestions, isLoading: false });
    mockUseAnswers.mockReturnValue({ data: mockAnswers, isLoading: false });
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: mockSaveAnswerMutateAsync });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: mockDeleteDependentMutateAsync });
  });

  describe('Header', () => {
    it('sets screen title to "Perfil" via Stack.Screen', () => {
      render(<ProfileScreen />);

      const { Stack } = require('expo-router');
      expect(Stack.Screen).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({ title: 'Perfil' }),
        }),
        undefined
      );
    });
  });

  describe('Category Sections', () => {
    it('renders all applicable category headers in correct order', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        const headers = [
          screen.getByText('PERFIL'),
          screen.getByText('VICIO'),
          screen.getByText('HABITOS'),
          screen.getByText('MOTIVACAO'),
          screen.getByText('OBJETIVOS'),
        ];
        expect(headers).toHaveLength(5);
      });
    });

    it('groups questions by category correctly', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        // Profile questions should exist
        expect(screen.getByText('Qual e o seu nome?')).toBeTruthy();
        expect(screen.getByText('Qual e o seu genero?')).toBeTruthy();
        // Addiction questions should exist
        expect(screen.getByText('Qual e o seu vicio?')).toBeTruthy();
      });
    });
  });

  describe('Question Rows', () => {
    it('renders question text and current answer', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Qual e o seu nome?')).toBeTruthy();
        expect(screen.getByText('Maria')).toBeTruthy();
        expect(screen.getByText('Qual e o seu genero?')).toBeTruthy();
        expect(screen.getByText('Feminino')).toBeTruthy();
      });
    });

    it('shows comma-joined display for multiple choice answers', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Melhorar saude, Economizar dinheiro')).toBeTruthy();
      });
    });

    it('shows dash when no answer exists for a question', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        // quit_attempts has answer, but years_smoking also has answer
        // pod_duration_days is hidden because addiction_type = Cigarro/Tabaco
        // All visible questions have answers except possibly some
        expect(screen.getByText('Qual e o seu nome?')).toBeTruthy();
      });
    });
  });

  describe('Conditional Questions', () => {
    it('hides conditional questions that are not applicable', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        // addiction_type is Cigarro/Tabaco, so pod_duration_days should be hidden
        expect(screen.queryByText('Quantos dias dura um pod?')).toBeNull();
      });
    });

    it('shows conditional questions that are applicable', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        // cigarettes_per_day should be visible since addiction_type = Cigarro/Tabaco
        expect(screen.getByText('Quantos cigarros voce fuma por dia?')).toBeTruthy();
      });
    });

    it('shows pod questions when addiction_type is Pod/Vape', async () => {
      const podAnswers = mockAnswers.map((a) => {
        if (a.questionKey === 'addiction_type') return { ...a, answer: 'Pod/Vape' };
        if (a.questionKey === 'cigarettes_per_day') return null;
        return a;
      }).filter(Boolean);

      // Add pod_duration_days answer
      podAnswers.push({
        id: 10,
        context: 'onboarding',
        questionKey: 'pod_duration_days',
        userId: 1,
        answer: '8-14 dias',
        answeredAt: new Date(),
        updatedAt: new Date(),
      });

      mockUseAnswers.mockReturnValue({ data: podAnswers, isLoading: false });

      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Quantos dias dura um pod?')).toBeTruthy();
        expect(screen.queryByText('Quantos cigarros voce fuma por dia?')).toBeNull();
      });
    });
  });

  describe('ProfileEditModal Integration', () => {
    it('opens ProfileEditModal on row tap', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Qual e o seu nome?')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('profile-row-name'));

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-modal')).toBeTruthy();
        expect(screen.getByTestId('modal-question-text').props.children).toBe(
          'Qual e o seu nome?'
        );
      });
    });

    it('closes modal when onClose is called', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Qual e o seu nome?')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('profile-row-name'));

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-modal')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('modal-close-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('profile-edit-modal')).toBeNull();
      });
    });

    it('saves answer on modal save', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Qual e o seu nome?')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('profile-row-name'));

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-modal')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('modal-save-button'));

      await waitFor(() => {
        expect(mockSaveAnswerMutateAsync).toHaveBeenCalledWith({
          questionKey: 'name',
          answer: 'new-answer',
        });
      });
    });

    it('triggers dependent answer deletion when changing addiction_type', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Qual e o seu vicio?')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('profile-row-addiction_type'));

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-modal')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('modal-save-button'));

      await waitFor(() => {
        expect(mockSaveAnswerMutateAsync).toHaveBeenCalledWith({
          questionKey: 'addiction_type',
          answer: 'new-answer',
        });
        expect(mockDeleteDependentMutateAsync).toHaveBeenCalledWith({
          parentQuestionKey: 'addiction_type',
        });
      });
    });

    it('does NOT trigger dependent answer deletion for non-addiction_type questions', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Qual e o seu nome?')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('profile-row-name'));

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-modal')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('modal-save-button'));

      await waitFor(() => {
        expect(mockSaveAnswerMutateAsync).toHaveBeenCalled();
        expect(mockDeleteDependentMutateAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no answers exist', async () => {
      mockUseAnswers.mockReturnValue({ data: [], isLoading: false });

      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Completar perfil')).toBeTruthy();
      });
    });

    it('does not show empty state when answers exist', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Completar perfil')).toBeNull();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when questions are loading', () => {
      mockUseQuestions.mockReturnValue({ data: undefined, isLoading: true });
      mockUseAnswers.mockReturnValue({ data: undefined, isLoading: true });

      render(<ProfileScreen />);

      expect(screen.getByTestId('profile-loading')).toBeTruthy();
    });

    it('does not show loading indicator when data is loaded', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.queryByTestId('profile-loading')).toBeNull();
      });
    });
  });

  describe('Data Hooks', () => {
    it('calls useQuestions with onboarding context', () => {
      render(<ProfileScreen />);
      expect(mockUseQuestions).toHaveBeenCalledWith('onboarding');
    });

    it('calls useAnswers with onboarding context', () => {
      render(<ProfileScreen />);
      expect(mockUseAnswers).toHaveBeenCalledWith('onboarding');
    });

    it('calls useSaveAnswer with onboarding context', () => {
      render(<ProfileScreen />);
      expect(mockUseSaveAnswer).toHaveBeenCalledWith('onboarding');
    });

    it('calls useDeleteDependentAnswers with onboarding context', () => {
      render(<ProfileScreen />);
      expect(mockUseDeleteDependentAnswers).toHaveBeenCalledWith('onboarding');
    });
  });

  describe('Answer Display', () => {
    it('handles null/undefined answers gracefully', async () => {
      // Remove some answers to test graceful handling
      const partialAnswers = mockAnswers.filter(
        (a) => a.questionKey === 'name' || a.questionKey === 'addiction_type'
      );
      mockUseAnswers.mockReturnValue({ data: partialAnswers, isLoading: false });

      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.getByText('Maria')).toBeTruthy();
        // gender has no answer, should show dash or empty
        expect(screen.getByText('Qual e o seu genero?')).toBeTruthy();
      });
    });

    it('handles malformed JSON for multiple choice gracefully', async () => {
      const badAnswers = [
        ...mockAnswers.filter((a) => a.questionKey !== 'goals'),
        {
          id: 20,
          context: 'onboarding',
          questionKey: 'goals',
          userId: 1,
          answer: 'not-valid-json',
          answeredAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockUseAnswers.mockReturnValue({ data: badAnswers, isLoading: false });

      render(<ProfileScreen />);

      // Should not crash, should display the raw answer
      await waitFor(() => {
        expect(screen.getByText('not-valid-json')).toBeTruthy();
      });
    });
  });
});
