import { render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";

import { NotificationPermissionListener } from "./NotificationPermissionListener";
import * as repositories from "@/db/repositories";
import { TransactionType } from "@/db/schema/coin-transactions";

// Mock AppState listener
let appStateListener: ((state: string) => void) | null = null;
const mockRemove = jest.fn();
const mockAddEventListener = jest.fn((event, callback) => {
  appStateListener = callback;
  return { remove: mockRemove };
});

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
}));

// Mock expo-router
const mockUsePathname = jest.fn(() => '/some-other-screen');
jest.mock("expo-router", () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock repositories
jest.mock("@/db/repositories", () => ({
  useHasNotificationReward: jest.fn(),
  useAwardCoins: jest.fn(),
}));

// Mock AppState
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return Object.defineProperty(RN, "AppState", {
    get: () => ({
      addEventListener: mockAddEventListener,
    }),
  });
});

describe("NotificationPermissionListener", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    jest.clearAllMocks();
    appStateListener = null;
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <NotificationPermissionListener />
      </QueryClientProvider>
    );

  it("should render without crashing", () => {
    (repositories.useHasNotificationReward as jest.Mock).mockReturnValue({
      data: false,
    });
    (repositories.useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "undetermined",
    });

    expect(() => renderComponent()).not.toThrow();
  });

  it("should initialize permission status on mount", async () => {
    (repositories.useHasNotificationReward as jest.Mock).mockReturnValue({
      data: false,
    });
    (repositories.useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    renderComponent();

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    });
  });

  it("should register AppState listener on mount", () => {
    (repositories.useHasNotificationReward as jest.Mock).mockReturnValue({
      data: false,
    });
    (repositories.useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "undetermined",
    });

    renderComponent();

    expect(mockAddEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("should not show celebration dialog initially", () => {
    (repositories.useHasNotificationReward as jest.Mock).mockReturnValue({
      data: false,
    });
    (repositories.useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "undetermined",
    });

    const { queryByText } = renderComponent();

    expect(queryByText("Notificações Ativadas!")).toBeNull();
  });

  it("should award coins when permission changes from denied to granted", async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    (repositories.useHasNotificationReward as jest.Mock).mockReturnValue({
      data: false,
    });
    (repositories.useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    // Start with denied
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    renderComponent();

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    // Simulate permission change to granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });

    // Trigger app becoming active
    if (appStateListener) {
      await appStateListener("active");
    }

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        amount: 15,
        type: TransactionType.NOTIFICATION_PERMISSION,
        metadata: {
          source: "settings_activation",
          detectedAt: expect.any(String),
        },
      });
    });
  });

  it("should not award coins if already rewarded", async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    (repositories.useHasNotificationReward as jest.Mock).mockReturnValue({
      data: true, // Already rewarded
    });
    (repositories.useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    renderComponent();

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    // Change to granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });

    if (appStateListener) {
      await appStateListener("active");
    }

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(2);
    });

    // Should not award coins
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("should not award coins if permission was already granted", async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    (repositories.useHasNotificationReward as jest.Mock).mockReturnValue({
      data: false,
    });
    (repositories.useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    // Start with granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });

    renderComponent();

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    // Trigger app becoming active (permission still granted)
    if (appStateListener) {
      await appStateListener("active");
    }

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(2);
    });

    // Should not award coins (no change from granted to granted)
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("should skip handling when on notification-permission screen", async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    (repositories.useHasNotificationReward as jest.Mock).mockReturnValue({
      data: false,
    });
    (repositories.useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    // Start with denied
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    // Simulate being on the notification-permission screen
    mockUsePathname.mockReturnValue('/notification-permission');

    renderComponent();

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    // Change to granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });

    if (appStateListener) {
      await appStateListener("active");
    }

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(2);
    });

    // Should NOT award coins — the notification-permission screen handles this
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("should handle errors gracefully when getting permissions", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (repositories.useHasNotificationReward as jest.Mock).mockReturnValue({
      data: false,
    });
    (repositories.useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValue(
      new Error("Permission error")
    );

    renderComponent();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to get initial permission status:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
