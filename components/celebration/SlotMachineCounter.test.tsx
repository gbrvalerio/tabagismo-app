import { render, screen } from '@testing-library/react-native';
import { SlotMachineCounter } from './SlotMachineCounter';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

describe('SlotMachineCounter', () => {
  describe('rendering', () => {
    it('should render with the correct testID', () => {
      render(<SlotMachineCounter value={25} testID="counter" />);
      expect(screen.getByTestId('counter')).toBeTruthy();
    });

    it('should render the plus symbol', () => {
      render(<SlotMachineCounter value={5} />);
      expect(screen.getByText('+')).toBeTruthy();
    });
  });

  describe('digit handling', () => {
    it('should render one digit reel for single-digit values', () => {
      render(<SlotMachineCounter value={5} testID="counter" />);

      // Should have exactly 1 digit reel
      expect(screen.getByTestId('counter-digit-0')).toBeTruthy();
      expect(screen.queryByTestId('counter-digit-1')).toBeNull();
    });

    it('should render two digit reels for two-digit values', () => {
      render(<SlotMachineCounter value={25} testID="counter" />);

      // Should have exactly 2 digit reels
      expect(screen.getByTestId('counter-digit-0')).toBeTruthy();
      expect(screen.getByTestId('counter-digit-1')).toBeTruthy();
      expect(screen.queryByTestId('counter-digit-2')).toBeNull();
    });

    it('should render three digit reels for three-digit values', () => {
      render(<SlotMachineCounter value={100} testID="counter" />);

      // Should have exactly 3 digit reels
      expect(screen.getByTestId('counter-digit-0')).toBeTruthy();
      expect(screen.getByTestId('counter-digit-1')).toBeTruthy();
      expect(screen.getByTestId('counter-digit-2')).toBeTruthy();
      expect(screen.queryByTestId('counter-digit-3')).toBeNull();
    });

    it('should handle zero value', () => {
      render(<SlotMachineCounter value={0} testID="counter" />);

      // Should have exactly 1 digit reel for '0'
      expect(screen.getByTestId('counter-digit-0')).toBeTruthy();
      expect(screen.queryByTestId('counter-digit-1')).toBeNull();
    });
  });

  describe('digit reel content', () => {
    it('should contain all digits 0-9 in each reel for animation', () => {
      render(<SlotMachineCounter value={5} testID="counter" />);

      // Each digit reel should contain all digits 0-9 for the slot machine animation
      const digitReel = screen.getByTestId('counter-digit-0');
      expect(digitReel).toBeTruthy();

      // The reel contains all digits for scrolling animation
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByText(i.toString())).toBeTruthy();
      }
    });
  });

  describe('value changes', () => {
    it('should update digit reels when value changes', () => {
      const { rerender } = render(<SlotMachineCounter value={5} testID="counter" />);

      // Initially single digit
      expect(screen.queryByTestId('counter-digit-1')).toBeNull();

      // Update to two-digit value
      rerender(<SlotMachineCounter value={25} testID="counter" />);

      // Should now have two digit reels
      expect(screen.getByTestId('counter-digit-0')).toBeTruthy();
      expect(screen.getByTestId('counter-digit-1')).toBeTruthy();
    });
  });

  describe('default testID', () => {
    it('should use slot-counter as default testID', () => {
      render(<SlotMachineCounter value={5} />);

      expect(screen.getByTestId('slot-counter')).toBeTruthy();
      expect(screen.getByTestId('slot-counter-digit-0')).toBeTruthy();
    });
  });
});
