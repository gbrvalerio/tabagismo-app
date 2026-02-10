/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock expo-router with useRouter returning a trackable push
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  Href: {},
}));

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
}));
import * as haptics from '@/lib/haptics';
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

import HomeScreen from '../index';

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

    it('has absolute positioning styles for top-right placement', () => {
      const { getByTestId } = render(<HomeScreen />);
      const gearButton = getByTestId('gear-button');
      const style = gearButton.props.style;
      // Flatten style if it's an array
      const flatStyle = Array.isArray(style)
        ? Object.assign({}, ...style)
        : style;
      expect(flatStyle.position).toBe('absolute');
      expect(flatStyle.top).toBeDefined();
      expect(flatStyle.right).toBeDefined();
      expect(flatStyle.zIndex).toBe(1);
    });
  });
});
