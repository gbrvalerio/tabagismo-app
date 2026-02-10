import { render, screen } from '@testing-library/react-native';
import { SparkleParticles } from './SparkleParticles';
import { colors } from '@/lib/theme/tokens';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('SparkleParticles', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render exactly 20 particles', () => {
      render(<SparkleParticles testID="sparkles" />);
      const particles = screen.getAllByTestId(/sparkles-particle-/);
      expect(particles).toHaveLength(20);
    });

    it('should use custom testID prefix for all particles', () => {
      render(<SparkleParticles testID="custom" />);

      for (let i = 0; i < 20; i++) {
        expect(screen.getByTestId(`custom-particle-${i}`)).toBeTruthy();
      }
    });

    it('should use default testID when not provided', () => {
      render(<SparkleParticles />);
      expect(screen.getByTestId('sparkles-particle-0')).toBeTruthy();
    });
  });

  describe('particle styling', () => {
    it('should render particles with position absolute for radial distribution', () => {
      render(<SparkleParticles testID="sparkles" />);
      const particles = screen.getAllByTestId(/sparkles-particle-/);

      particles.forEach((particle) => {
        const flatStyle = Array.isArray(particle.props.style)
          ? Object.assign({}, ...particle.props.style.flat().filter(Boolean))
          : particle.props.style;

        expect(flatStyle.position).toBe('absolute');
      });
    });

    it('should render particles with circular shape (borderRadius = size/2)', () => {
      render(<SparkleParticles testID="sparkles" />);
      const particles = screen.getAllByTestId(/sparkles-particle-/);

      particles.forEach((particle) => {
        const flatStyle = Array.isArray(particle.props.style)
          ? Object.assign({}, ...particle.props.style.flat().filter(Boolean))
          : particle.props.style;

        // Each particle should have borderRadius = width/2 for circular shape
        expect(flatStyle.borderRadius).toBe(flatStyle.width / 2);
      });
    });

    it('should render particles with sizes between 4 and 10 pixels', () => {
      render(<SparkleParticles testID="sparkles" />);
      const particles = screen.getAllByTestId(/sparkles-particle-/);

      particles.forEach((particle) => {
        const flatStyle = Array.isArray(particle.props.style)
          ? Object.assign({}, ...particle.props.style.flat().filter(Boolean))
          : particle.props.style;

        // Size should be 4 + random * 6, so between 4 and 10
        expect(flatStyle.width).toBeGreaterThanOrEqual(4);
        expect(flatStyle.width).toBeLessThanOrEqual(10);
        expect(flatStyle.height).toBe(flatStyle.width);
      });
    });
  });

  describe('particle colors', () => {
    it('should assign gold color when random < 0.6', () => {
      // Mock Math.random to return 0.5 consistently
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      render(<SparkleParticles testID="gold" />);
      const particles = screen.getAllByTestId(/gold-particle-/);

      particles.forEach((particle) => {
        const flatStyle = Array.isArray(particle.props.style)
          ? Object.assign({}, ...particle.props.style.flat().filter(Boolean))
          : particle.props.style;

        expect(flatStyle.backgroundColor).toBe(colors.accent.gold);
      });
    });

    it('should assign primary light color when 0.6 <= random < 0.85', () => {
      // Mock Math.random to return 0.7 consistently
      jest.spyOn(Math, 'random').mockReturnValue(0.7);

      render(<SparkleParticles testID="primary" />);
      const particles = screen.getAllByTestId(/primary-particle-/);

      particles.forEach((particle) => {
        const flatStyle = Array.isArray(particle.props.style)
          ? Object.assign({}, ...particle.props.style.flat().filter(Boolean))
          : particle.props.style;

        expect(flatStyle.backgroundColor).toBe(colors.primary.light);
      });
    });

    it('should assign secondary base color when random >= 0.85', () => {
      // Mock Math.random to return 0.9 consistently
      jest.spyOn(Math, 'random').mockReturnValue(0.9);

      render(<SparkleParticles testID="secondary" />);
      const particles = screen.getAllByTestId(/secondary-particle-/);

      particles.forEach((particle) => {
        const flatStyle = Array.isArray(particle.props.style)
          ? Object.assign({}, ...particle.props.style.flat().filter(Boolean))
          : particle.props.style;

        expect(flatStyle.backgroundColor).toBe(colors.secondary.base);
      });
    });

    it('should only use valid theme colors', () => {
      render(<SparkleParticles testID="colors" />);
      const particles = screen.getAllByTestId(/colors-particle-/);
      const validColors = [colors.accent.gold, colors.primary.light, colors.secondary.base];

      particles.forEach((particle) => {
        const flatStyle = Array.isArray(particle.props.style)
          ? Object.assign({}, ...particle.props.style.flat().filter(Boolean))
          : particle.props.style;

        expect(validColors).toContain(flatStyle.backgroundColor);
      });
    });
  });

  describe('container', () => {
    it('should render in a container with pointerEvents none', () => {
      const { toJSON } = render(<SparkleParticles testID="sparkles" />);
      const component = toJSON();

      expect(component?.props.pointerEvents).toBe('none');
    });

    it('should center particles in the container', () => {
      const { toJSON } = render(<SparkleParticles testID="sparkles" />);
      const component = toJSON();

      expect(component?.props.style.alignItems).toBe('center');
      expect(component?.props.style.justifyContent).toBe('center');
    });

    it('should use absolute positioning to overlay content', () => {
      const { toJSON } = render(<SparkleParticles testID="sparkles" />);
      const component = toJSON();

      expect(component?.props.style.position).toBe('absolute');
    });
  });

  describe('particle distribution', () => {
    it('should generate particles at random positions (not all identical)', () => {
      render(<SparkleParticles testID="random" />);
      const particles = screen.getAllByTestId(/random-particle-/);

      // Extract transform positions from particles
      const positions = particles.map((particle) => {
        const flatStyle = Array.isArray(particle.props.style)
          ? Object.assign({}, ...particle.props.style.flat().filter(Boolean))
          : particle.props.style;

        // Get translateX and translateY from transform array
        const transform = flatStyle.transform || [];
        const translateX = transform.find((t: any) => 'translateX' in t)?.translateX || 0;
        const translateY = transform.find((t: any) => 'translateY' in t)?.translateY || 0;
        return { x: translateX, y: translateY };
      });

      // Not all particles should be at the same position
      const uniquePositions = new Set(positions.map((p) => `${p.x},${p.y}`));
      expect(uniquePositions.size).toBeGreaterThan(1);
    });
  });
});
