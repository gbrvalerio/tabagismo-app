interface QuestionLike {
  key: string;
  order: number;
  dependsOnQuestionKey: string | null;
  dependsOnValue: string | null;
}

export function computeApplicableQuestions<T extends QuestionLike>(
  allQuestions: T[],
  answers: Record<string, unknown>
): T[] {
  return [...allQuestions]
    .sort((a, b) => a.order - b.order)
    .filter(question => {
      // No dependency = always show
      if (!question.dependsOnQuestionKey) return true;

      // Has dependency = check if parent answer matches
      const parentAnswer = answers[question.dependsOnQuestionKey];
      return parentAnswer === question.dependsOnValue;
    });
}

export function calculateProgress(answeredCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((answeredCount / totalCount) * 100);
}
