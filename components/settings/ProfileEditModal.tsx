import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { Question } from '@/db/schema/questions';
import { QuestionInput } from '@/components/question-flow/QuestionInput';
import { QuestionText } from '@/components/question-flow/QuestionText';
import * as Haptics from '@/lib/haptics';
import { colors, spacing, typography, borderRadius, typographyPresets } from '@/lib/theme/tokens';
import { deserializeAnswer, serializeAnswer, areAnswersEqual } from '@/lib/answer-serialization';

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
    if (visible && question) {
      // Deserialize answer based on question type
      const deserialized = deserializeAnswer(currentAnswer, question.type);
      setAnswer(deserialized);
    }
  }, [visible, currentAnswer, question]);

  // Compare using type-aware equality check
  const hasChanged = question
    ? !areAnswersEqual(answer, currentAnswer, question.type)
    : false;

  const handleSave = () => {
    if (!hasChanged || !question) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Serialize answer based on question type
    const serialized = serializeAnswer(answer, question.type);
    onSave(serialized);
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
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View style={styles.header}>
                <View style={styles.headerRow}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.backButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    testID="profile-edit-modal-close"
                  >
                    <Text style={styles.backButtonText}>← Voltar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.contentArea}>
                <View style={styles.content}>
                  <View style={styles.cardWrapper}>
                    <View style={styles.questionHeader}>
                      <QuestionText text={question.questionText} />
                    </View>

                    <ScrollView
                      style={styles.scrollView}
                      contentContainerStyle={styles.scrollContent}
                      showsVerticalScrollIndicator={false}
                      testID="profile-edit-scroll-view"
                    >
                      <QuestionInput
                        question={question}
                        value={answer}
                        onChange={setAnswer}
                      />
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.footer}>
                  {hasChanged && (
                    <TouchableOpacity
                      onPress={handleSave}
                      activeOpacity={0.7}
                      style={styles.saveButton}
                      testID="profile-edit-modal-save"
                    >
                      <Text style={styles.buttonText}>✓ Salvar</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  backButtonText: {
    fontFamily: typographyPresets.subhead.fontFamily,
    fontSize: typography.fontSize.md,
    color: '#666666',
  },
  contentArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'flex-start',
    minHeight: 0,
  },
  cardWrapper: {
    flex: 1,
    minHeight: 0,
  },
  questionHeader: {
    marginBottom: spacing.sm,
    flexShrink: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 88,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButton: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 28,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    ...typographyPresets.button,
    color: '#FFFFFF',
  },
});
