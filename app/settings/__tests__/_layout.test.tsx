import React from "react";
import { render } from "@testing-library/react-native";

// Mock expo-router with Stack and Stack.Screen
const mockStackScreen = jest.fn((_props) => null);
const mockStack = jest.fn(({ children }) => <>{children}</>);
Object.assign(mockStack, { Screen: mockStackScreen });

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  Stack: mockStack,
}));

import SettingsLayout from "../_layout";

describe("SettingsLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { toJSON } = render(<SettingsLayout />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders a Stack navigator", () => {
    render(<SettingsLayout />);
    expect(mockStack).toHaveBeenCalled();
  });

  it("registers the index screen", () => {
    render(<SettingsLayout />);
    const screenCalls = mockStackScreen.mock.calls;
    const indexScreen = screenCalls.find(
      (call) => call[0]?.name === "index"
    );
    expect(indexScreen).toBeTruthy();
  });

  it("registers the profile screen", () => {
    render(<SettingsLayout />);
    const screenCalls = mockStackScreen.mock.calls;
    const profileScreen = screenCalls.find(
      (call) => call[0]?.name === "profile"
    );
    expect(profileScreen).toBeTruthy();
  });

  it("registers the notifications screen", () => {
    render(<SettingsLayout />);
    const screenCalls = mockStackScreen.mock.calls;
    const notificationsScreen = screenCalls.find(
      (call) => call[0]?.name === "notifications"
    );
    expect(notificationsScreen).toBeTruthy();
  });

  it("uses Poppins_600SemiBold for header title style", () => {
    render(<SettingsLayout />);
    const stackCall = mockStack.mock.calls[0][0];
    const screenOptions = stackCall.screenOptions;
    expect(screenOptions.headerTitleStyle.fontFamily).toBe(
      "Poppins_600SemiBold"
    );
  });

  it("hides header shadow", () => {
    render(<SettingsLayout />);
    const stackCall = mockStack.mock.calls[0][0];
    const screenOptions = stackCall.screenOptions;
    expect(screenOptions.headerShadowVisible).toBe(false);
  });

  it("sets headerBackTitle to empty string", () => {
    render(<SettingsLayout />);
    const stackCall = mockStack.mock.calls[0][0];
    const screenOptions = stackCall.screenOptions;
    expect(screenOptions.headerBackTitle).toBe("");
  });

  it("sets background color matching the theme", () => {
    render(<SettingsLayout />);
    const stackCall = mockStack.mock.calls[0][0];
    const screenOptions = stackCall.screenOptions;
    expect(screenOptions.headerStyle.backgroundColor).toBeDefined();
  });

  it("registers exactly three screens", () => {
    render(<SettingsLayout />);
    expect(mockStackScreen).toHaveBeenCalledTimes(3);
  });
});
