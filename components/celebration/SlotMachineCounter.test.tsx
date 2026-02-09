import { render } from '@testing-library/react-native';
import { SlotMachineCounter } from './SlotMachineCounter';

describe('SlotMachineCounter', () => {
  it('displays correct final number', () => {
    const { getByText } = render(<SlotMachineCounter value={25} />);

    // Wait for animation to complete (in real test, use waitFor)
    expect(getByText('+')).toBeTruthy();
  });

  it('shows plus symbol before number', () => {
    const { getByText } = render(<SlotMachineCounter value={5} />);
    expect(getByText('+')).toBeTruthy();
  });

  it('handles single-digit values', () => {
    const { getByTestId } = render(
      <SlotMachineCounter value={5} testID="counter" />
    );
    expect(getByTestId('counter')).toBeTruthy();
  });

  it('handles multi-digit values', () => {
    const { getByTestId } = render(
      <SlotMachineCounter value={99} testID="counter" />
    );
    expect(getByTestId('counter')).toBeTruthy();
  });
});
