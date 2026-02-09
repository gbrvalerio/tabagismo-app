/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react-native";
import OnboardingScreen from "./onboarding";

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

jest.mock("@/components/celebration/CelebrationDialog", () => {
  const React = require("react");
  const { TouchableOpacity, View, Text } = require("react-native");
  return {
    CelebrationDialog: ({ visible, onComplete }: any) => {
      if (!visible) return null;
      return React.createElement(
        TouchableOpacity,
        {
          testID: "celebration-dialog",
          onPress: onComplete,
        },
        React.createElement(Text, null, "Celebration")
      );
    },
  };
});

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

const mockUseQuestions = jest.fn();
const mockUseAnswers = jest.fn();
const mockUseSaveAnswer = jest.fn();
const mockUseDeleteDependentAnswers = jest.fn();
const mockUseCompleteOnboarding = jest.fn();
const mockUseUserCoins = jest.fn();
const mockUseAwardCoins = jest.fn();

jest.mock("@/db/repositories", () => ({
  useQuestions: (...args: any[]) => mockUseQuestions(...args),
  useAnswers: (...args: any[]) => mockUseAnswers(...args),
  useSaveAnswer: (...args: any[]) => mockUseSaveAnswer(...args),
  useDeleteDependentAnswers: (...args: any[]) =>
    mockUseDeleteDependentAnswers(...args),
  useCompleteOnboarding: () => mockUseCompleteOnboarding(),
  useUserCoins: () => mockUseUserCoins(),
  useUserCoinsFromTransactions: () => mockUseUserCoins(),
  useAwardCoins: () => mockUseAwardCoins(),
}));

const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();
const mockUseRouter = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => mockUseRouter(),
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

  mockUseRouter.mockReturnValue({
    replace: mockRouterReplace,
    push: mockRouterPush,
  });

  mockUseUserCoins.mockReturnValue({
    data: 0,
    isLoading: false,
    isSuccess: true,
  });
  mockUseAwardCoins.mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  });
  mockUseSaveAnswer.mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  });
  mockUseDeleteDependentAnswers.mockReturnValue({ mutateAsync: jest.fn() });
  mockUseCompleteOnboarding.mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  });
});

describe("OnboardingScreen", () => {
  it("should render loading state initially", () => {
    mockUseQuestions.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    mockUseAnswers.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<OnboardingScreen />);
    expect(screen.getByTestId("loading")).toBeDefined();
  });

  it("should render full screen", () => {
    mockUseQuestions.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    mockUseAnswers.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { toJSON } = render(<OnboardingScreen />);
    expect(toJSON()).not.toBeNull();
  });

  it("should render QuestionFlowContainer with onboarding context", async () => {
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

    render(<OnboardingScreen />);

    await waitFor(() => {
      expect(screen.getByText("Qual é o seu nome?")).toBeDefined();
    });

    expect(mockUseQuestions).toHaveBeenCalledWith("onboarding");
  });

  it("should render with coinRewardPerQuestion=1", async () => {
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

    render(<OnboardingScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("coin-counter")).toBeDefined();
    });
  });

  it("should complete onboarding and show celebration dialog", async () => {
    const mockCompleteMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseCompleteOnboarding.mockReturnValue({
      mutateAsync: mockCompleteMutateAsync,
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

    render(<OnboardingScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("")).toBeDefined();
    });

    const input = screen.getByDisplayValue("");
    fireEvent.changeText(input, "João");

    await waitFor(() => {
      expect(screen.getByText("✓ Concluir")).toBeDefined();
    });

    fireEvent.press(screen.getByText("✓ Concluir"));

    await waitFor(() => {
      expect(mockCompleteMutateAsync).toHaveBeenCalled();
      expect(screen.getByTestId("celebration-dialog")).toBeDefined();
    });
  });

  describe("Celebration Flow", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseRouter.mockReturnValue({
        replace: mockRouterReplace,
        push: mockRouterPush,
      });
    });

    it("should show celebration dialog after onboarding completion", async () => {
      const mockCompleteMutateAsync = jest.fn().mockResolvedValue(undefined);
      mockUseCompleteOnboarding.mockReturnValue({
        mutateAsync: mockCompleteMutateAsync,
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

      render(<OnboardingScreen />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("")).toBeDefined();
      });

      const input = screen.getByDisplayValue("");
      fireEvent.changeText(input, "João");

      await waitFor(() => {
        expect(screen.getByText("✓ Concluir")).toBeDefined();
      });

      fireEvent.press(screen.getByText("✓ Concluir"));

      await waitFor(() => {
        expect(mockCompleteMutateAsync).toHaveBeenCalled();
        expect(screen.getByTestId("celebration-dialog")).toBeDefined();
      });

      // Should NOT navigate yet
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it("should navigate to notification permission after celebration completes", async () => {
      const mockCompleteMutateAsync = jest.fn().mockResolvedValue(undefined);
      mockUseCompleteOnboarding.mockReturnValue({
        mutateAsync: mockCompleteMutateAsync,
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

      render(<OnboardingScreen />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("")).toBeDefined();
      });

      const input = screen.getByDisplayValue("");
      fireEvent.changeText(input, "João");

      await waitFor(() => {
        expect(screen.getByText("✓ Concluir")).toBeDefined();
      });

      fireEvent.press(screen.getByText("✓ Concluir"));

      await waitFor(() => {
        expect(screen.getByTestId("celebration-dialog")).toBeDefined();
      });

      // Simulate celebration completion
      const celebrationDialog = screen.getByTestId("celebration-dialog");
      fireEvent.press(celebrationDialog);

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith("/notification-permission");
      });
    });

    it("should hide celebration dialog after completion", async () => {
      const mockCompleteMutateAsync = jest.fn().mockResolvedValue(undefined);
      mockUseCompleteOnboarding.mockReturnValue({
        mutateAsync: mockCompleteMutateAsync,
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

      render(<OnboardingScreen />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("")).toBeDefined();
      });

      const input = screen.getByDisplayValue("");
      fireEvent.changeText(input, "João");

      await waitFor(() => {
        expect(screen.getByText("✓ Concluir")).toBeDefined();
      });

      fireEvent.press(screen.getByText("✓ Concluir"));

      await waitFor(() => {
        expect(screen.getByTestId("celebration-dialog")).toBeDefined();
      });

      // Complete celebration
      fireEvent.press(screen.getByTestId("celebration-dialog"));

      await waitFor(() => {
        expect(screen.queryByTestId("celebration-dialog")).toBeNull();
      });
    });
  });
});
