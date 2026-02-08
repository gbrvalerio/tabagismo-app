import '@testing-library/jest-native/extend-expect';

// Mock expo-router with both Tabs and Tabs.Screen
jest.mock('expo-router', () => {
  const mockTabsScreen = jest.fn(({ children, options, name }) => null);
  const mockTabs = jest.fn(({ children, screenOptions }) => null);
  Object.assign(mockTabs, { Screen: mockTabsScreen });

  return {
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useSegments: () => [],
    usePathname: () => '/',
    Tabs: mockTabs,
  };
});

// Mock expo-sqlite - NOTE: This is a generic mock that returns a default database object.
// Tests that need specific mock behavior for openDatabaseSync should define their own
// jest.mock('expo-sqlite') in their test file before any imports.
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(),
  })),
}));

// Mock react-native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  default: {
    alert: jest.fn(),
  },
}));

// Mock drizzle-orm/expo-sqlite
jest.mock('drizzle-orm/expo-sqlite', () => {
  const migrateFn = jest.fn().mockResolvedValue(undefined);
  const drizzleFn = jest.fn(() => ({}));

  return {
    drizzle: drizzleFn,
    migrate: migrateFn,
  };
});

// Mock missing components - HapticTab should render Pressable with children
jest.mock('@/components/haptic-tab', () => {
  const React = require('react');
  const { Pressable } = require('react-native');
  return {
    HapticTab: React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(Pressable, { ref, ...props }, children)
    ),
  };
});

// Set shorter timeout to prevent hanging
jest.setTimeout(5000);

// Clean up after each test
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
