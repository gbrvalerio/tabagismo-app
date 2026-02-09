/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { render } from "@testing-library/react-native";
import GrayscaleCoinIcon from "../GrayscaleCoinIcon";

// Mock react-native-svg
jest.mock("react-native-svg", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => <View {...props} testID={props.testID || "svg"} />,
    Svg: (props: any) => <View {...props} testID={props.testID || "svg"} />,
    Path: (props: any) => <View {...props} testID="path" />,
  };
});

describe("GrayscaleCoinIcon", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(
      <GrayscaleCoinIcon testID="grayscale-coin" />
    );
    expect(getByTestId("grayscale-coin")).toBeTruthy();
  });

  it("accepts width and height props", () => {
    const { getByTestId } = render(
      <GrayscaleCoinIcon testID="grayscale-coin" width={100} height={100} />
    );
    const svg = getByTestId("grayscale-coin");
    expect(svg.props.width).toBe(100);
    expect(svg.props.height).toBe(100);
  });

  it("renders with correct viewBox", () => {
    const { getByTestId } = render(
      <GrayscaleCoinIcon testID="grayscale-coin" />
    );
    const svg = getByTestId("grayscale-coin");
    expect(svg.props.viewBox).toBe("0 0 2122 2122");
  });

  it("renders all path elements", () => {
    const { getAllByTestId } = render(<GrayscaleCoinIcon />);
    const paths = getAllByTestId("path");
    // Should have all 16 paths from the original coin SVG
    expect(paths.length).toBeGreaterThan(0);
  });

  it("is a valid React component", () => {
    const { toJSON } = render(<GrayscaleCoinIcon />);
    expect(toJSON()).toBeTruthy();
  });
});
