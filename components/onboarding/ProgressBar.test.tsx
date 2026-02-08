import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { ProgressBar } from './ProgressBar';

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

describe('ProgressBar', () => {
  it('should render progress percentage text', () => {
    render(<ProgressBar progress={50} />);
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('should show 0% when progress is 0', () => {
    render(<ProgressBar progress={0} />);
    expect(screen.getByText('0%')).toBeDefined();
  });

  it('should show 100% when progress is 100', () => {
    render(<ProgressBar progress={100} />);
    expect(screen.getByText('100%')).toBeDefined();
  });

  it('should render progress bar container', () => {
    const { toJSON } = render(<ProgressBar progress={50} />);
    expect(toJSON()).toBeDefined();
  });
});
