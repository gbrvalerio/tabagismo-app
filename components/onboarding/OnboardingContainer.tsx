import {
  useCompleteOnboarding,
  useDeleteDependentAnswers,
  useOnboardingAnswers,
  useOnboardingQuestions,
  useSaveAnswer,
} from "@/db/repositories";
import {
  calculateProgress,
  computeApplicableQuestions,
} from "@/lib/onboarding-flow";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  FadeInDown,
  Layout,
} from "react-native-reanimated";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { QuestionInput } from "./QuestionInput";
import { QuestionText } from "./QuestionText";

import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme/tokens";
import { animations } from "@/lib/theme/animations";

export function OnboardingContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersCache, setAnswersCache] = useState<Record<string, unknown>>({});

  const { data: allQuestions, isLoading: questionsLoading } =
    useOnboardingQuestions();
  const { data: existingAnswers, isLoading: answersLoading } =
    useOnboardingAnswers();
  const saveAnswerMutation = useSaveAnswer();
  const deleteDependentAnswersMutation = useDeleteDependentAnswers();
  const completeOnboardingMutation = useCompleteOnboarding();
  const router = useRouter();

  const isLoading = questionsLoading || answersLoading;
  const initialLoadDone = useRef(false);

  // Animation values for button shake
  const buttonShake = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!allQuestions || !existingAnswers) return;
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    // Load existing answers into cache
    const cache = existingAnswers.reduce(
      (acc, answer) => {
        try {
          acc[answer.questionKey] = JSON.parse(answer.answer);
        } catch {
          acc[answer.questionKey] = answer.answer;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );

    setAnswersCache(cache);

    // Find first unanswered question
    const applicable = computeApplicableQuestions(allQuestions, cache);
    const firstUnanswered = applicable.findIndex((q) => !cache[q.key]);
    setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
  }, [allQuestions, existingAnswers]);

  // Derive applicable questions from current state — not stored in a separate useState
  const applicableQuestions = allQuestions
    ? computeApplicableQuestions(allQuestions, answersCache)
    : [];

  // Compute derived values before any early returns
  const currentQuestion = applicableQuestions[currentIndex];
  const currentAnswer = currentQuestion
    ? answersCache[currentQuestion.key]
    : null;
  const isAnswered =
    currentAnswer !== undefined &&
    currentAnswer !== null &&
    currentAnswer !== "";
  const isLastQuestion = currentIndex === applicableQuestions.length - 1;
  const progress = calculateProgress(
    currentIndex + 1,
    applicableQuestions.length,
  );

  // Animated style for buttons (must be declared before early return)
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: buttonShake.value },
      { scale: buttonScale.value },
    ],
  }));

  // Start idle timer when question is answered (must be before early return)
  useEffect(() => {
    // Don't run if still loading
    if (isLoading) return;

    // Clear any existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    // Reset animations
    buttonShake.value = 0;
    buttonScale.value = 1;

    // Only start timer if question is answered
    if (isAnswered) {
      idleTimerRef.current = setTimeout(() => {
        // Shake animation: gentle horizontal wiggle
        buttonShake.value = withSequence(
          withTiming(6, { duration: 100, easing: Easing.inOut(Easing.ease) }),
          withTiming(-6, { duration: 100 }),
          withTiming(4, { duration: 100 }),
          withTiming(-4, { duration: 100 }),
          withTiming(0, { duration: 100 }),
        );

        // Pulse animation: subtle scale
        buttonScale.value = withSequence(
          withSpring(1.05, { damping: 8, stiffness: 200 }),
          withSpring(1, animations.gentleSpring),
        );
      }, 3000); // After 3 seconds of idle
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswered, currentIndex, isLoading]);

  const handleAnswer = async (questionKey: string, value: unknown) => {
    // Update cache immediately (optimistic)
    const newCache = { ...answersCache, [questionKey]: value };
    setAnswersCache(newCache);

    // Save to database
    await saveAnswerMutation.mutateAsync({
      questionKey,
      answer: JSON.stringify(value),
    });

    // Delete dependent answers if this question has dependents
    if (allQuestions) {
      const hasDependents = allQuestions.some(
        (q) => q.dependsOnQuestionKey === questionKey,
      );
      if (hasDependents) {
        await deleteDependentAnswersMutation.mutateAsync({
          parentQuestionKey: questionKey,
        });

        // Remove dependent answers and all answers for questions that come after
        const dependentQuestions = allQuestions.filter(
          (q) => q.dependsOnQuestionKey === questionKey,
        );
        const minDependentOrder = Math.min(
          ...dependentQuestions.map((q) => q.order),
        );

        // Clear all answers from the minimum dependent order onwards
        for (const q of allQuestions) {
          if (q.order >= minDependentOrder && q.key !== questionKey) {
            delete newCache[q.key];
          }
        }

        setAnswersCache({ ...newCache });
      }
    }
  };

  const handleFinish = async () => {
    await completeOnboardingMutation.mutateAsync();
    router.replace("/(tabs)/" as any);
  };

  const handleNext = () => {
    if (currentIndex < applicableQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Reset idle timer when navigating
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="loading">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
      testID="safe-area-container"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        testID="keyboard-avoiding-view"
      >
        {/* Header - Fixed at top */}
        <View style={styles.header} testID="onboarding-header">
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
          )}
          <ProgressBar
            progress={progress}
            currentStep={currentIndex + 1}
            totalSteps={applicableQuestions.length}
          />
        </View>

        {/* Content - Scrollable middle section */}
        <View style={styles.content}>
          {currentQuestion && (
            <Animated.View style={styles.cardWrapper} layout={Layout.springify().damping(20).stiffness(120)}>
              <QuestionCard questionKey={currentQuestion.key}>
                  {/* Fixed question text */}
                  <View style={styles.questionHeader}>
                    <QuestionText text={currentQuestion.questionText} />
                  </View>

                  {/* Scrollable input area */}
                  <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    testID="content-scroll-view"
                  >
                    <QuestionInput
                      question={currentQuestion}
                      value={
                        (answersCache[currentQuestion.key] as
                          | string
                          | number
                          | string[]
                          | undefined) ?? null
                      }
                      onChange={(value) => handleAnswer(currentQuestion.key, value)}
                    />
                  </ScrollView>
                </QuestionCard>
            </Animated.View>
          )}
        </View>

        {/* Footer - Fixed at bottom */}
        <View style={styles.footer} testID="onboarding-footer">
          {isAnswered && !isLastQuestion && (
            <Animated.View
              entering={FadeInDown.springify().damping(18).stiffness(140)}
              key={`next-${currentQuestion?.key}`}
            >
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                  onPress={handleNext}
                  activeOpacity={0.7}
                  style={styles.nextButton}
                >
                  <Text style={styles.buttonText}>Próxima →</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          )}
          {isAnswered && isLastQuestion && (
            <Animated.View
              entering={FadeInDown.springify().damping(18).stiffness(140)}
              key={`finish-${currentQuestion?.key}`}
            >
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                  onPress={handleFinish}
                  activeOpacity={0.7}
                  style={styles.finishButton}
                >
                  <Text style={styles.finishButtonText}>✓ Concluir</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.gray[600],
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0, // Starts from 0, grows within available space only
    paddingHorizontal: spacing.md,
    justifyContent: "flex-start",
    minHeight: 0,
  },
  cardWrapper: {
    // Card sizes to content, Layout animation handles smooth transitions
    flex: 1, // Takes available space from content area
    minHeight: 0, // Enables proper flexbox shrinking
  },
  questionHeader: {
    marginBottom: spacing.sm,
    flexShrink: 0, // Don't shrink the question text
  },
  scrollView: {
    flex: 1, // Takes available space in card
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  nextButton: {
    width: "100%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary.base,
    borderRadius: borderRadius.full,
    alignItems: "center",
    ...shadows.md,
  },
  finishButton: {
    width: "100%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.semantic.success,
    borderRadius: borderRadius.full,
    alignItems: "center",
    ...shadows.md,
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  finishButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
});
