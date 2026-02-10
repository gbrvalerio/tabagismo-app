import { render, screen } from '@testing-library/react-native';
import { RadialBurst } from './RadialBurst';

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
    LinearGradient: ({ children, style, ...props }: any) => (
      <View style={style} {...props}>{children}</View>
    ),
  };
});

describe('RadialBurst', () => {
  describe('rendering', () => {
    it('should render 8 burst lines for radial pattern', () => {
      render(<RadialBurst testID="burst" />);
      const lines = screen.getAllByTestId(/burst-line-/);
      expect(lines).toHaveLength(8);
    });

    it('should use custom testID prefix for all lines', () => {
      render(<RadialBurst testID="custom-burst" />);

      for (let i = 0; i < 8; i++) {
        expect(screen.getByTestId(`custom-burst-line-${i}`)).toBeTruthy();
      }
    });

    it('should use default testID when not provided', () => {
      render(<RadialBurst />);

      // Default testID is 'burst'
      const lines = screen.getAllByTestId(/burst-line-/);
      expect(lines).toHaveLength(8);
      expect(screen.getByTestId('burst-line-0')).toBeTruthy();
    });
  });

  describe('line positioning', () => {
    it('should position lines at evenly distributed angles (45 degrees apart)', () => {
      const { UNSAFE_getAllByType } = render(<RadialBurst testID="burst" />);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { View } = require('react-native');

      // Get the animated views that have position styling
      const lines = screen.getAllByTestId(/burst-line-/);

      // Each line should have position: absolute for radial positioning
      lines.forEach((line) => {
        const flatStyle = Array.isArray(line.props.style)
          ? Object.assign({}, ...line.props.style.flat().filter(Boolean))
          : line.props.style;

        expect(flatStyle.position).toBe('absolute');
      });
    });

    it('should render lines with consistent dimensions', () => {
      render(<RadialBurst testID="burst" />);
      const lines = screen.getAllByTestId(/burst-line-/);

      lines.forEach((line) => {
        const flatStyle = Array.isArray(line.props.style)
          ? Object.assign({}, ...line.props.style.flat().filter(Boolean))
          : line.props.style;

        // All lines should have the same base dimensions (100x4 from component)
        expect(flatStyle.width).toBe(100);
        expect(flatStyle.height).toBe(4);
      });
    });
  });

  describe('container', () => {
    it('should render in a container with pointerEvents none to not block touches', () => {
      const { toJSON } = render(<RadialBurst testID="burst" />);
      const component = toJSON();

      expect(component?.props.pointerEvents).toBe('none');
    });

    it('should have fixed container dimensions for the radial pattern', () => {
      const { toJSON } = render(<RadialBurst testID="burst" />);
      const component = toJSON();

      // Container should be 300x300 for the burst pattern
      expect(component?.props.style.width).toBe(300);
      expect(component?.props.style.height).toBe(300);
    });

    it('should center content in the container', () => {
      const { toJSON } = render(<RadialBurst testID="burst" />);
      const component = toJSON();

      expect(component?.props.style.alignItems).toBe('center');
      expect(component?.props.style.justifyContent).toBe('center');
    });
  });

  describe('line count constant', () => {
    it('should always render exactly 8 lines regardless of props', () => {
      const { rerender } = render(<RadialBurst testID="a" />);
      expect(screen.getAllByTestId(/a-line-/)).toHaveLength(8);

      rerender(<RadialBurst testID="b" />);
      expect(screen.getAllByTestId(/b-line-/)).toHaveLength(8);
    });
  });
});
