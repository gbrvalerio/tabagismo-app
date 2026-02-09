import {
  useCompleteOnboarding,
  useDeleteDependentAnswers,
  useAwardCoins,
  useOnboardingAnswers,
  useOnboardingQuestions,
  useSaveAnswer,
} from "@/db/repositories";
import { TransactionType , coinTransactions } from "@/db/schema";
import { computeApplicableQuestions } from "@/lib/question-flow";
import * as Haptics from "@/lib/haptics";
import { db } from "@/db/client";
import { eq, and, sql } from "drizzle-orm";
import { LinearGradient } from "expo-linear-gradient";
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
import Animated, {
  Easing,
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CoinCounter } from "./CoinCounter";
import { CoinTrail } from "./CoinTrail";
import { QuestionInput } from "./QuestionInput";
import { QuestionText } from "./QuestionText";

import { animations } from "@/lib/theme/animations";
import {
  colors,
  spacing,
  typography,
  typographyPresets,
} from "@/lib/theme/tokens";

export function OnboardingContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersCache, setAnswersCache] = useState<Record<string, unknown>>({});
  const [animatingCoinIndex, setAnimatingCoinIndex] = useState<number | null>(
    null,
  );

  const { data: allQuestions, isLoading: questionsLoading } =
    useOnboardingQuestions();
  const { data: existingAnswers, isLoading: answersLoading } =
    useOnboardingAnswers();
  const saveAnswerMutation = useSaveAnswer();
  const deleteDependentAnswersMutation = useDeleteDependentAnswers();
  const awardCoinsMutation = useAwardCoins();
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

  const checkQuestionReward = async (questionKey: string): Promise<boolean> => {
    const transaction = await db
      .select()
      .from(coinTransactions)
      .where(
        and(
          eq(coinTransactions.type, TransactionType.ONBOARDING_ANSWER),
          sql`json_extract(${coinTransactions.metadata}, '$.questionKey') = ${questionKey}`
        )
      )
      .get();
    return !!transaction;
  };

  const handleAnswer = async (questionKey: string, value: unknown) => {
    // Check if answer already exists
    const existingAnswer = existingAnswers?.find(
      (a) => a.questionKey === questionKey,
    );
    const isFirstTime = !existingAnswer;

    // Update cache immediately (optimistic)
    const newCache = { ...answersCache, [questionKey]: value };
    setAnswersCache(newCache);

    // Save to database with isFirstTime flag
    await saveAnswerMutation.mutateAsync({
      questionKey,
      answer: JSON.stringify(value),
      isFirstTime,
    });

    // Award coin based on transaction history
    const hasReward = await checkQuestionReward(questionKey);

    if (!hasReward) {
      await awardCoinsMutation.mutateAsync({
        amount: 1,
        type: TransactionType.ONBOARDING_ANSWER,
        metadata: { questionKey },
      });
      setAnimatingCoinIndex(currentIndex);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

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
    <LinearGradient
      colors={["#FFFFFF", "#F8F9FB"]}
      style={styles.gradient}
      testID="onboarding-gradient"
    >
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
            <View style={styles.headerRow}>
              <View
                style={currentIndex === 0 ? styles.backButtonHidden : undefined}
              >
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  testID="back-button"
                >
                  <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.spacer} />
              <CoinCounter testID="coin-counter" />
            </View>
            <CoinTrail
              testID="coin-trail"
              currentStep={currentIndex + 1}
              totalSteps={applicableQuestions.length}
              answeredQuestions={
                existingAnswers
                  ?.filter((a) => a.coinAwarded)
                  .map((a) => a.questionKey) ?? []
              }
              animatingCoinIndex={animatingCoinIndex}
              onCoinAnimationComplete={() => setAnimatingCoinIndex(null)}
            />
          </View>

          {/* Content + Footer - Footer overlays content */}
          <View style={styles.contentArea}>
            <View style={styles.content}>
              {currentQuestion && (
                <Animated.View
                  style={styles.cardWrapper}
                  layout={Layout.springify().damping(20).stiffness(120)}
                >
                  {/* Fixed question text */}
                  <View style={styles.questionHeader}>
                    <QuestionText text={currentQuestion.questionText} />
                  </View>

                  {/* Scrollable input area */}
                  <ScrollView
                    key={currentQuestion.key}
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
                      onChange={(value) =>
                        handleAnswer(currentQuestion.key, value)
                      }
                    />
                  </ScrollView>
                </Animated.View>
              )}
            </View>

            {/* Footer - Normal flow so it never covers content */}
            <View style={styles.footer} testID="onboarding-footer">
              {isAnswered && !isLastQuestion && (
                <Animated.View
                  entering={FadeInDown.springify().damping(12).stiffness(200)}
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
                  entering={FadeInDown.springify().damping(12).stiffness(200)}
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
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
  },
  backButtonHidden: {
    opacity: 0,
    pointerEvents: "none" as const,
  },
  backButtonText: {
    fontFamily: typographyPresets.subhead.fontFamily,
    fontSize: typography.fontSize.md,
    color: "#666666",
  },
  contentArea: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    paddingBottom: 88,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  nextButton: {
    width: "100%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary.base,
    borderRadius: 28,
    shadowColor: colors.primary.base,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  finishButton: {
    width: "100%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#10B981",
    borderRadius: 28,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    ...typographyPresets.button,
    color: "#FFFFFF",
  },
  finishButtonText: {
    ...typographyPresets.button,
    color: "#FFFFFF",
  },
});
