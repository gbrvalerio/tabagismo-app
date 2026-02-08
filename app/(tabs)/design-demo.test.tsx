// app/(tabs)/design-demo.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import DesignDemo from './design-demo';

describe('DesignDemo Screen', () => {
  it('should render screen title', () => {
    const { getByText } = render(<DesignDemo />);
    expect(getByText('Design System')).toBeTruthy();
  });

  it('should render all button variants', () => {
    const { getByText } = render(<DesignDemo />);

    expect(getByText('Primary Button')).toBeTruthy();
    expect(getByText('Secondary Button')).toBeTruthy();
    expect(getByText('Minimal Button')).toBeTruthy();
    expect(getByText('Outline Button')).toBeTruthy();
  });

  it('should render text field examples', () => {
    const { getByText } = render(<DesignDemo />);

    expect(getByText('NOME')).toBeTruthy();
    expect(getByText('EMAIL')).toBeTruthy();
  });
});
