import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { Question } from '@/db/schema/questions';
import { QuestionInput } from '@/components/question-flow/QuestionInput';
import * as Haptics from '@/lib/haptics';
import { colors, spacing, typography, borderRadius } from '@/lib/theme/tokens';

interface ProfileEditModalProps {
  visible: boolean;
  question: Question | null;
  currentAnswer: string | null;
  onSave: (answer: string) => void;
  onClose: () => void;
}

export function ProfileEditModal({
  visible,
  question,
  currentAnswer,
  onSave,
  onClose,
}: ProfileEditModalProps) {
  const [answer, setAnswer] = useState<string | number | string[] | null>(currentAnswer);

  useEffect(() => {
    if (visible) {
      setAnswer(currentAnswer);
    }
  }, [visible, currentAnswer]);

  const hasChanged = answer !== currentAnswer;

  const handleSave = () => {
    if (!hasChanged) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(String(answer ?? ''));
  };

  return (
    <Modal
      testID="profile-edit-modal"
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {question ? (
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FB']}
          style={styles.gradient}
          testID="profile-edit-modal-content"
        >
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View style={styles.header}>
                <Text
                  testID="profile-edit-modal-header-title"
                  style={styles.headerTitle}
                  numberOfLines={2}
                >
                  {question.questionText}
                </Text>
                <Pressable
                  testID="profile-edit-modal-close"
                  onPress={onClose}
                  style={styles.closeButton}
                  hitSlop={12}
                >
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.body}>
                <QuestionInput
                  question={question}
                  value={answer}
                  onChange={setAnswer}
                />
              </View>

              <View style={styles.footer}>
                <Pressable
                  testID="profile-edit-modal-save"
                  onPress={handleSave}
                  disabled={!hasChanged}
                  accessibilityState={{ disabled: !hasChanged }}
                  style={[
                    styles.saveButton,
                    !hasChanged && styles.saveButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      !hasChanged && styles.saveButtonTextDisabled,
                    ]}
                  >
                    Salvar
                  </Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray[200],
  },
  headerTitle: {
    flex: 1,
    fontFamily: typography.fontFamily.poppins.semibold,
    fontSize: typography.fontSize.lg,
    color: colors.neutral.black,
    marginRight: spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray[600],
    lineHeight: 20,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary.base,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.neutral.gray[300],
  },
  saveButtonText: {
    fontFamily: typography.fontFamily.poppins.semibold,
    fontSize: typography.fontSize.lg,
    color: colors.neutral.white,
  },
  saveButtonTextDisabled: {
    color: colors.neutral.gray[500],
  },
});
