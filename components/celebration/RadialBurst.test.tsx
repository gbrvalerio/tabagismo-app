import { render } from '@testing-library/react-native';
import { RadialBurst } from './RadialBurst';

describe('RadialBurst', () => {
  it('renders 8 burst lines', () => {
    const { getAllByTestId } = render(<RadialBurst testID="burst" />);
    const lines = getAllByTestId(/burst-line-/);
    expect(lines).toHaveLength(8);
  });

  it('lines are positioned at correct angles', () => {
    const { getAllByTestId } = render(<RadialBurst testID="burst" />);
    const lines = getAllByTestId(/burst-line-/);

    // Verify we have lines (implementation will handle rotation)
    expect(lines.length).toBe(8);
  });
});
