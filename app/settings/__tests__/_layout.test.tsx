/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { render } from "@testing-library/react-native";

import SettingsLayout from "../_layout";

// Must define mocks inside the factory to avoid hoisting issues
jest.mock("expo-router", () => {
  const React = require("react");
  const mockStackScreen = jest.fn((_props: any) => null);
  const mockStack = jest.fn(({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children)
  );
  Object.assign(mockStack, { Screen: mockStackScreen });
  return { Stack: mockStack };
});

// Get references to the mocks after they are created
const { Stack } = require("expo-router");
const mockStack = Stack as jest.Mock;
const mockStackScreen = Stack.Screen as jest.Mock;

describe("SettingsLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(() => render(<SettingsLayout />)).not.toThrow();
  });

  it("renders a Stack navigator", () => {
    render(<SettingsLayout />);
    expect(mockStack).toHaveBeenCalled();
  });

  it("registers the index screen", () => {
    render(<SettingsLayout />);
    const screenCalls = mockStackScreen.mock.calls;
    const indexScreen = screenCalls.find(
      (call: any[]) => call[0]?.name === "index"
    );
    expect(indexScreen).toBeTruthy();
  });

  it("registers the profile screen", () => {
    render(<SettingsLayout />);
    const screenCalls = mockStackScreen.mock.calls;
    const profileScreen = screenCalls.find(
      (call: any[]) => call[0]?.name === "profile"
    );
    expect(profileScreen).toBeTruthy();
  });

  it("registers the notifications screen", () => {
    render(<SettingsLayout />);
    const screenCalls = mockStackScreen.mock.calls;
    const notificationsScreen = screenCalls.find(
      (call: any[]) => call[0]?.name === "notifications"
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

  it("uses the app background primary color", () => {
    render(<SettingsLayout />);
    const stackCall = mockStack.mock.calls[0][0];
    const screenOptions = stackCall.screenOptions;
    expect(screenOptions.headerStyle.backgroundColor).toBe("#F8F9FE");
  });

  it("registers exactly three screens", () => {
    render(<SettingsLayout />);
    expect(mockStackScreen).toHaveBeenCalledTimes(3);
  });
});
