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

// Mock useColorScheme hook
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View: View,
      createAnimatedComponent: (component) => component,
    },
    useSharedValue: (initialValue) => ({ value: initialValue }),
    useAnimatedStyle: (styleFactory) => styleFactory(),
    withTiming: (toValue) => toValue,
    withSpring: (toValue) => toValue,
    Easing: {
      linear: (v) => v,
      ease: (v) => v,
      out: () => (v) => v,
      in: () => (v) => v,
      inOut: () => (v) => v,
      cubic: (v) => v,
      bezier: () => (v) => v,
    },
    interpolateColor: (_value, _inputRange, outputRange) => outputRange[0],
  };
});
