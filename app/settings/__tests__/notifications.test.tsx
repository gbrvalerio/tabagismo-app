/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react-native';
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock AppState listener
let appStateListener: ((state: string) => void) | null = null;
const mockRemove = jest.fn();
const mockAddEventListener = jest.fn(
  (_event: string, callback: (state: string) => void) => {
    appStateListener = callback;
    return { remove: mockRemove };
  }
);

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return Object.defineProperty(RN, 'AppState', {
    get: () => ({
      addEventListener: mockAddEventListener,
    }),
  });
});

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Stack: {
      Screen: jest.fn((_props: any) => null),
    },
  };
});

const mockImpactAsync = jest.fn();
jest.mock('@/lib/haptics', () => ({
  impactAsync: (...args: any[]) => mockImpactAsync(...args),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.spyOn(Linking, 'openSettings').mockImplementation(jest.fn());

import NotificationsScreen from '../notifications';

describe('NotificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appStateListener = null;
  });

  describe('Rendering', () => {
    it('renders the toggle row with bell icon and title', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        expect(screen.getByText('🔔')).toBeTruthy();
        expect(screen.getByText('Notificações')).toBeTruthy();
      });
    });

    it('renders the benefits info card with all three items', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        expect(
          screen.getByText('Lembretes diários personalizados')
        ).toBeTruthy();
        expect(screen.getByText('Notificações de conquistas')).toBeTruthy();
        expect(
          screen.getByText('Acompanhamento de progresso')
        ).toBeTruthy();
      });
    });

    it('renders checkmark bullets in benefits card', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        const checkmarks = screen.getAllByText('✓');
        expect(checkmarks).toHaveLength(3);
      });
    });

    it('sets screen title via Stack.Screen options', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      render(<NotificationsScreen />);

      const { Stack } = require('expo-router');
      expect(Stack.Screen).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({ title: 'Notificações' }),
        }),
        expect.anything()
      );
    });
  });

  describe('Permission Status: Granted', () => {
    it('shows switch as ON and subtitle "Ativadas"', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Ativadas')).toBeTruthy();
        const toggle = screen.getByTestId('notification-switch');
        expect(toggle.props.value).toBe(true);
      });
    });
  });

  describe('Permission Status: Denied', () => {
    it('shows switch as OFF and subtitle with settings hint', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        expect(
          screen.getByText('Desativadas — toque para abrir configurações')
        ).toBeTruthy();
        const toggle = screen.getByTestId('notification-switch');
        expect(toggle.props.value).toBe(false);
      });
    });

    it('calls Linking.openSettings when switch is toggled in denied state', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        screen.getByTestId('notification-switch');
      });

      fireEvent(screen.getByTestId('notification-switch'), 'valueChange', true);

      await waitFor(() => {
        expect(Linking.openSettings).toHaveBeenCalled();
      });
    });
  });

  describe('Permission Status: Undetermined', () => {
    it('shows switch as OFF and subtitle "Desativadas"', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Desativadas')).toBeTruthy();
        const toggle = screen.getByTestId('notification-switch');
        expect(toggle.props.value).toBe(false);
      });
    });

    it('requests permission when switch is toggled in undetermined state', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        screen.getByTestId('notification-switch');
      });

      fireEvent(screen.getByTestId('notification-switch'), 'valueChange', true);

      await waitFor(() => {
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('updates to granted state after permission is accepted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        screen.getByTestId('notification-switch');
      });

      fireEvent(screen.getByTestId('notification-switch'), 'valueChange', true);

      await waitFor(() => {
        expect(screen.getByText('Ativadas')).toBeTruthy();
        const toggle = screen.getByTestId('notification-switch');
        expect(toggle.props.value).toBe(true);
      });
    });
  });

  describe('Haptics', () => {
    it('triggers medium impact haptic when toggling the switch', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        screen.getByTestId('notification-switch');
      });

      fireEvent(screen.getByTestId('notification-switch'), 'valueChange', true);

      await waitFor(() => {
        expect(mockImpactAsync).toHaveBeenCalledWith('Medium');
      });
    });
  });

  describe('AppState Listener', () => {
    it('registers AppState listener on mount', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalledWith(
          'change',
          expect.any(Function)
        );
      });
    });

    it('cleans up AppState listener on unmount', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const { unmount } = render(<NotificationsScreen />);

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('re-checks permission when app returns from background', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      render(<NotificationsScreen />);

      await waitFor(() => {
        expect(
          screen.getByText('Desativadas — toque para abrir configurações')
        ).toBeTruthy();
      });

      // Simulate returning from settings with granted permission
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      await act(async () => {
        if (appStateListener) {
          await appStateListener('active');
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Ativadas')).toBeTruthy();
        const toggle = screen.getByTestId('notification-switch');
        expect(toggle.props.value).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('handles error when checking permissions on mount', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission check failed')
      );

      render(<NotificationsScreen />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });

    it('handles error when requesting permissions', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Request failed')
      );

      render(<NotificationsScreen />);

      await waitFor(() => {
        screen.getByTestId('notification-switch');
      });

      fireEvent(screen.getByTestId('notification-switch'), 'valueChange', true);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });
  });
});
