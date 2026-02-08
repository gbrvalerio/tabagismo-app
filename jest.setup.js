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

// Mock expo-sqlite
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

// Mock missing components
jest.mock('@/components/haptic-tab', () => ({
  HapticTab: jest.fn((props) => null),
}));

jest.mock('@/components/ui/icon-symbol', () => ({
  IconSymbol: jest.fn((props) => null),
}));

// Set shorter timeout to prevent hanging
jest.setTimeout(5000);

// Clean up after each test
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
