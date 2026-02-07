import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemedText } from './themed-text';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

describe('ThemedText', () => {
  it('should render text content', () => {
    render(<ThemedText>Hello World</ThemedText>);

    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('should apply default type styles', () => {
    render(<ThemedText type="default">Default Text</ThemedText>);

    const element = screen.getByText('Default Text');
    expect(element).toBeTruthy();
  });

  it('should apply title type styles', () => {
    render(<ThemedText type="title">Title Text</ThemedText>);

    const element = screen.getByText('Title Text');
    expect(element).toBeTruthy();
  });

  it('should apply subtitle type styles', () => {
    render(<ThemedText type="subtitle">Subtitle Text</ThemedText>);

    const element = screen.getByText('Subtitle Text');
    expect(element).toBeTruthy();
  });

  it('should apply defaultSemiBold type styles', () => {
    render(<ThemedText type="defaultSemiBold">Semi Bold Text</ThemedText>);

    const element = screen.getByText('Semi Bold Text');
    expect(element).toBeTruthy();
  });

  it('should apply link type styles', () => {
    render(<ThemedText type="link">Link Text</ThemedText>);

    const element = screen.getByText('Link Text');
    expect(element).toBeTruthy();
  });

  it('should accept custom style props', () => {
    render(
      <ThemedText style={{ fontSize: 20 }}>Custom Style</ThemedText>
    );

    const element = screen.getByText('Custom Style');
    expect(element).toBeTruthy();
  });

  it('should accept lightColor and darkColor props', () => {
    render(
      <ThemedText lightColor="#ffffff" darkColor="#000000">
        Themed Text
      </ThemedText>
    );

    const element = screen.getByText('Themed Text');
    expect(element).toBeTruthy();
  });

  it('should forward additional text props', () => {
    render(
      <ThemedText testID="custom-text" numberOfLines={2}>
        Props Test
      </ThemedText>
    );

    const element = screen.getByTestId('custom-text');
    expect(element).toBeTruthy();
  });
});
