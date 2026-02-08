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
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.PROFILE,
    questionText: "Qual é a sua idade?",
    required: true,
    metadata: { choices: ["12-17", "18-24", "25-44", "45-64", "65+"] },
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
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.HABITS,
    questionText: "Quantos cigarros você fuma por dia?",
    required: true,
    dependsOnQuestionKey: "addiction_type",
    dependsOnValue: "Cigarro/Tabaco",
    metadata: {
      choices: [
        "1-10 cigarros",
        "11-20 cigarros",
        "21-40 cigarros",
        "40+ cigarros",
      ],
    },
  },
  {
    key: "cigarretes_cost",
    order: 6,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.HABITS,
    questionText: "Quanto você gasta em média por carteira de cigarros?",
    required: true,
    dependsOnQuestionKey: "addiction_type",
    dependsOnValue: "Cigarro/Tabaco",
    metadata: {
      choices: ["até R$10", "R$11-R$20", "R$21-R$40", "R$40+"],
    },
  },
  {
    key: "pod_duration_days",
    order: 7,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.HABITS,
    questionText: "Quantos dias dura um pod?",
    required: true,
    dependsOnQuestionKey: "addiction_type",
    dependsOnValue: "Pod/Vape",
    metadata: {
      choices: ["1-7 dias", "8-14 dias", "15-30 dias", "30+ dias"],
    },
  },
  {
    key: "pod_cost",
    order: 8,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.HABITS,
    questionText: "Quanto você gasta em média por pod?",
    required: true,
    dependsOnQuestionKey: "addiction_type",
    dependsOnValue: "Pod/Vape",
    metadata: {
      choices: ["até R$50", "R$51-R$100", "R$100+"],
    },
  },
  {
    key: "years_smoking",
    order: 9,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.HABITS,
    questionText: "Há quantos anos você fuma?",
    required: true,
    metadata: {
      choices: [
        "Menos de 1 ano",
        "1-5 anos",
        "6-10 anos",
        "11-20 anos",
        "20+ anos",
      ],
    },
  },
  {
    key: "quit_attempts",
    order: 10,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.MOTIVATION,
    questionText: "Quantas vezes você já tentou parar?",
    required: true,
    metadata: {
      choices: ["Nunca tentei", "1 vez", "2-5 vezes", "Já perdi a conta"],
    },
  },
  {
    key: "stop_smoking_date",
    order: 11,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.MOTIVATION,
    questionText: "Em quanto tempo você quer parar de fumar?",
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
    order: 12,
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
    order: 13,
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
  {
    key: "religion",
    order: 14,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.PROFILE,
    questionText: "Qual é a sua crença ou espiritualidade?",
    required: true,
    metadata: {
      choices: [
        "Católica",
        "Evangélica",
        "Protestante",
        "Adventista",
        "Cristã",
        "Não tenho crença",
        "Espírita",
        "Umbanda",
        "Candomblé",
        "Afro-brasileira",
        "Hindu",
        "Outro",
      ],
    },
  },
];

export async function seedOnboardingQuestions() {
  await db.delete(questions).execute();
  await db.insert(questions).values(onboardingQuestionsData);
  console.log(`[SEED] Inserted ${onboardingQuestionsData.length} questions`);
}
