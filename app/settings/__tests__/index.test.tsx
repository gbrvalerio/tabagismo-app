/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';

import SettingsScreen from '../index';
import * as Notifications from 'expo-notifications';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  const mockStackScreen = jest.fn((_props: any) => null);
  const mockStack = jest.fn(({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children)
  );
  Object.assign(mockStack, { Screen: mockStackScreen });
  return {
    Stack: mockStack,
    useRouter: () => ({ push: mockPush }),
  };
});

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      React.createElement('View', { ...props, testID: 'linear-gradient' }, children),
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }: any) =>
      React.createElement('View', props, children),
  };
});

// Mock useAnswers
const mockUseAnswers = jest.fn();
jest.mock('@/db/repositories/questions.repository', () => ({
  useAnswers: (context: string) => mockUseAnswers(context),
}));

// Mock SettingsMenuItem
jest.mock('@/components/settings/SettingsMenuItem', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    SettingsMenuItem: ({ title, subtitle, onPress, testID }: any) =>
      React.createElement(
        View,
        { testID },
        React.createElement(Text, null, title),
        subtitle ? React.createElement(Text, null, subtitle) : null,
        React.createElement(Pressable, {
          testID: `${testID}-pressable`,
          onPress,
        })
      ),
  };
});

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

const mockGetPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock;

// Mock AppState.addEventListener
const mockRemove = jest.fn();
const originalAddEventListener = AppState.addEventListener;

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockUseAnswers.mockReturnValue({
      data: [
        { questionKey: 'name', answer: 'João' },
        { questionKey: 'age', answer: '30' },
      ],
    });
    AppState.addEventListener = jest.fn().mockReturnValue({ remove: mockRemove });
  });

  afterEach(() => {
    AppState.addEventListener = originalAddEventListener;
  });

  it('renders without crashing', () => {
    render(<SettingsScreen />);
  });

  it('sets screen title to Configurações', () => {
    render(<SettingsScreen />);
    const { Stack } = require('expo-router');
    const screenCalls = Stack.Screen.mock.calls;
    const screenCall = screenCalls.find(
      (call: any[]) => call[0]?.options?.title === 'Configurações'
    );
    expect(screenCall).toBeTruthy();
  });

  it('renders Perfil menu item', () => {
    const { getByTestId } = render(<SettingsScreen />);
    expect(getByTestId('settings-menu-profile')).toBeTruthy();
  });

  it('renders Notificações menu item', () => {
    const { getByTestId } = render(<SettingsScreen />);
    expect(getByTestId('settings-menu-notifications')).toBeTruthy();
  });

  it('shows user name as subtitle for Perfil', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('João')).toBeTruthy();
  });

  it('shows Ativadas when notifications are granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    const { findByText } = render(<SettingsScreen />);
    expect(await findByText('Ativadas')).toBeTruthy();
  });

  it('shows Desativadas when notifications are denied', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const { findByText } = render(<SettingsScreen />);
    expect(await findByText('Desativadas')).toBeTruthy();
  });

  it('shows Desativadas when notifications are undetermined', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
    const { findByText } = render(<SettingsScreen />);
    expect(await findByText('Desativadas')).toBeTruthy();
  });

  it('navigates to profile on Perfil press', () => {
    const { getByTestId } = render(<SettingsScreen />);
    fireEvent.press(getByTestId('settings-menu-profile-pressable'));
    expect(mockPush).toHaveBeenCalledWith('/settings/profile');
  });

  it('navigates to notifications on Notificações press', () => {
    const { getByTestId } = render(<SettingsScreen />);
    fireEvent.press(getByTestId('settings-menu-notifications-pressable'));
    expect(mockPush).toHaveBeenCalledWith('/settings/notifications');
  });

  it('handles case when no name answer exists', () => {
    mockUseAnswers.mockReturnValue({
      data: [{ questionKey: 'age', answer: '30' }],
    });
    const { queryByText } = render(<SettingsScreen />);
    expect(queryByText('João')).toBeNull();
  });

  it('handles case when answers data is undefined', () => {
    mockUseAnswers.mockReturnValue({ data: undefined });
    render(<SettingsScreen />);
  });

  it('handles case when answers data is empty array', () => {
    mockUseAnswers.mockReturnValue({ data: [] });
    render(<SettingsScreen />);
  });

  it('calls useAnswers with onboarding context', () => {
    render(<SettingsScreen />);
    expect(mockUseAnswers).toHaveBeenCalledWith('onboarding');
  });

  it('renders LinearGradient background', () => {
    const { getByTestId } = render(<SettingsScreen />);
    expect(getByTestId('linear-gradient')).toBeTruthy();
  });

  it('re-checks notification permission when app comes to foreground', async () => {
    render(<SettingsScreen />);

    await waitFor(() => {
      expect(mockGetPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    // Get the AppState listener
    const addEventListenerMock = AppState.addEventListener as jest.Mock;
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    const listener = addEventListenerMock.mock.calls[0][1];

    // Simulate app coming to foreground
    await listener('active');

    await waitFor(() => {
      expect(mockGetPermissionsAsync).toHaveBeenCalledTimes(2);
    });
  });

  it('cleans up AppState listener on unmount', () => {
    const { unmount } = render(<SettingsScreen />);
    unmount();
    expect(mockRemove).toHaveBeenCalled();
  });
});
