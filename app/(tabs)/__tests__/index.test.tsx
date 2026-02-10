 
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import * as haptics from '@/lib/haptics';

import HomeScreen from '../index';

// Mock expo-router with useRouter returning a trackable push
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  Href: {},
}));

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));
const mockImpactAsync = haptics.impactAsync as jest.Mock;

// Mock db repositories
jest.mock('@/db', () => ({
  useOnboardingStatus: () => ({ data: true, isLoading: false }),
  useCompleteOnboarding: () => ({ mutate: jest.fn(), isPending: false }),
  useResetOnboarding: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useDeleteAllAnswers: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useResetUserCoins: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('@/db/repositories/onboarding-slides.repository', () => ({
  useResetSlidesCompleted: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HomeScreen />);
  });

  describe('Gear Button', () => {
    it('renders the gear button', () => {
      const { getByTestId } = render(<HomeScreen />);
      expect(getByTestId('gear-button')).toBeTruthy();
    });

    it('navigates to /settings when pressed', () => {
      const { getByTestId } = render(<HomeScreen />);
      fireEvent.press(getByTestId('gear-button'));
      expect(mockPush).toHaveBeenCalledWith('/settings');
    });

    it('triggers haptic feedback on press', () => {
      const { getByTestId } = render(<HomeScreen />);
      fireEvent.press(getByTestId('gear-button'));
      expect(mockImpactAsync).toHaveBeenCalled();
    });

    it('has absolute positioning styles for top-right placement with safe area', () => {
      const { getByTestId } = render(<HomeScreen />);
      const gearButton = getByTestId('gear-button');
      const style = gearButton.props.style;
      // Flatten style array (static stylesheet + dynamic inline style)
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style.flat(Infinity).filter(Boolean))
        : style;
      expect(flatStyle.position).toBe('absolute');
      expect(flatStyle.top).toBeGreaterThan(0); // safe area inset + spacing
      expect(flatStyle.right).toBeDefined();
      expect(flatStyle.zIndex).toBe(1);
      expect(flatStyle.backgroundColor).toBeDefined();
      expect(flatStyle.borderRadius).toBeDefined();
    });
  });
});
