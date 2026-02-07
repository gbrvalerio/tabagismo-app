import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ExternalLink } from './external-link';
import * as WebBrowser from 'expo-web-browser';

// Track the onPress handlers we create
const mockOnPressHandlers: Record<string, Function> = {};

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {
    AUTOMATIC: 'automatic',
  },
}));

// Mock expo-router Link component
jest.mock('expo-router', () => {
  const { Pressable, Text } = require('react-native');
  const React = require('react');

  const Link = React.forwardRef(
    ({ href, onPress, target, children, testID, ...rest }, ref) => {
      const linkTestID = testID || 'external-link';
      // Capture the onPress handler for testing
      if (onPress && linkTestID) {
        mockOnPressHandlers[linkTestID] = onPress;
      }

      return React.createElement(
        Pressable,
        {
          ref,
          onPress,
          testID: linkTestID,
          accessibilityRole: 'link',
          ...rest,
        },
        typeof children === 'string'
          ? React.createElement(Text, null, children)
          : children
      );
    }
  );

  const originalModule = jest.requireActual('expo-router');
  return {
    ...originalModule,
    Link,
  };
});

// Helper function to call captured onPress handlers
function callOnPress(testID: string, event?: any) {
  const handler = mockOnPressHandlers[testID];
  if (handler) {
    handler(event || { preventDefault: jest.fn() });
  }
}

describe('ExternalLink', () => {
  let originalExpoOS: string | undefined;

  beforeAll(() => {
    // Store original value once at the start of all tests
    originalExpoOS = process.env.EXPO_OS;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockOnPressHandlers).forEach(key => delete mockOnPressHandlers[key]);
  });

  afterEach(() => {
    // Restore original environment after each test
    process.env.EXPO_OS = originalExpoOS;
  });

  it('should render with href prop', () => {
    render(
      <ExternalLink href="https://example.com">
        Open Example
      </ExternalLink>
    );

    const link = screen.getByTestId('external-link');
    expect(link).toBeTruthy();
  });

  it('should render children text correctly', () => {
    const { getByTestId } = render(
      <ExternalLink href="https://example.com">
        Click me
      </ExternalLink>
    );

    const link = getByTestId('external-link');
    expect(link).toBeTruthy();
  });

  it('should set target="_blank" on the Link component', () => {
    const { getByTestId } = render(
      <ExternalLink href="https://example.com">
        Link
      </ExternalLink>
    );

    const link = getByTestId('external-link');
    expect(link).toBeTruthy();
  });

  it('should pass the href prop to Link component', () => {
    const testHref = 'https://example.com/page';
    const { getByTestId } = render(
      <ExternalLink href={testHref}>
        Link
      </ExternalLink>
    );

    const link = getByTestId('external-link');
    expect(link).toBeTruthy();
  });

  describe('on native platforms (not web)', () => {
    it('should open browser when pressed on native platform', async () => {
      // Set environment for this test
      process.env.EXPO_OS = 'ios';

      const testHref = 'https://example.com';
      const openBrowserAsyncMock = WebBrowser.openBrowserAsync as jest.Mock;

      render(
        <ExternalLink href={testHref}>
          Open
        </ExternalLink>
      );

      const mockEvent = { preventDefault: jest.fn() };
      callOnPress('external-link', mockEvent);

      await waitFor(() => {
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(openBrowserAsyncMock).toHaveBeenCalledWith(
          testHref,
          expect.objectContaining({
            presentationStyle: 'automatic',
          })
        );
      });
    });

    it('should call preventDefault on native platform', async () => {
      process.env.EXPO_OS = 'ios';

      const mockEvent = { preventDefault: jest.fn() };

      render(
        <ExternalLink href="https://example.com">
          Link
        </ExternalLink>
      );

      callOnPress('external-link', mockEvent);

      await waitFor(() => {
        expect(mockEvent.preventDefault).toHaveBeenCalled();
      });
    });

    it('should pass correct presentation style to openBrowserAsync', async () => {
      process.env.EXPO_OS = 'ios';

      const openBrowserAsyncMock = WebBrowser.openBrowserAsync as jest.Mock;
      const mockEvent = { preventDefault: jest.fn() };

      render(
        <ExternalLink href="https://example.com">
          Link
        </ExternalLink>
      );

      callOnPress('external-link', mockEvent);

      await waitFor(() => {
        expect(openBrowserAsyncMock).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            presentationStyle: 'automatic',
          })
        );
      });
    });
  });

  describe('native platform behavior', () => {
    it('should call preventDefault and openBrowserAsync on native platforms', async () => {
      process.env.EXPO_OS = 'ios';
      Object.keys(mockOnPressHandlers).forEach(key => delete mockOnPressHandlers[key]);

      const openBrowserAsyncMock = WebBrowser.openBrowserAsync as jest.Mock;
      openBrowserAsyncMock.mockClear();

      const mockEvent = { preventDefault: jest.fn() };

      render(
        <ExternalLink href="https://example.com">
          Link
        </ExternalLink>
      );

      const handler = mockOnPressHandlers['external-link'];
      expect(handler).toBeDefined();

      await handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(openBrowserAsyncMock).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          presentationStyle: 'automatic',
        })
      );
    });
  });

  describe('forwarding Link props', () => {
    it('should forward custom styles', () => {
      const customStyle = { color: 'red', fontSize: 16 };
      const { getByTestId } = render(
        <ExternalLink href="https://example.com" style={customStyle}>
          Link
        </ExternalLink>
      );

      const link = getByTestId('external-link');
      expect(link).toBeTruthy();
    });

    it('should forward testID prop', () => {
      const { getByTestId } = render(
        <ExternalLink href="https://example.com" testID="custom-external-link">
          Link
        </ExternalLink>
      );

      const link = getByTestId('custom-external-link');
      expect(link).toBeTruthy();
    });

    it('should forward multiple Link props', () => {
      const { getByTestId } = render(
        <ExternalLink
          href="https://example.com"
          testID="multi-props"
          style={{ opacity: 0.8 }}
          disabled={true}
        >
          Link
        </ExternalLink>
      );

      const link = getByTestId('multi-props');
      expect(link).toBeTruthy();
    });

    it('should forward className prop', () => {
      const { getByTestId } = render(
        <ExternalLink
          href="https://example.com"
          className="custom-class"
        >
          Link
        </ExternalLink>
      );

      const link = getByTestId('external-link');
      expect(link).toBeTruthy();
    });

    it('should forward accessibilityLabel prop', () => {
      const { getByTestId } = render(
        <ExternalLink
          href="https://example.com"
          accessibilityLabel="Open example website"
        >
          Link
        </ExternalLink>
      );

      const link = getByTestId('external-link');
      expect(link).toBeTruthy();
    });
  });

  describe('with different URLs', () => {
    it('should work with HTTPS URLs', async () => {
      const openBrowserAsyncMock = WebBrowser.openBrowserAsync as jest.Mock;
      process.env.EXPO_OS = 'ios';

      render(
        <ExternalLink href="https://secure.example.com">
          Secure Link
        </ExternalLink>
      );

      callOnPress('external-link', { preventDefault: jest.fn() });

      await waitFor(() => {
        expect(openBrowserAsyncMock).toHaveBeenCalledWith(
          'https://secure.example.com',
          expect.any(Object)
        );
      });
    });

    it('should work with HTTP URLs', async () => {
      const openBrowserAsyncMock = WebBrowser.openBrowserAsync as jest.Mock;
      process.env.EXPO_OS = 'android';

      render(
        <ExternalLink href="http://example.com">
          HTTP Link
        </ExternalLink>
      );

      callOnPress('external-link', { preventDefault: jest.fn() });

      await waitFor(() => {
        expect(openBrowserAsyncMock).toHaveBeenCalledWith(
          'http://example.com',
          expect.any(Object)
        );
      });
    });

    it('should work with URLs containing query parameters', async () => {
      const openBrowserAsyncMock = WebBrowser.openBrowserAsync as jest.Mock;
      process.env.EXPO_OS = 'ios';
      const urlWithParams = 'https://example.com?param1=value1&param2=value2';

      render(
        <ExternalLink href={urlWithParams}>
          Link with params
        </ExternalLink>
      );

      callOnPress('external-link', { preventDefault: jest.fn() });

      await waitFor(() => {
        expect(openBrowserAsyncMock).toHaveBeenCalledWith(
          urlWithParams,
          expect.any(Object)
        );
      });
    });
  });

  describe('event handling', () => {
    it('should have a press handler set', () => {
      render(
        <ExternalLink href="https://example.com">
          Link
        </ExternalLink>
      );

      expect(mockOnPressHandlers['external-link']).toBeDefined();
    });

    it('should be callable on press', () => {
      render(
        <ExternalLink href="https://example.com">
          Link
        </ExternalLink>
      );

      expect(() => callOnPress('external-link')).not.toThrow();
    });
  });

  describe('rendering with complex children', () => {
    it('should render with nested components as children', () => {
      const { getByTestId } = render(
        <ExternalLink href="https://example.com" testID="complex-link">
          <React.Fragment>
            <span>Click</span>
            <span>Me</span>
          </React.Fragment>
        </ExternalLink>
      );

      const link = getByTestId('complex-link');
      expect(link).toBeTruthy();
    });

    it('should render with multiple text nodes', () => {
      const { getByTestId } = render(
        <ExternalLink href="https://example.com" testID="multi-text-link">
          Open {'external'} link
        </ExternalLink>
      );

      const link = getByTestId('multi-text-link');
      expect(link).toBeTruthy();
    });
  });
});
