import {
  useDeleteDependentAnswers,
  useAwardCoins,
  useAnswers,
  useQuestions,
  useSaveAnswer,
} from "@/db/repositories";
import { TransactionType, coinTransactions } from "@/db/schema";
import { computeApplicableQuestions } from "@/lib/question-flow";
import * as Haptics from "@/lib/haptics";
import { db } from "@/db/client";
import { eq, and, sql } from "drizzle-orm";
import { deserializeAnswer, serializeAnswer, type AnswerValue } from "@/lib/answer-serialization";
import { LinearGradient } from "expo-linear-gradient";
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

export interface QuestionFlowProps {
  context: string;
  onComplete: (coinsEarned: number) => void;
  coinRewardPerQuestion?: number;
}

export function QuestionFlowContainer({
  context,
  onComplete,
  coinRewardPerQuestion = 0,
}: QuestionFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersCache, setAnswersCache] = useState<Record<string, unknown>>({});
  const [animatingCoinIndex, setAnimatingCoinIndex] = useState<number | null>(
    null
  );

  const { data: allQuestions, isLoading: questionsLoading } =
    useQuestions(context);
  const { data: existingAnswers, isLoading: answersLoading } =
    useAnswers(context);
  const saveAnswerMutation = useSaveAnswer(context);
  const deleteDependentAnswersMutation = useDeleteDependentAnswers(context);
  const awardCoinsMutation = useAwardCoins();

  const isLoading = questionsLoading || answersLoading;
  const initialLoadDone = useRef(false);

  const buttonShake = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!allQuestions || !existingAnswers) return;
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const cache = existingAnswers.reduce(
      (acc, answer) => {
        // Find the question to get its type
        const question = allQuestions.find((q) => q.key === answer.questionKey);
        if (question) {
          acc[answer.questionKey] = deserializeAnswer(
            answer.answer,
            question.type
          );
        } else {
          // Fallback for missing questions
          acc[answer.questionKey] = answer.answer;
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

    setAnswersCache(cache);

    const applicable = computeApplicableQuestions(allQuestions, cache);
    const firstUnanswered = applicable.findIndex((q) => !cache[q.key]);
    setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
  }, [allQuestions, existingAnswers]);

  const applicableQuestions = allQuestions
    ? computeApplicableQuestions(allQuestions, answersCache)
    : [];

  // Compute which indices have been answered
  const answeredIndices = applicableQuestions
    .map((q, index) => ({ key: q.key, index }))
    .filter(({ key }) => answersCache[key] !== undefined && answersCache[key] !== null && answersCache[key] !== "")
    .map(({ index }) => index);

  const currentQuestion = applicableQuestions[currentIndex];
  const currentAnswer = currentQuestion
    ? answersCache[currentQuestion.key]
    : null;
  const isAnswered =
    currentAnswer !== undefined &&
    currentAnswer !== null &&
    currentAnswer !== "";
  const isLastQuestion = currentIndex === applicableQuestions.length - 1;

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: buttonShake.value },
      { scale: buttonScale.value },
    ],
  }));

  useEffect(() => {
    if (isLoading) return;

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    buttonShake.value = 0;
    buttonScale.value = 1;

    if (isAnswered) {
      idleTimerRef.current = setTimeout(() => {
        buttonShake.value = withSequence(
          withTiming(6, { duration: 100, easing: Easing.inOut(Easing.ease) }),
          withTiming(-6, { duration: 100 }),
          withTiming(4, { duration: 100 }),
          withTiming(-4, { duration: 100 }),
          withTiming(0, { duration: 100 })
        );

        buttonScale.value = withSequence(
          withSpring(1.05, { damping: 8, stiffness: 200 }),
          withSpring(1, animations.gentleSpring)
        );
      }, 3000);
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isAnswered, currentIndex, isLoading]);

  const checkQuestionReward = async (
    questionKey: string
  ): Promise<boolean> => {
    const transaction = await db
      .select()
      .from(coinTransactions)
      .where(
        and(
          eq(coinTransactions.type, TransactionType.QUESTION_ANSWER),
          sql`json_extract(${coinTransactions.metadata}, '$.context') = ${context}`,
          sql`json_extract(${coinTransactions.metadata}, '$.questionKey') = ${questionKey}`
        )
      )
      .get();
    return !!transaction;
  };

  const handleAnswer = async (questionKey: string, value: unknown) => {
    const newCache = { ...answersCache, [questionKey]: value };
    setAnswersCache(newCache);

    // Find the question to get its type for proper serialization
    const question = allQuestions?.find((q) => q.key === questionKey);
    const serialized = question
      ? serializeAnswer(value as AnswerValue, question.type)
      : JSON.stringify(value);

    await saveAnswerMutation.mutateAsync({
      questionKey,
      answer: serialized,
    });

    if (coinRewardPerQuestion > 0) {
      const hasReward = await checkQuestionReward(questionKey);

      if (!hasReward) {
        await awardCoinsMutation.mutateAsync({
          amount: coinRewardPerQuestion,
          type: TransactionType.QUESTION_ANSWER,
          metadata: { context, questionKey },
        });
        setAnimatingCoinIndex(currentIndex);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    if (allQuestions) {
      const hasDependents = allQuestions.some(
        (q) => q.dependsOnQuestionKey === questionKey
      );
      if (hasDependents) {
        await deleteDependentAnswersMutation.mutateAsync({
          parentQuestionKey: questionKey,
        });

        const dependentQuestions = allQuestions.filter(
          (q) => q.dependsOnQuestionKey === questionKey
        );
        const minDependentOrder = Math.min(
          ...dependentQuestions.map((q) => q.order)
        );

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
    const totalCoinsEarned = answeredIndices.length * coinRewardPerQuestion;
    onComplete(totalCoinsEarned);
  };

  const handleNext = () => {
    if (currentIndex < applicableQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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
      testID="question-flow-gradient"
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
          <View style={styles.header} testID="question-flow-header">
            <View style={styles.headerRow}>
              <View
                style={
                  currentIndex === 0 ? styles.backButtonHidden : undefined
                }
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
              {coinRewardPerQuestion > 0 && (
                <CoinCounter testID="coin-counter" />
              )}
            </View>
            {coinRewardPerQuestion > 0 && (
              <CoinTrail
                testID="coin-trail"
                currentStep={currentIndex + 1}
                totalSteps={applicableQuestions.length}
                answeredIndices={answeredIndices}
                animatingCoinIndex={animatingCoinIndex}
                onCoinAnimationComplete={() => setAnimatingCoinIndex(null)}
              />
            )}
          </View>

          <View style={styles.contentArea}>
            <View style={styles.content}>
              {currentQuestion && (
                <Animated.View
                  style={styles.cardWrapper}
                  layout={Layout.springify().damping(20).stiffness(120)}
                >
                  <View style={styles.questionHeader}>
                    <QuestionText text={currentQuestion.questionText} />
                  </View>

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

            <View style={styles.footer} testID="question-flow-footer">
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
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
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
  spacer: { flex: 1 },
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
  contentArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "flex-start",
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
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 88 },
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
