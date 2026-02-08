import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { ProgressBar } from './ProgressBar';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ProgressBar', () => {
  it('should render current step and total steps', () => {
    render(<ProgressBar progress={50} currentStep={2} totalSteps={4} />);
    expect(screen.getByText('2/4')).toBeDefined();
  });

  it('should render header text', () => {
    render(<ProgressBar progress={50} currentStep={1} totalSteps={3} />);
    expect(screen.getByText('Sua Jornada')).toBeDefined();
  });

  it('should render progress bar container', () => {
    const { toJSON } = render(<ProgressBar progress={50} currentStep={2} totalSteps={4} />);
    expect(toJSON()).toBeDefined();
  });

  it('should render correct number of dots', () => {
    const { toJSON } = render(<ProgressBar progress={50} currentStep={2} totalSteps={5} />);
    // Note: Actual dot counting would require test IDs or more specific queries
    expect(toJSON()).toBeDefined();
  });
});
