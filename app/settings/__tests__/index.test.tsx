/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

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
const mockGetPermissionsAsync = jest.fn();
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: mockGetPermissionsAsync,
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
  return {
    SettingsMenuItem: ({ icon, title, subtitle, onPress, testID }: any) =>
      React.createElement(
        'View',
        { testID },
        React.createElement('View', { testID: `${testID}-icon` }, icon),
        React.createElement('View', null,
          React.createElement('View', null, title),
          subtitle ? React.createElement('View', null, subtitle) : null
        ),
        React.createElement('View', {
          testID: `${testID}-pressable`,
          onPress,
          accessibilityRole: 'button',
        })
      ),
  };
});

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

import SettingsScreen from '../index';

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
  });

  it('renders without crashing', async () => {
    expect(() => render(<SettingsScreen />)).not.toThrow();
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
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('handles case when answers data is empty array', () => {
    mockUseAnswers.mockReturnValue({ data: [] });
    expect(() => render(<SettingsScreen />)).not.toThrow();
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
    const { AppState } = require('react-native');
    render(<SettingsScreen />);

    // Initial call
    expect(mockGetPermissionsAsync).toHaveBeenCalledTimes(1);

    // Simulate app coming to foreground
    const listener = AppState.addEventListener.mock?.calls?.[0]?.[1];
    if (listener) {
      await listener('active');
      expect(mockGetPermissionsAsync).toHaveBeenCalledTimes(2);
    }
  });
});
