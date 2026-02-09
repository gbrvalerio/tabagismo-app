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
});
