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
    const { TextInput, Text } = require('react-native');
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

  it('shows question text in header', () => {
    const { getByText } = render(<ProfileEditModal {...defaultProps} />);
    expect(getByText('Há quantos anos você fuma?')).toBeTruthy();
  });

  it('shows close button that calls onClose', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ProfileEditModal {...defaultProps} onClose={onClose} />
    );
    fireEvent.press(getByTestId('profile-edit-modal-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows save button', () => {
    const { getByTestId } = render(<ProfileEditModal {...defaultProps} />);
    expect(getByTestId('profile-edit-modal-save')).toBeTruthy();
  });

  it('save button is disabled when answer has not changed', () => {
    const { getByTestId } = render(<ProfileEditModal {...defaultProps} />);
    const saveButton = getByTestId('profile-edit-modal-save');
    expect(saveButton.props.accessibilityState?.disabled || saveButton.props.disabled).toBeTruthy();
  });

  it('save button is enabled when answer changes', () => {
    const { getByTestId } = render(<ProfileEditModal {...defaultProps} />);
    const input = getByTestId('mock-question-input');
    fireEvent.changeText(input, '20');
    const saveButton = getByTestId('profile-edit-modal-save');
    // After changing, the button should be enabled
    expect(saveButton.props.accessibilityState?.disabled).toBeFalsy();
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

  it('shows Salvar text on save button', () => {
    const { getByText } = render(<ProfileEditModal {...defaultProps} />);
    expect(getByText('Salvar')).toBeTruthy();
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
});
