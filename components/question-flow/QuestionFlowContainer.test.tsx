/* eslint-disable @typescript-eslint/no-require-imports */
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { QuestionFlowContainer } from "./QuestionFlowContainer";

jest.mock("@/assets/images/coin.svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockCoinIcon = (props: any) =>
    React.createElement(View, {
      ...props,
      testID: props.testID || "coin-icon",
    });
  MockCoinIcon.displayName = "MockCoinIcon";
  return MockCoinIcon;
});

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: {
    Light: "Light",
    Medium: "Medium",
    Heavy: "Heavy",
  },
  NotificationFeedbackType: {
    Success: "Success",
    Warning: "Warning",
    Error: "Error",
  },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

const mockQuestions = [
  {
    id: 1,
    key: "name",
    order: 1,
    type: "TEXT",
    category: "PROFILE",
    context: "onboarding",
    questionText: "Qual é o seu nome?",
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: {},
    createdAt: new Date(),
  },
];

const mockTwoQuestions = [
  {
    id: 1,
    key: "q1",
    order: 1,
    type: "TEXT",
    category: "PROFILE",
    context: "onboarding",
    questionText: "First?",
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: {},
    createdAt: new Date(),
  },
  {
    id: 2,
    key: "q2",
    order: 2,
    type: "TEXT",
    category: "PROFILE",
    context: "onboarding",
    questionText: "Second?",
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: {},
    createdAt: new Date(),
  },
];

const mockDailyQuestions = [
  {
    id: 1,
    key: "mood",
    order: 1,
    type: "TEXT",
    category: "PROFILE",
    context: "daily_checkin",
    questionText: "Como você está?",
    required: true,
    dependsOnQuestionKey: null,
    dependsOnValue: null,
    metadata: {},
    createdAt: new Date(),
  },
];

const mockUseQuestions = jest.fn();
const mockUseAnswers = jest.fn();
const mockUseSaveAnswer = jest.fn();
const mockUseDeleteDependentAnswers = jest.fn();
const mockUseUserCoins = jest.fn();
const mockUseAwardCoins = jest.fn();

jest.mock("@/db/repositories", () => ({
  useQuestions: (...args: any[]) => mockUseQuestions(...args),
  useAnswers: (...args: any[]) => mockUseAnswers(...args),
  useSaveAnswer: (...args: any[]) => mockUseSaveAnswer(...args),
  useDeleteDependentAnswers: (...args: any[]) =>
    mockUseDeleteDependentAnswers(...args),
  useUserCoins: () => mockUseUserCoins(),
  useUserCoinsFromTransactions: () => mockUseUserCoins(),
  useAwardCoins: () => mockUseAwardCoins(),
}));

jest.mock("@/db/client", () => ({
  db: {
    select: jest.fn(),
  },
}));

jest.mock("@/db/schema", () => ({
  coinTransactions: {
    type: "text",
    metadata: "metadata",
  },
  TransactionType: {
    QUESTION_ANSWER: "question_answer",
    ONBOARDING_ANSWER: "onboarding_answer",
    DAILY_REWARD: "daily_reward",
    PURCHASE: "purchase",
    BONUS: "bonus",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
  and: jest.fn(),
  sql: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();

  const mockDb = require("@/db/client").db;
  mockDb.select = jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(null),
      }),
    }),
  });

  mockUseUserCoins.mockReturnValue({
    data: 0,
    isLoading: false,
    isSuccess: true,
  });
  mockUseAwardCoins.mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  });
});

describe("QuestionFlowContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it("should render questions for specified context", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText("Qual é o seu nome?")).toBeDefined();
    });
  });

  it("should pass context to useQuestions and useAnswers hooks", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockDailyQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer context="daily_checkin" onComplete={jest.fn()} />
    );

    expect(mockUseQuestions).toHaveBeenCalledWith("daily_checkin");
    expect(mockUseAnswers).toHaveBeenCalledWith("daily_checkin");
  });

  it("should render loading state initially", () => {
    mockUseQuestions.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });
    mockUseAnswers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );
    expect(screen.getByTestId("loading")).toBeDefined();
  });
});

describe("QuestionFlowContainer - Coin Rewards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(undefined),
    });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it("should render coin counter when coinRewardPerQuestion > 0", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer
        context="onboarding"
        coinRewardPerQuestion={1}
        onComplete={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("coin-counter")).toBeDefined();
    });
  });

  it("should not render coin counter when coinRewardPerQuestion = 0", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockDailyQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer
        context="daily_checkin"
        coinRewardPerQuestion={0}
        onComplete={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.queryByTestId("coin-counter")).toBeNull();
    });
  });

  it("should not render coin counter by default (coinRewardPerQuestion defaults to 0)", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.queryByTestId("coin-counter")).toBeNull();
    });
  });

  it("should award coins when coinRewardPerQuestion > 0 and question answered", async () => {
    const mockAwardMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAwardCoins.mockReturnValue({
      mutateAsync: mockAwardMutateAsync,
    });
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer
        context="onboarding"
        coinRewardPerQuestion={1}
        onComplete={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("")).toBeDefined();
    });

    const input = screen.getByDisplayValue("");
    fireEvent.changeText(input, "John");

    await waitFor(() => {
      expect(mockAwardMutateAsync).toHaveBeenCalledWith({
        amount: 1,
        type: "question_answer",
        metadata: { context: "onboarding", questionKey: "name" },
      });
    });
  });

  it("should not award coins when coinRewardPerQuestion = 0", async () => {
    const mockAwardMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAwardCoins.mockReturnValue({
      mutateAsync: mockAwardMutateAsync,
    });
    mockUseQuestions.mockReturnValue({
      data: mockDailyQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer
        context="daily_checkin"
        coinRewardPerQuestion={0}
        onComplete={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("")).toBeDefined();
    });

    const input = screen.getByDisplayValue("");
    fireEvent.changeText(input, "Good");

    await waitFor(() => {
      expect(
        mockUseSaveAnswer().mutateAsync
      ).toHaveBeenCalled();
    });

    expect(mockAwardMutateAsync).not.toHaveBeenCalled();
  });

  it("should not render coin trail when coinRewardPerQuestion = 0", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockDailyQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer
        context="daily_checkin"
        coinRewardPerQuestion={0}
        onComplete={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.queryByTestId("coin-trail")).toBeNull();
    });
  });

  it("should render coin trail when coinRewardPerQuestion > 0", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer
        context="onboarding"
        coinRewardPerQuestion={1}
        onComplete={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("coin-trail")).toBeDefined();
    });
  });
});

describe("QuestionFlowContainer - Completion", () => {
  const mockSaveMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: mockSaveMutateAsync });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it("should call onComplete when all questions answered and finish pressed", async () => {
    mockUseQuestions.mockReturnValue({
      data: [mockQuestions[0]],
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    const onComplete = jest.fn();

    render(
      <QuestionFlowContainer context="onboarding" onComplete={onComplete} />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("")).toBeDefined();
    });

    const input = screen.getByDisplayValue("");
    fireEvent.changeText(input, "John");

    await waitFor(() => {
      expect(screen.getByText("✓ Concluir")).toBeDefined();
    });

    fireEvent.press(screen.getByText("✓ Concluir"));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it("should not navigate to tabs on complete (delegated to parent)", async () => {
    mockUseQuestions.mockReturnValue({
      data: [mockQuestions[0]],
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    const onComplete = jest.fn();

    render(
      <QuestionFlowContainer context="onboarding" onComplete={onComplete} />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("")).toBeDefined();
    });

    const input = screen.getByDisplayValue("");
    fireEvent.changeText(input, "John");

    await waitFor(() => {
      expect(screen.getByText("✓ Concluir")).toBeDefined();
    });

    fireEvent.press(screen.getByText("✓ Concluir"));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});

describe("QuestionFlowContainer - Navigation", () => {
  const mockSaveMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: mockSaveMutateAsync });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it("should show next button when question is answered", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText("First?")).toBeDefined();
    });

    const input = screen.getByDisplayValue("");
    fireEvent.changeText(input, "Answer");

    await waitFor(() => {
      expect(screen.getByText("Próxima →")).toBeDefined();
    });
  });

  it("should advance to next question when next is pressed", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText("First?")).toBeDefined();
    });

    const input = screen.getByDisplayValue("");
    fireEvent.changeText(input, "Answer");

    await waitFor(() => {
      expect(screen.getByText("Próxima →")).toBeDefined();
    });

    fireEvent.press(screen.getByText("Próxima →"));

    await waitFor(() => {
      expect(screen.getByText("Second?")).toBeDefined();
    });
  });

  it("should go back when back button is pressed", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [{ questionKey: "q1", answer: JSON.stringify("Answer") }],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText("Second?")).toBeDefined();
    });

    fireEvent.press(screen.getByText("← Voltar"));

    await waitFor(() => {
      expect(screen.getByText("First?")).toBeDefined();
    });
  });

  it("should hide back button on first question", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      const backButton = screen.getByTestId("back-button");
      let node = backButton.parent;
      let foundOpacity = false;
      while (node) {
        const style = node.props?.style;
        const flatStyle = Array.isArray(style)
          ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
          : style;
        if (flatStyle?.opacity === 0) {
          foundOpacity = true;
          break;
        }
        node = node.parent;
      }
      expect(foundOpacity).toBe(true);
    });
  });
});

describe("QuestionFlowContainer - Answer Handling", () => {
  const mockSaveMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: mockSaveMutateAsync });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it("should save answer when input changes", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("")).toBeDefined();
    });

    const input = screen.getByDisplayValue("");
    fireEvent.changeText(input, "João");

    await waitFor(() => {
      expect(mockSaveMutateAsync).toHaveBeenCalledWith({
        questionKey: "name",
        answer: JSON.stringify("João"),
      });
    });
  });
});

describe("QuestionFlowContainer - Layout Structure", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSaveAnswer.mockReturnValue({ mutateAsync: jest.fn() });
    mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  });

  it("should render SafeAreaView wrapper", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("safe-area-container")).toBeDefined();
    });
  });

  it("should render KeyboardAvoidingView", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("keyboard-avoiding-view")).toBeDefined();
    });
  });

  it("should render header", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("question-flow-header")).toBeDefined();
    });
  });

  it("should render footer", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseAnswers.mockReturnValue({
      data: [
        {
          id: 1,
          userId: 1,
          questionKey: "name",
          answer: '"John"',
          createdAt: new Date(),
        },
      ],
      isLoading: false,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("question-flow-footer")).toBeDefined();
    });
  });

  it("should render scrollable content area", async () => {
    mockUseQuestions.mockReturnValue({
      data: mockQuestions,
      isLoading: false,
    });
    mockUseAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <QuestionFlowContainer context="onboarding" onComplete={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId("content-scroll-view")).toBeDefined();
    });
  });
});
