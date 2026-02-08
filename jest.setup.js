import '@testing-library/jest-native/extend-expect';

// Mock expo-router
jest.mock('expo-router', () => ({
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
}));

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

// Mock expo-router Tabs
jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    Tabs: {
      Screen: jest.fn(({ children, options, name }) => null),
      navigator: jest.fn(),
    },
  };
}, { virtual: true });

// Mock missing components
jest.mock('@/components/haptic-tab', () => ({
  HapticTab: jest.fn((props) => null),
}));

jest.mock('@/components/ui/icon-symbol', () => ({
  IconSymbol: jest.fn((props) => null),
}));

// Mock react-native useColorScheme hook
jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    ...actualReactNative,
    useColorScheme: jest.fn(() => 'light'),
  };
});
