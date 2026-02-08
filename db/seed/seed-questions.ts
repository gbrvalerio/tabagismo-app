import { db } from "../client";
import { questions } from "../schema";
import type { NewQuestion } from "../schema/questions";
import { QuestionCategory, QuestionType } from "../schema/questions";

export const onboardingQuestionsData: NewQuestion[] = [
  {
    key: "name",
    order: 1,
    type: QuestionType.TEXT,
    category: QuestionCategory.PROFILE,
    questionText: "Qual é o seu nome?",
    required: true,
    metadata: {},
  },
  {
    key: "gender",
    order: 2,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.PROFILE,
    questionText: "Qual é o seu gênero?",
    required: true,
    metadata: { choices: ["Masculino", "Feminino", "Outro"] },
  },
  {
    key: "age",
    order: 3,
    type: QuestionType.NUMBER,
    category: QuestionCategory.PROFILE,
    questionText: "Qual é a sua idade?",
    required: true,
    metadata: {},
  },
  {
    key: "addiction_type",
    order: 4,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.ADDICTION,
    questionText: "Qual é o seu vício?",
    required: true,
    metadata: { choices: ["Cigarro/Tabaco", "Pod/Vape"] },
  },
  {
    key: "cigarettes_per_day",
    order: 5,
    type: QuestionType.NUMBER,
    category: QuestionCategory.HABITS,
    questionText: "Quantos cigarros você fuma por dia?",
    required: true,
    dependsOnQuestionKey: "addiction_type",
    dependsOnValue: "Cigarro/Tabaco",
    metadata: {},
  },
  {
    key: "pod_duration_days",
    order: 6,
    type: QuestionType.NUMBER,
    category: QuestionCategory.HABITS,
    questionText: "Quantos dias dura um pod?",
    required: true,
    dependsOnQuestionKey: "addiction_type",
    dependsOnValue: "Pod/Vape",
    metadata: {},
  },
  {
    key: "years_smoking",
    order: 7,
    type: QuestionType.NUMBER,
    category: QuestionCategory.HABITS,
    questionText: "Há quantos anos você fuma?",
    required: true,
    metadata: {},
  },
  {
    key: "quit_attempts",
    order: 8,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.MOTIVATION,
    questionText: "Quantas vezes você já tentou parar?",
    required: true,
    metadata: {
      choices: ["1 vez", "2 vezes", "3 vezes", "4 vezes", "5+ vezes"],
    },
  },
  {
    key: "stop_smoking_date",
    order: 9,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.MOTIVATION,
    questionText: "Quando você deseja parar de fumar?",
    required: true,
    metadata: {
      choices: [
        "Em até 2 semanas",
        "Em até 1 mês",
        "Em até 3 meses",
        "Em até 1 ano",
        "Ainda não sei",
      ],
    },
  },
  {
    key: "goals",
    order: 10,
    type: QuestionType.MULTIPLE_CHOICE,
    category: QuestionCategory.GOALS,
    questionText: "O que te motiva a parar de fumar?",
    required: true,
    metadata: {
      choices: [
        "Melhorar saúde",
        "Economizar dinheiro",
        "Dar exemplo",
        "Ter mais energia",
        "Melhorar a aparência",
        "Outro",
      ],
    },
  },
  {
    key: "main_fears_and_concerns",
    order: 11,
    type: QuestionType.MULTIPLE_CHOICE,
    category: QuestionCategory.GOALS,
    questionText:
      "Quais são seus principais medos e preocupações ao tentar parar de fumar?",
    required: true,
    metadata: {
      choices: [
        "Ganho de peso",
        "Ânsias muito fortes",
        "Ficar estressado",
        "Ficar deprimido",
        "Perder o foco",
        "Sintomas de abstinência",
        "Ficar de fora de momentos sociais",
        "Fracassar",
      ],
    },
  },
];

export async function seedOnboardingQuestions() {
  await db.delete(questions).execute();
  await db.insert(questions).values(onboardingQuestionsData);
  console.log(`[SEED] Inserted ${onboardingQuestionsData.length} questions`);
}
