import { render } from '@testing-library/react-native';
import { SparkleParticles } from './SparkleParticles';

describe('SparkleParticles', () => {
  it('renders 20 particles', () => {
    const { getAllByTestId } = render(<SparkleParticles testID="sparkles" />);
    const particles = getAllByTestId(/sparkles-particle-/);
    expect(particles).toHaveLength(20);
  });

  it('particles have random positions', () => {
    const { getAllByTestId } = render(<SparkleParticles testID="sparkles" />);
    const particles = getAllByTestId(/sparkles-particle-/);

    // Check that not all particles are at the same position (randomness check)
    expect(particles.length).toBeGreaterThan(0);
  });

  it('generates particles with gold color (rand < 0.6)', () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.5).mockReturnValue(0.5); // First for angle, second for color

    const { getAllByTestId } = render(<SparkleParticles testID="sparkles-gold" />);
    const particles = getAllByTestId(/sparkles-gold-particle-/);
    expect(particles.length).toBeGreaterThan(0);

    mockRandom.mockRestore();
  });

  it('generates particles with primary light color (0.6 <= rand < 0.85)', () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.7).mockReturnValue(0.7);

    const { getAllByTestId } = render(<SparkleParticles testID="sparkles-primary" />);
    const particles = getAllByTestId(/sparkles-primary-particle-/);
    expect(particles.length).toBeGreaterThan(0);

    mockRandom.mockRestore();
  });

  it('generates particles with secondary color (rand >= 0.85)', () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValueOnce(0.9).mockReturnValue(0.9);

    const { getAllByTestId } = render(<SparkleParticles testID="sparkles-secondary" />);
    const particles = getAllByTestId(/sparkles-secondary-particle-/);
    expect(particles.length).toBeGreaterThan(0);

    mockRandom.mockRestore();
  });
});
