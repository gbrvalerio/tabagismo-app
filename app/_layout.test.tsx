import { render, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import RootLayout from './_layout';

// Track registered screens
const registeredScreens: Array<{ name: string; options?: any }> = [];

// Mock expo-router
jest.mock('expo-router', () => {
  function MockStackScreen({ name, options }: { name: string; options?: any }) {
    // Add to registeredScreens when component is created
    if (!registeredScreens.some(s => s.name === name)) {
      registeredScreens.push({ name, options });
    }
    return null;
  }

  function MockStack({ children }: { children: any }) {
    return children;
  }
  MockStack.Screen = MockStackScreen;

  return {
    Stack: MockStack,
  };
});

// Mock dependencies
jest.mock('@expo-google-fonts/poppins', () => ({
  useFonts: () => [true],
  Poppins_400Regular: 'Poppins_400Regular',
  Poppins_500Medium: 'Poppins_500Medium',
  Poppins_600SemiBold: 'Poppins_600SemiBold',
  Poppins_700Bold: 'Poppins_700Bold',
}));

jest.mock('@/db', () => ({
  runMigrations: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        all: jest.fn().mockResolvedValue([{ id: 1 }]),
      }),
    }),
  },
}));

jest.mock('@/db/seed/seed-questions', () => ({
  seedOnboardingQuestions: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/components/question-flow/OnboardingGuard', () => ({
  OnboardingGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/lib/query-client', () => ({
  queryClient: {},
}));

jest.mock('@/db/repositories', () => ({
  useHasNotificationReward: jest.fn(() => ({ data: false })),
  useAwardCoins: jest.fn(() => ({ mutateAsync: jest.fn() })),
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'undetermined' }),
}));

// Mock AppState separately
const mockRemove = jest.fn();
const mockAddEventListener = jest.fn(() => ({ remove: mockRemove }));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return Object.defineProperty(RN, 'AppState', {
    get: () => ({
      addEventListener: mockAddEventListener,
    }),
  });
});

jest.mock('@/components/celebration', () => ({
  CelebrationDialog: () => null,
}));

describe('RootLayout - Screen Registration', () => {
  beforeEach(() => {
    registeredScreens.length = 0; // Clear the array
  });

  it('should register notification-permission screen with correct options', async () => {
    const { findByText } = render(<RootLayout />);

    // Wait for component to finish loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const notificationPermissionScreen = registeredScreens.find(
      (screen) => screen.name === 'notification-permission'
    );

    expect(notificationPermissionScreen).toBeDefined();
    expect(notificationPermissionScreen?.options).toEqual({
      headerShown: false,
      gestureEnabled: false,
    });
  });
});

describe('RootLayout - AppState Listener', () => {
  let appStateListener: ((state: string) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    registeredScreens.length = 0;
    appStateListener = null;
  });

  it('should add AppState listener on mount', () => {
    const mockAddEventListener = jest.fn().mockReturnValue({ remove: jest.fn() });
    jest.mock('react-native', () => ({
      ...jest.requireActual('react-native'),
      AppState: {
        addEventListener: mockAddEventListener,
      },
    }));

    render(<RootLayout />);

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should check permission status when app comes to foreground', async () => {
    const mockGetPermissions = jest.fn().mockResolvedValue({
      status: 'granted',
    });
    jest.mock('expo-notifications', () => ({
      getPermissionsAsync: mockGetPermissions,
    }));

    const mockAddEventListener = jest.fn((event, callback) => {
      appStateListener = callback;
      return { remove: jest.fn() };
    });
    jest.mock('react-native', () => ({
      ...jest.requireActual('react-native'),
      AppState: {
        addEventListener: mockAddEventListener,
      },
    }));

    render(<RootLayout />);

    await act(async () => {
      appStateListener?.('active');
    });

    await waitFor(() => {
      expect(mockGetPermissions).toHaveBeenCalled();
    });
  });

  it('should show celebration when permission changes from denied to granted', async () => {
    const mockGetPermissions = jest.fn()
      .mockResolvedValueOnce({ status: 'denied' })
      .mockResolvedValueOnce({ status: 'granted' });
    jest.mock('expo-notifications', () => ({
      getPermissionsAsync: mockGetPermissions,
    }));

    const mockAddEventListener = jest.fn((event, callback) => {
      appStateListener = callback;
      return { remove: jest.fn() };
    });
    jest.mock('react-native', () => ({
      ...jest.requireActual('react-native'),
      AppState: {
        addEventListener: mockAddEventListener,
      },
    }));

    jest.mock('@/db/repositories', () => ({
      useAwardCoins: jest.fn().mockReturnValue({
        mutateAsync: jest.fn().mockResolvedValue({}),
        isPending: false,
      }),
      useHasNotificationReward: jest.fn().mockReturnValue({ data: false }),
    }));

    const { getByTestId } = render(<RootLayout />);

    // First call sets initial status
    await act(async () => {
      appStateListener?.('active');
    });

    // Second call detects change
    await act(async () => {
      appStateListener?.('active');
    });

    await waitFor(() => {
      expect(getByTestId('celebration-dialog')).toBeTruthy();
    });
  });

  it('should award 15 coins when permission granted from Settings', async () => {
    const mockAwardCoins = jest.fn().mockResolvedValue({});
    jest.mock('@/db/repositories', () => ({
      useAwardCoins: jest.fn().mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      }),
      useHasNotificationReward: jest.fn().mockReturnValue({ data: false }),
    }));

    const mockGetPermissions = jest.fn()
      .mockResolvedValueOnce({ status: 'denied' })
      .mockResolvedValueOnce({ status: 'granted' });
    jest.mock('expo-notifications', () => ({
      getPermissionsAsync: mockGetPermissions,
    }));

    const mockAddEventListener = jest.fn((event, callback) => {
      appStateListener = callback;
      return { remove: jest.fn() };
    });
    jest.mock('react-native', () => ({
      ...jest.requireActual('react-native'),
      AppState: {
        addEventListener: mockAddEventListener,
      },
    }));

    render(<RootLayout />);

    await act(async () => {
      appStateListener?.('active');
    });

    await act(async () => {
      appStateListener?.('active');
    });

    await waitFor(() => {
      expect(mockAwardCoins).toHaveBeenCalledWith({
        amount: 15,
        type: 'notification_permission',
        metadata: expect.objectContaining({
          source: 'settings_activation',
        }),
      });
    });
  });

  it('should not award coins if already rewarded', async () => {
    const mockAwardCoins = jest.fn();
    jest.mock('@/db/repositories', () => ({
      useAwardCoins: jest.fn().mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      }),
      useHasNotificationReward: jest.fn().mockReturnValue({ data: true }),
    }));

    const mockGetPermissions = jest.fn()
      .mockResolvedValueOnce({ status: 'denied' })
      .mockResolvedValueOnce({ status: 'granted' });
    jest.mock('expo-notifications', () => ({
      getPermissionsAsync: mockGetPermissions,
    }));

    const mockAddEventListener = jest.fn((event, callback) => {
      appStateListener = callback;
      return { remove: jest.fn() };
    });
    jest.mock('react-native', () => ({
      ...jest.requireActual('react-native'),
      AppState: {
        addEventListener: mockAddEventListener,
      },
    }));

    render(<RootLayout />);

    await act(async () => {
      appStateListener?.('active');
    });

    await act(async () => {
      appStateListener?.('active');
    });

    await waitFor(() => {
      expect(mockAwardCoins).not.toHaveBeenCalled();
    });
  });

  it('should not show celebration if permission was already granted', async () => {
    const mockGetPermissions = jest.fn().mockResolvedValue({
      status: 'granted',
    });
    jest.mock('expo-notifications', () => ({
      getPermissionsAsync: mockGetPermissions,
    }));

    const mockAddEventListener = jest.fn((event, callback) => {
      appStateListener = callback;
      return { remove: jest.fn() };
    });
    jest.mock('react-native', () => ({
      ...jest.requireActual('react-native'),
      AppState: {
        addEventListener: mockAddEventListener,
      },
    }));

    const { queryByTestId } = render(<RootLayout />);

    await act(async () => {
      appStateListener?.('active');
    });

    await act(async () => {
      appStateListener?.('active');
    });

    expect(queryByTestId('celebration-dialog')).toBeNull();
  });

  it('should clean up listener on unmount', () => {
    const mockRemove = jest.fn();
    const mockAddEventListener = jest.fn().mockReturnValue({
      remove: mockRemove,
    });
    jest.mock('react-native', () => ({
      ...jest.requireActual('react-native'),
      AppState: {
        addEventListener: mockAddEventListener,
      },
    }));

    const { unmount } = render(<RootLayout />);
    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
