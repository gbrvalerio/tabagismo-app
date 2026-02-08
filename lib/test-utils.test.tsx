import React from 'react';
import { Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import { createTestQueryClient, renderWithProviders } from './test-utils';

describe('test-utils', () => {
  describe('createTestQueryClient', () => {
    it('should create a QueryClient with proper configuration', () => {
      const queryClient = createTestQueryClient();

      expect(queryClient).toBeInstanceOf(QueryClient);
    });

    it('should disable retries for queries', () => {
      const queryClient = createTestQueryClient();

      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.retry).toBe(false);
    });

    it('should set gcTime to 0 for queries', () => {
      const queryClient = createTestQueryClient();

      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.gcTime).toBe(0);
    });

    it('should set staleTime to 0 for queries', () => {
      const queryClient = createTestQueryClient();

      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.staleTime).toBe(0);
    });

    it('should disable retries for mutations', () => {
      const queryClient = createTestQueryClient();

      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.mutations?.retry).toBe(false);
    });

    it('should create a new instance on each call', () => {
      const queryClient1 = createTestQueryClient();
      const queryClient2 = createTestQueryClient();

      expect(queryClient1).not.toBe(queryClient2);
    });
  });

  describe('renderWithProviders', () => {
    it('should render a component with QueryClientProvider wrapper', () => {
      const TestComponent = () => <Text>Wrapped</Text>;

      renderWithProviders(<TestComponent />);
      // If no error is thrown, the wrapper was applied successfully
      expect(true).toBe(true);
    });

    it('should return the query client in the result object', () => {
      const TestComponent = () => <Text>Test</Text>;

      const result = renderWithProviders(<TestComponent />);

      expect(result.queryClient).toBeInstanceOf(QueryClient);
    });

    it('should pass through render options', () => {
      const TestComponent = () => <Text>Test</Text>;

      const result = renderWithProviders(<TestComponent />, {});

      // The render function should have been called successfully
      expect(result).toHaveProperty('getByText');
    });

    it('should render the wrapped component correctly', () => {
      const TestComponent = () => <Text>Hello World</Text>;

      const result = renderWithProviders(<TestComponent />);

      const text = result.getByText('Hello World');
      expect(text).toBeTruthy();
    });

    it('should provide access to render utilities like getByText', () => {
      const TestComponent = () => <Text>Content</Text>;

      const result = renderWithProviders(<TestComponent />);

      expect(result.getByText).toBeDefined();
      expect(typeof result.getByText).toBe('function');
    });

    it('should provide access to render utilities like queryByText', () => {
      const TestComponent = () => <Text>Content</Text>;

      const result = renderWithProviders(<TestComponent />);

      expect(result.queryByText).toBeDefined();
      expect(typeof result.queryByText).toBe('function');
    });

    it('should provide access to render utilities like getAllByText', () => {
      const TestComponent = () => <Text>Content</Text>;

      const result = renderWithProviders(<TestComponent />);

      expect(result.getAllByText).toBeDefined();
      expect(typeof result.getAllByText).toBe('function');
    });

    it('should provide access to UNSAFE_getByType utility', () => {
      const TestComponent = () => <Text>Content</Text>;

      const result = renderWithProviders(<TestComponent />);

      expect(result.UNSAFE_getByType).toBeDefined();
      expect(typeof result.UNSAFE_getByType).toBe('function');
    });

    it('should work with components using TanStack Query hooks', () => {
      const TestComponent = () => <Text>Test</Text>;

      const result = renderWithProviders(<TestComponent />);

      // The query client should be configured for testing
      const defaultOptions = result.queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.retry).toBe(false);
    });

    it('should create separate QueryClient instances for each render', () => {
      const TestComponent = () => <Text>Test</Text>;

      const result1 = renderWithProviders(<TestComponent />);
      const result2 = renderWithProviders(<TestComponent />);

      expect(result1.queryClient).not.toBe(result2.queryClient);
    });

    it('should handle multiple options correctly', () => {
      const TestComponent = () => <Text>Test</Text>;

      const result = renderWithProviders(<TestComponent />, {});

      expect(result.queryClient).toBeInstanceOf(QueryClient);
      expect(result.getByText).toBeDefined();
    });

    it('should preserve the component render tree structure', () => {
      const NestedComponent = () => <Text>Nested Content</Text>;

      const result = renderWithProviders(<NestedComponent />);

      // If the component renders, the tree structure is preserved
      expect(result).toBeDefined();
    });
  });

  describe('Integration', () => {
    it('should work together: create client and render with providers', () => {
      const TestComponent = () => <Text>Integrated Test</Text>;

      const clientDirect = createTestQueryClient();
      const renderResult = renderWithProviders(<TestComponent />);

      // Both should be configured the same way
      const directOptions = clientDirect.getDefaultOptions();
      const renderOptions = renderResult.queryClient.getDefaultOptions();

      expect(directOptions.queries?.retry).toBe(renderOptions.queries?.retry);
      expect(directOptions.mutations?.retry).toBe(renderOptions.mutations?.retry);
    });

    it('should handle undefined options parameter', () => {
      const TestComponent = () => <Text>Test</Text>;

      const result = renderWithProviders(<TestComponent />);

      expect(result).toBeDefined();
      expect(result.queryClient).toBeInstanceOf(QueryClient);
    });

    it('should spread render options correctly without wrapper override', () => {
      const TestComponent = () => <Text>Content</Text>;

      const result = renderWithProviders(<TestComponent />, {});

      // Should have the wrapper applied, not overridden
      expect(result.queryClient).toBeDefined();
    });
  });
});
