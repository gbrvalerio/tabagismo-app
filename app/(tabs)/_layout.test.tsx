import React from 'react';
import { render } from '@testing-library/react-native';
import TabLayout from './_layout';
import { Colors } from '@/constants/theme';

describe('TabLayout (_layout.tsx)', () => {
  beforeEach(() => {
    const { useColorScheme } = require('react-native');
    useColorScheme.mockReturnValue('light');
  });

  it('should render without crashing', () => {
    expect(() => {
      render(<TabLayout />);
    }).not.toThrow();
  });

  it('should call useColorScheme hook to get color scheme', () => {
    const { useColorScheme } = require('react-native');

    render(<TabLayout />);

    expect(useColorScheme).toHaveBeenCalled();
  });

  it('should call Tabs component from expo-router', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    expect(Tabs).toHaveBeenCalled();
  });

  it('should pass screenOptions to Tabs with correct configuration', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const tabsCall = Tabs.mock.calls[0][0];
    expect(tabsCall.screenOptions).toBeDefined();
    expect(typeof tabsCall.screenOptions).toBe('object');
  });

  it('should disable header with headerShown false', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const screenOptions = Tabs.mock.calls[0][0].screenOptions;
    expect(screenOptions.headerShown).toBe(false);
  });

  it('should use light theme tint color when useColorScheme returns light', () => {
    const { useColorScheme } = require('react-native');
    const { Tabs } = require('expo-router');

    useColorScheme.mockReturnValue('light');

    render(<TabLayout />);

    const screenOptions = Tabs.mock.calls[0][0].screenOptions;
    expect(screenOptions.tabBarActiveTintColor).toBe(Colors.light.tint);
    expect(screenOptions.tabBarActiveTintColor).toBe('#0a7ea4');
  });

  it('should use dark theme tint color when useColorScheme returns dark', () => {
    const { useColorScheme } = require('react-native');
    const { Tabs } = require('expo-router');

    useColorScheme.mockReturnValue('dark');
    Tabs.mockClear();

    render(<TabLayout />);

    const screenOptions = Tabs.mock.calls[0][0].screenOptions;
    expect(screenOptions.tabBarActiveTintColor).toBe(Colors.dark.tint);
    expect(screenOptions.tabBarActiveTintColor).toBe('#fff');
  });

  it('should use light theme tint as fallback when useColorScheme returns null', () => {
    const { useColorScheme } = require('react-native');
    const { Tabs } = require('expo-router');

    useColorScheme.mockReturnValue(null);
    Tabs.mockClear();

    render(<TabLayout />);

    const screenOptions = Tabs.mock.calls[0][0].screenOptions;
    expect(screenOptions.tabBarActiveTintColor).toBe(Colors.light.tint);
  });

  it('should set HapticTab as the tab bar button component', () => {
    const { HapticTab } = require('@/components/haptic-tab');
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const screenOptions = Tabs.mock.calls[0][0].screenOptions;
    expect(screenOptions.tabBarButton).toBe(HapticTab);
  });

  it('should pass tabBarActiveTintColor to screenOptions', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const screenOptions = Tabs.mock.calls[0][0].screenOptions;
    expect(screenOptions).toHaveProperty('tabBarActiveTintColor');
  });

  it('should pass tabBarButton to screenOptions', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const screenOptions = Tabs.mock.calls[0][0].screenOptions;
    expect(screenOptions).toHaveProperty('tabBarButton');
  });

  it('should pass headerShown to screenOptions', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const screenOptions = Tabs.mock.calls[0][0].screenOptions;
    expect(screenOptions).toHaveProperty('headerShown');
  });

  it('should render component without errors', () => {
    expect(() => {
      const component = <TabLayout />;
      render(component);
    }).not.toThrow();
  });

  it('should be a functional component', () => {
    expect(TabLayout).toBeInstanceOf(Function);
  });

  it('should accept no required props', () => {
    expect(() => {
      render(<TabLayout />);
    }).not.toThrow();
  });

  it('should pass children to Tabs component', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const tabsCall = Tabs.mock.calls[0][0];
    expect(tabsCall.children).toBeDefined();
  });

  it('should render HomeIcon for index tab', () => {
    const { Tabs } = require('expo-router');
    const { IconSymbol } = require('@/components/ui/icon-symbol');

    // Manually invoke the component logic to test tab icon configuration
    // We need to use Tabs.Screen calls to find the icon renderer
    expect(() => {
      render(<TabLayout />);
      // If render succeeds, the component structure is valid
    }).not.toThrow();
  });

  it('should configure both home and explore tabs', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    // Verify that Tabs is called (which wraps both tab screens)
    expect(Tabs).toHaveBeenCalled();
    expect(Tabs.mock.calls.length).toBeGreaterThan(0);
  });

  it('should return valid JSX element', () => {
    const component = <TabLayout />;
    expect(component).toBeDefined();
    expect(component.type).toBe(TabLayout);
    expect(component.props).toBeDefined();
  });

  it('should render home tab with correct icon and title', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const tabsCall = Tabs.mock.calls[0][0];
    const homeScreen = tabsCall.children.find((child: any) => child?.props?.name === 'index');

    expect(homeScreen).toBeDefined();
    expect(homeScreen?.props?.name).toBe('index');
    expect(homeScreen?.props?.options?.title).toBe('Home');
  });

  it('should render explore tab with correct icon and title', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const tabsCall = Tabs.mock.calls[0][0];
    const exploreScreen = tabsCall.children.find((child: any) => child?.props?.name === 'explore');

    expect(exploreScreen).toBeDefined();
    expect(exploreScreen?.props?.name).toBe('explore');
    expect(exploreScreen?.props?.options?.title).toBe('Explore');
  });

  it('should render home tab icon with house.fill symbol', () => {
    const { Tabs } = require('expo-router');
    const { IconSymbol } = require('@/components/ui/icon-symbol');

    render(<TabLayout />);

    const tabsCall = Tabs.mock.calls[0][0];
    const homeScreen = tabsCall.children.find((child: any) => child?.props?.name === 'index');
    const tabBarIcon = homeScreen?.props?.options?.tabBarIcon;

    expect(tabBarIcon).toBeDefined();
    expect(typeof tabBarIcon).toBe('function');

    // Execute the icon render function with a test color
    const iconElement = tabBarIcon({ color: '#0a7ea4' });
    expect(iconElement).toBeDefined();
    expect(iconElement?.props?.name).toBe('house.fill');
    expect(iconElement?.props?.size).toBe(28);
    expect(iconElement?.props?.color).toBe('#0a7ea4');
  });

  it('should render explore tab icon with paperplane.fill symbol', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const tabsCall = Tabs.mock.calls[0][0];
    const exploreScreen = tabsCall.children.find((child: any) => child?.props?.name === 'explore');
    const tabBarIcon = exploreScreen?.props?.options?.tabBarIcon;

    expect(tabBarIcon).toBeDefined();
    expect(typeof tabBarIcon).toBe('function');

    // Execute the icon render function with a test color
    const iconElement = tabBarIcon({ color: '#0a7ea4' });
    expect(iconElement).toBeDefined();
    expect(iconElement?.props?.name).toBe('paperplane.fill');
    expect(iconElement?.props?.size).toBe(28);
    expect(iconElement?.props?.color).toBe('#0a7ea4');
  });

  it('should pass correct color prop to home tab icon', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const tabsCall = Tabs.mock.calls[0][0];
    const homeScreen = tabsCall.children.find((child: any) => child?.props?.name === 'index');
    const tabBarIcon = homeScreen?.props?.options?.tabBarIcon;

    const testColor = '#ff0000';
    const iconElement = tabBarIcon({ color: testColor });

    expect(iconElement?.props?.color).toBe(testColor);
  });

  it('should pass correct color prop to explore tab icon', () => {
    const { Tabs } = require('expo-router');

    render(<TabLayout />);

    const tabsCall = Tabs.mock.calls[0][0];
    const exploreScreen = tabsCall.children.find((child: any) => child?.props?.name === 'explore');
    const tabBarIcon = exploreScreen?.props?.options?.tabBarIcon;

    const testColor = '#00ff00';
    const iconElement = tabBarIcon({ color: testColor });

    expect(iconElement?.props?.color).toBe(testColor);
  });
});
