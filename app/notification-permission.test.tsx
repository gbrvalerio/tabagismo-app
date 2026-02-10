// Mock AppState listener
// Mock dependencies BEFORE imports
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { Linking, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import NotificationPermissionScreen from './notification-permission';
import { useHasNotificationReward, useAwardCoins } from '@/db/repositories';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let appStateListener: ((state: string) => void) | null = null;
const mockRemove = jest.fn();
const mockAddEventListener = jest.fn((_event: string, callback: (state: string) => void) => {
  appStateListener = callback;
  return { remove: mockRemove };
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return Object.defineProperty(RN, 'AppState', {
    get: () => ({
      addEventListener: mockAddEventListener,
    }),
  });
});

const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
}));
jest.mock('@/db/repositories', () => ({
  useHasNotificationReward: jest.fn(),
  useAwardCoins: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
}));
jest.mock('@/components/celebration', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text, TouchableOpacity } = require('react-native');
  const MockCelebrationDialog = ({ visible, title, onDismiss }: any) => {
    if (!visible) return null;
    return React.createElement(
      TouchableOpacity,
      { testID: 'celebration-dialog-overlay', onPress: onDismiss },
      React.createElement(Text, null, title)
    );
  };
  MockCelebrationDialog.displayName = 'MockCelebrationDialog';
  return {
    CelebrationDialog: MockCelebrationDialog,
  };
});
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Linking.openSettings after imports
jest.spyOn(Linking, 'openSettings').mockImplementation(jest.fn());

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

describe('NotificationPermissionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterReplace.mockClear();
    mockRouterPush.mockClear();
    appStateListener = null;
    (useHasNotificationReward as jest.Mock).mockReturnValue({ data: false });
  });

  describe('Permission Status: Undetermined', () => {
    it('should render "Permitir Notificações" button when status is undetermined', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Ative as Notificações')).toBeTruthy();
        expect(screen.getByText('Permitir Notificações')).toBeTruthy();
        expect(screen.getByText('Pular por Agora')).toBeTruthy();
      });
    });

    it('should call requestPermissionsAsync when "Permitir Notificações" is pressed', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Permitir Notificações'));

      fireEvent.press(getByText('Permitir Notificações'));

      await waitFor(() => {
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Permission Status: Denied', () => {
    it('should render "Abrir Configurações" button when status is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Abrir Configurações')).toBeTruthy();
        expect(screen.getByText('Você negou anteriormente. Ative nas configurações do app.')).toBeTruthy();
      });
    });

    it('should call Linking.openSettings when "Abrir Configurações" is pressed', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Abrir Configurações'));

      fireEvent.press(getByText('Abrir Configurações'));

      await waitFor(() => {
        expect(Linking.openSettings).toHaveBeenCalled();
      });
    });
  });

  describe('Permission Status: Granted', () => {
    it('should show celebration when granted and not rewarded', async () => {
      const mockAwardCoins = jest.fn().mockResolvedValue({});
      (useAwardCoins as jest.Mock).mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: false });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          expect(screen.getByTestId('celebration-dialog-overlay')).toBeTruthy();
        },
        { timeout: 2000 }
      );
    });

    it('should skip to tabs when granted and already rewarded', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: true });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockRouterReplace). toHaveBeenCalledWith('/(tabs)') ;
      });
    });
  });

  describe('Skip Flow', () => {
    it('should navigate to tabs when "Pular por Agora" is pressed', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Pular por Agora'));

      fireEvent.press(getByText('Pular por Agora'));

      await waitFor(() => {
        expect(mockRouterReplace). toHaveBeenCalledWith('/(tabs)') ;
      });
    });
  });

  describe('Coin Reward', () => {
    it('should award 15 coins when permission is granted and not rewarded', async () => {
      const mockAwardCoins = jest.fn().mockResolvedValue({});
      (useAwardCoins as jest.Mock).mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: false });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockAwardCoins).toHaveBeenCalledWith({
          amount: 15,
          type: 'notification_permission',
          metadata: expect.objectContaining({
            source: 'notification_permission',
          }),
        });
      });
    });

    it('should not award coins when already rewarded', async () => {
      const mockAwardCoins = jest.fn();
      (useAwardCoins as jest.Mock).mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: true });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockAwardCoins).not.toHaveBeenCalled();
      });
    });
  });

  describe('Infinite Loop Prevention', () => {
    it('should not retrigger checkPermission when hasReward changes after awarding coins', async () => {
      let rewardValue = false;
      const mockAwardCoins = jest.fn().mockImplementation(async () => {
        // Simulate TanStack Query invalidating cache after mutation
        rewardValue = true;
      });

      // Mock useHasNotificationReward to return dynamic value
      (useHasNotificationReward as jest.Mock).mockImplementation(() => ({
        data: rewardValue,
      }));

      (useAwardCoins as jest.Mock).mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      });

      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      // Wait for initial checkPermission call
      await waitFor(
        () => {
          expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );

      // Award coins happens, hasReward changes from false -> true
      await waitFor(() => {
        expect(mockAwardCoins).toHaveBeenCalledTimes(1);
      });

      // Wait a bit more to ensure no additional checkPermission calls
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Should still be called only once (from mount), not again after hasReward change
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('Celebration Dialog', () => {
    it('should navigate to tabs when celebration is dismissed', async () => {
      const mockAwardCoins = jest.fn().mockResolvedValue({});
      (useAwardCoins as jest.Mock).mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: false });

      const { getByTestId } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      // Wait for celebration to show
      await waitFor(() => {
        expect(getByTestId('celebration-dialog-overlay')).toBeTruthy();
      });

      // Dismiss celebration by tapping overlay (fires onDismiss)
      fireEvent.press(getByTestId('celebration-dialog-overlay'));

      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)');
      });
    });
  });

  describe('OS Settings Return Flow', () => {
    it('should show celebration and navigate when permission granted via OS settings', async () => {
      const mockAwardCoins = jest.fn().mockResolvedValue({});
      (useAwardCoins as jest.Mock).mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      });
      // Start with denied permission
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: false });

      const { getByTestId } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Abrir Configurações')).toBeTruthy();
      });

      // Simulate returning from OS settings with permission now granted
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      // Trigger AppState active (user returns from settings)
      if (appStateListener) {
        await appStateListener('active');
      }

      // Celebration should appear
      await waitFor(() => {
        expect(getByTestId('celebration-dialog-overlay')).toBeTruthy();
      });

      // Coins should be awarded
      expect(mockAwardCoins).toHaveBeenCalledWith({
        amount: 15,
        type: 'notification_permission',
        metadata: expect.objectContaining({
          source: 'notification_permission',
        }),
      });

      // Dismiss celebration
      fireEvent.press(getByTestId('celebration-dialog-overlay'));

      // Should navigate to tabs
      await waitFor(() => {
        expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should not award coins when returning from settings if already rewarded', async () => {
      const mockAwardCoins = jest.fn().mockResolvedValue({});
      (useAwardCoins as jest.Mock).mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: true });

      render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(screen.getByText('Abrir Configurações')).toBeTruthy();
      });

      // Simulate returning from OS settings with permission granted
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      if (appStateListener) {
        await appStateListener('active');
      }

      // Should not award coins since already rewarded
      await waitFor(() => {
        expect(mockAwardCoins).not.toHaveBeenCalled();
      });
    });
  });

  describe('Request Permission Flow', () => {
    it('should set denied status when permission request is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Permitir Notificações'));

      fireEvent.press(getByText('Permitir Notificações'));

      await waitFor(() => {
        expect(screen.getByText('Você negou anteriormente. Ative nas configurações do app.')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should log error when initial permission check fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission check failed')
      );

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[NotificationPermission]',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should show alert when permission request fails', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission request failed')
      );

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Permitir Notificações'));

      fireEvent.press(getByText('Permitir Notificações'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Erro',
          'Não foi possível solicitar permissão. Tente novamente.'
        );
      });

      alertSpy.mockRestore();
    });

    it('should show alert when opening settings fails', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (Linking.openSettings as jest.Mock).mockRejectedValue(
        new Error('Cannot open settings')
      );
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Abrir Configurações'));

      fireEvent.press(getByText('Abrir Configurações'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Erro',
          'Não foi possível abrir as configurações. Abra manualmente.'
        );
      });

      alertSpy.mockRestore();
    });
  });
});
