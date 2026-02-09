import { render } from '@testing-library/react-native';
import React from 'react';
import RootLayout from './_layout';

// Track registered screens
const registeredScreens: { name: string; options?: any }[] = [];

// Mock expo-router
jest.mock('expo-router', () => {
  function MockStackScreen({ name, options }: { name: string; options?: any }) {
    if (!registeredScreens.some((s) => s.name === name)) {
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

jest.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/lib/query-client', () => ({
  queryClient: {
    mount: jest.fn(),
    unmount: jest.fn(),
  },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('@/components/NotificationPermissionListener', () => ({
  NotificationPermissionListener: () => null,
}));

const mockCelebrationDialog = jest.fn(({ visible, testID }: any) =>
  visible ? <div data-testid={testID || 'celebration-dialog'} /> : null
);

jest.mock('@/components/celebration', () => ({
  CelebrationDialog: mockCelebrationDialog,
}));

describe('RootLayout - Screen Registration', () => {
  beforeEach(() => {
    registeredScreens.length = 0;
    jest.clearAllMocks();
    mockCelebrationDialog.mockClear();
  });

  it('should register onboarding-slides screen with correct options', async () => {
    render(<RootLayout />);

    // Wait for component to be fully rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

    const onboardingSlidesScreen = registeredScreens.find(
      (screen) => screen.name === 'onboarding-slides'
    );

    expect(onboardingSlidesScreen).toBeDefined();
    expect(onboardingSlidesScreen?.options).toEqual({
      headerShown: false,
      gestureEnabled: false,
    });
  });

  it('should register notification-permission screen with correct options', async () => {
    const { findByTestId } = render(<RootLayout />);

    // Wait for component to be fully rendered
    await new Promise((resolve) => setTimeout(resolve, 100));

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

// Note: AppState listener tests have been moved to NotificationPermissionListener.test.tsx
// since the notification permission detection logic is now encapsulated in that component.
