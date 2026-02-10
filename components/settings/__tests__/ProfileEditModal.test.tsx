import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileEditModal } from '../ProfileEditModal';
import type { Question } from '@/db/schema/questions';
import * as Haptics from '@/lib/haptics';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'SUCCESS',
    Warning: 'WARNING',
    Error: 'ERROR',
  },
}));

// Mock QuestionInput
jest.mock('@/components/question-flow/QuestionInput', () => ({
  QuestionInput: ({ question, value, onChange }: any) => {
    const { TextInput, Text, Button, View } = require('react-native');

    // For MULTIPLE_CHOICE, render value as array
    if (question.type === 'MULTIPLE_CHOICE') {
      const currentValue = Array.isArray(value) ? value : [];
      return (
        <View>
          <Text testID="question-input-label">{question.questionText}</Text>
          <Text testID="mock-question-input-value">
            {JSON.stringify(currentValue)}
          </Text>
          <Button
            testID="mock-add-choice"
            title="Add Choice"
            onPress={() => {
              onChange([...currentValue, 'New Choice']);
            }}
          />
        </View>
      );
    }

    // For other types, use text input
    return (
      <>
        <Text testID="question-input-label">{question.questionText}</Text>
        <TextInput
          testID="mock-question-input"
          value={String(value ?? '')}
          onChangeText={(text: string) => onChange(text)}
        />
      </>
    );
  },
}));

// Mock QuestionText
jest.mock('@/components/question-flow/QuestionText', () => ({
  QuestionText: ({ text }: any) => {
    const { Text } = require('react-native');
    return <Text testID="question-text">{text}</Text>;
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

const makeQuestion = (overrides?: Partial<Question>): Question => ({
  id: 1,
  context: 'onboarding',
  key: 'smoking_years',
  order: 1,
  type: 'NUMBER',
  category: 'ADDICTION',
  questionText: 'Há quantos anos você fuma?',
  required: true,
  dependsOnQuestionKey: null,
  dependsOnValue: null,
  metadata: null,
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

describe('ProfileEditModal', () => {
  const defaultProps = {
    visible: true,
    question: makeQuestion(),
    currentAnswer: '10',
    onSave: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible is true', () => {
    const { getByTestId } = render(<ProfileEditModal {...defaultProps} />);
    expect(getByTestId('profile-edit-modal')).toBeTruthy();
  });

  it('does not render content when visible is false', () => {
    const { queryByTestId } = render(
      <ProfileEditModal {...defaultProps} visible={false} />
    );
    expect(queryByTestId('profile-edit-modal-content')).toBeNull();
  });

  it('shows question text', () => {
    const { getByTestId } = render(<ProfileEditModal {...defaultProps} />);
    const questionText = getByTestId('question-text');
    expect(questionText.props.children).toBe('Há quantos anos você fuma?');
  });

  it('shows close button that calls onClose', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ProfileEditModal {...defaultProps} onClose={onClose} />
    );
    fireEvent.press(getByTestId('profile-edit-modal-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not show save button when answer has not changed', () => {
    const { queryByTestId } = render(<ProfileEditModal {...defaultProps} />);
    expect(queryByTestId('profile-edit-modal-save')).toBeNull();
  });

  it('shows save button when answer changes', () => {
    const { getByTestId } = render(<ProfileEditModal {...defaultProps} />);
    const input = getByTestId('mock-question-input');
    fireEvent.changeText(input, '20');
    const saveButton = getByTestId('profile-edit-modal-save');
    expect(saveButton).toBeTruthy();
  });

  it('calls onSave with the new answer when save is pressed', () => {
    const onSave = jest.fn();
    const { getByTestId } = render(
      <ProfileEditModal {...defaultProps} onSave={onSave} />
    );
    const input = getByTestId('mock-question-input');
    fireEvent.changeText(input, '20');
    fireEvent.press(getByTestId('profile-edit-modal-save'));
    expect(onSave).toHaveBeenCalledWith('20');
  });

  it('triggers haptic feedback on save', () => {
    const { getByTestId } = render(<ProfileEditModal {...defaultProps} />);
    const input = getByTestId('mock-question-input');
    fireEvent.changeText(input, '20');
    fireEvent.press(getByTestId('profile-edit-modal-save'));
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });

  it('handles null question gracefully', () => {
    const { queryByTestId } = render(
      <ProfileEditModal {...defaultProps} question={null} />
    );
    // Should not crash; should not render the input content
    expect(queryByTestId('mock-question-input')).toBeNull();
  });

  it('handles null currentAnswer', () => {
    const { getByTestId } = render(
      <ProfileEditModal {...defaultProps} currentAnswer={null} />
    );
    expect(getByTestId('mock-question-input')).toBeTruthy();
  });

  it('renders the QuestionInput with correct props', () => {
    const { getByTestId } = render(<ProfileEditModal {...defaultProps} />);
    const input = getByTestId('mock-question-input');
    expect(input.props.value).toBe('10');
  });

  it('shows ✓ Salvar text on save button when answer changes', () => {
    const { getByTestId, getByText } = render(<ProfileEditModal {...defaultProps} />);
    const input = getByTestId('mock-question-input');
    fireEvent.changeText(input, '20');
    expect(getByText('✓ Salvar')).toBeTruthy();
  });

  it('calls onClose when close button is pressed without saving', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ProfileEditModal {...defaultProps} onSave={onSave} onClose={onClose} />
    );
    fireEvent.press(getByTestId('profile-edit-modal-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  describe('MULTIPLE_CHOICE questions', () => {
    it('parses JSON string answer to array for QuestionInput', () => {
      const multipleChoiceQuestion = makeQuestion({
        type: 'MULTIPLE_CHOICE',
        questionText: 'Quais são suas motivações?',
        metadata: {
          choices: ['Melhorar saúde', 'Economizar dinheiro', 'Dar exemplo'],
        },
      });

      // Database stores multiple choice answers as JSON strings
      const jsonAnswer = '["Melhorar saúde","Economizar dinheiro"]';

      const { getByTestId } = render(
        <ProfileEditModal
          {...defaultProps}
          question={multipleChoiceQuestion}
          currentAnswer={jsonAnswer}
        />
      );

      // QuestionInput should receive the parsed array, not the JSON string
      const valueDisplay = getByTestId('mock-question-input-value');
      expect(valueDisplay.props.children).toBe('["Melhorar saúde","Economizar dinheiro"]');
    });

    it('stringifies array answer to JSON when saving', () => {
      const onSave = jest.fn();
      const multipleChoiceQuestion = makeQuestion({
        type: 'MULTIPLE_CHOICE',
        questionText: 'Quais são suas motivações?',
        metadata: {
          choices: ['Melhorar saúde', 'Economizar dinheiro', 'Dar exemplo'],
        },
      });

      const jsonAnswer = '["Melhorar saúde"]';

      const { getByTestId } = render(
        <ProfileEditModal
          {...defaultProps}
          question={multipleChoiceQuestion}
          currentAnswer={jsonAnswer}
          onSave={onSave}
        />
      );

      // Simulate user adding a choice via QuestionInput
      const addButton = getByTestId('mock-add-choice');
      fireEvent.press(addButton);

      fireEvent.press(getByTestId('profile-edit-modal-save'));

      // Should save as JSON string
      expect(onSave).toHaveBeenCalledWith('["Melhorar saúde","New Choice"]');
    });

    it('does not show save button when answer has not changed for MULTIPLE_CHOICE', () => {
      const multipleChoiceQuestion = makeQuestion({
        type: 'MULTIPLE_CHOICE',
        questionText: 'Quais são suas motivações?',
        metadata: {
          choices: ['Melhorar saúde', 'Economizar dinheiro', 'Dar exemplo'],
        },
      });

      const jsonAnswer = '["Melhorar saúde","Economizar dinheiro"]';

      const { queryByTestId } = render(
        <ProfileEditModal
          {...defaultProps}
          question={multipleChoiceQuestion}
          currentAnswer={jsonAnswer}
        />
      );

      // Save button should NOT appear if user hasn't changed anything
      expect(queryByTestId('profile-edit-modal-save')).toBeNull();
    });
  });
});
