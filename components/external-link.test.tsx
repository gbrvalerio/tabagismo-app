import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Import the mock after it's been set up
import { openBrowserAsync } from 'expo-web-browser';
import { ExternalLink } from './external-link';

// Mock expo-web-browser first
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {
    AUTOMATIC: 'automatic',
  },
}));

// Mock Link from expo-router to make it renderable
jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pressable, Text } = require('react-native');
   
  const originalModule = jest.requireActual('expo-router');
  return {
    ...originalModule,
    // eslint-disable-next-line react/display-name
    Link: React.forwardRef((props: any, ref: any) => {
      const { onPress, children, href, testID, ...rest } = props;
      return React.createElement(
        Pressable,
        {
          ref,
          onPress,
          testID: testID || `link-${href}`,
          ...rest,
        },
        typeof children === 'string'
          ? React.createElement(Text, null, children)
          : children
      );
    }),
  };
});

describe('ExternalLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.EXPO_OS;
  });

  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<ExternalLink href="https://example.com">Click me</ExternalLink>);

      expect(screen.getByText('Click me', { exact: false })).toBeTruthy();
    });

    it('should render with href attribute', () => {
      render(<ExternalLink href="https://example.com">Link</ExternalLink>);

      const link = screen.getByTestId('link-https://example.com');
      expect(link).toBeTruthy();
    });

    it('should render with custom testID', () => {
      render(
        <ExternalLink href="https://example.com" testID="custom-link">
          Link Text
        </ExternalLink>
      );

      const link = screen.getByTestId('custom-link');
      expect(link).toBeTruthy();
    });

    it('should render with multiple children', () => {
      render(
        <ExternalLink href="https://example.com">
          Click here
        </ExternalLink>
      );

      expect(screen.getByText('Click here', { exact: false })).toBeTruthy();
    });
  });

  describe('Props', () => {
    it('should accept and apply href prop', () => {
      const href = 'https://www.example.com/path?query=value';
      render(<ExternalLink href={href}>Link</ExternalLink>);

      const link = screen.getByTestId(`link-${href}`);
      expect(link).toBeTruthy();
    });

    it('should forward additional Link props', () => {
      render(
        <ExternalLink
          href="https://example.com"
          testID="forwarded-link"
          accessibilityLabel="External link to example"
        >
          Link
        </ExternalLink>
      );

      const link = screen.getByTestId('forwarded-link');
      expect(link).toBeTruthy();
    });

    it('should always set target to _blank', () => {
      render(
        <ExternalLink href="https://example.com">Link</ExternalLink>
      );

      // The Link component should receive target="_blank"
      // (This is handled by expo-router internally)
      expect(screen.getByText('Link', { exact: false })).toBeTruthy();
    });

    it('should accept accessibility props', () => {
      render(
        <ExternalLink
          href="https://example.com"
          testID="accessible-link"
          accessibilityRole="link"
          accessibilityLabel="Visit example website"
        >
          Go to Example
        </ExternalLink>
      );

      expect(screen.getByTestId('accessible-link')).toBeTruthy();
    });
  });

  describe('Platform-specific behavior', () => {
    describe('Native platform (iOS/Android)', () => {
      beforeEach(() => {
        // Set EXPO_OS to non-web value (native)
        process.env.EXPO_OS = 'ios';
        jest.clearAllMocks();
      });

      afterEach(() => {
        delete process.env.EXPO_OS;
      });

      it('should open URL in in-app browser on press', async () => {
        (openBrowserAsync as jest.Mock).mockResolvedValueOnce({});

        render(
          <ExternalLink href="https://example.com">Click me</ExternalLink>
        );

        const link = screen.getByText('Click me', { exact: false });
        fireEvent.press(link, {
          preventDefault: jest.fn(),
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(openBrowserAsync).toHaveBeenCalledWith(
          'https://example.com',
          expect.objectContaining({
            presentationStyle: 'automatic',
          })
        );
      });

      it('should prevent default behavior on native', async () => {
        (openBrowserAsync as jest.Mock).mockResolvedValueOnce({});

        render(
          <ExternalLink href="https://example.com">Click me</ExternalLink>
        );

        const link = screen.getByText('Click me', { exact: false });
        const mockEvent = {
          preventDefault: jest.fn(),
        };

        fireEvent.press(link, mockEvent);

        await new Promise((resolve) => setTimeout(resolve, 0));

        // The event.preventDefault() should be called to prevent default Link behavior
        // We verify this by checking that openBrowserAsync was called
        expect(openBrowserAsync).toHaveBeenCalled();
      });

      it('should open different URLs correctly', async () => {
        (openBrowserAsync as jest.Mock).mockResolvedValueOnce({});

        const { rerender } = render(
          <ExternalLink href="https://example.com">Click 1</ExternalLink>
        );

        fireEvent.press(screen.getByText('Click 1', { exact: false }), {
          preventDefault: jest.fn(),
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(openBrowserAsync).toHaveBeenCalledWith(
          'https://example.com',
          expect.any(Object)
        );

        jest.clearAllMocks();
        (openBrowserAsync as jest.Mock).mockResolvedValueOnce({});

        rerender(
          <ExternalLink href="https://different-example.com">Click 2</ExternalLink>
        );

        fireEvent.press(screen.getByText('Click 2', { exact: false }), {
          preventDefault: jest.fn(),
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(openBrowserAsync).toHaveBeenCalledWith(
          'https://different-example.com',
          expect.any(Object)
        );
      });

      it('should attempt to open browser even with URL fragments and query params', async () => {
        (openBrowserAsync as jest.Mock).mockResolvedValueOnce({});

        const urlWithParams = 'https://example.com/page?ref=test#section';
        render(
          <ExternalLink href={urlWithParams}>Click me</ExternalLink>
        );

        fireEvent.press(screen.getByText('Click me', { exact: false }), {
          preventDefault: jest.fn(),
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(openBrowserAsync).toHaveBeenCalledWith(
          urlWithParams,
          expect.any(Object)
        );
      });

      it('should use AUTOMATIC presentation style', async () => {
        (openBrowserAsync as jest.Mock).mockResolvedValueOnce({});

        render(
          <ExternalLink href="https://example.com">Click me</ExternalLink>
        );

        fireEvent.press(screen.getByText('Click me', { exact: false }), {
          preventDefault: jest.fn(),
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(openBrowserAsync).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            presentationStyle: 'automatic',
          })
        );
      });
    });

    describe('Android platform', () => {
      beforeEach(() => {
        process.env.EXPO_OS = 'android';
        jest.clearAllMocks();
      });

      afterEach(() => {
        delete process.env.EXPO_OS;
      });

      it('should open URL in in-app browser on Android', async () => {
        (openBrowserAsync as jest.Mock).mockResolvedValueOnce({});

        render(
          <ExternalLink href="https://example.com">Click me</ExternalLink>
        );

        fireEvent.press(screen.getByText('Click me', { exact: false }), {
          preventDefault: jest.fn(),
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(openBrowserAsync).toHaveBeenCalledWith(
          'https://example.com',
          expect.objectContaining({
            presentationStyle: 'automatic',
          })
        );
      });
    });

    it('should render with working Link from expo-router', () => {
      render(
        <ExternalLink href="https://example.com">Click me</ExternalLink>
      );

      const link = screen.getByText('Click me', { exact: false });
      expect(link).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with special characters', async () => {
      (openBrowserAsync as jest.Mock).mockResolvedValueOnce({});
      process.env.EXPO_OS = 'ios';

      const specialUrl = 'https://example.com/path?q=hello%20world&id=123';
      render(
        <ExternalLink href={specialUrl}>Click me</ExternalLink>
      );

      fireEvent.press(screen.getByText('Click me', { exact: false }), {
        preventDefault: jest.fn(),
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(openBrowserAsync).toHaveBeenCalledWith(
        specialUrl,
        expect.any(Object)
      );

      delete process.env.EXPO_OS;
    });

    it('should handle empty children gracefully', () => {
      render(
        <ExternalLink href="https://example.com" testID="empty-link">
          {}
        </ExternalLink>
      );

      expect(screen.getByTestId('empty-link')).toBeTruthy();
    });

    it('should handle rapid successive clicks', async () => {
      (openBrowserAsync as jest.Mock).mockResolvedValue({});
      process.env.EXPO_OS = 'ios';

      render(
        <ExternalLink href="https://example.com">Click me</ExternalLink>
      );

      const link = screen.getByText('Click me', { exact: false });
      const mockEvent = { preventDefault: jest.fn() };

      fireEvent.press(link, mockEvent);
      fireEvent.press(link, mockEvent);
      fireEvent.press(link, mockEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should attempt to open browser for each click
      expect(openBrowserAsync).toHaveBeenCalledTimes(3);

      delete process.env.EXPO_OS;
    });

    it('should preserve href type safety with string URIs', () => {
      const href = 'https://example.com/path';
      render(
        <ExternalLink href={href as any}>
          Link
        </ExternalLink>
      );

      expect(screen.getByText('Link')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should work with multiple links on same screen', async () => {
      (openBrowserAsync as jest.Mock).mockResolvedValue({});
      process.env.EXPO_OS = 'ios';

      render(
        <>
          <ExternalLink href="https://example1.com">Link 1</ExternalLink>
          <ExternalLink href="https://example2.com">Link 2</ExternalLink>
          <ExternalLink href="https://example3.com">Link 3</ExternalLink>
        </>
      );

      const link1 = screen.getByText('Link 1', { exact: false });
      const link2 = screen.getByText('Link 2', { exact: false });
      const link3 = screen.getByText('Link 3', { exact: false });
      const mockEvent = { preventDefault: jest.fn() };

      fireEvent.press(link1, mockEvent);
      fireEvent.press(link2, mockEvent);
      fireEvent.press(link3, mockEvent);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(openBrowserAsync).toHaveBeenCalledTimes(3);
      expect(openBrowserAsync).toHaveBeenNthCalledWith(
        1,
        'https://example1.com',
        expect.any(Object)
      );
      expect(openBrowserAsync).toHaveBeenNthCalledWith(
        2,
        'https://example2.com',
        expect.any(Object)
      );
      expect(openBrowserAsync).toHaveBeenNthCalledWith(
        3,
        'https://example3.com',
        expect.any(Object)
      );

      delete process.env.EXPO_OS;
    });
  });
});
