import React from "react";
import { render } from "@testing-library/react-native";
import GrayscaleCoinIcon from "../GrayscaleCoinIcon";

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

  it("renders all SVG paths", () => {
    const { UNSAFE_getByType } = render(<GrayscaleCoinIcon />);
    const svg = UNSAFE_getByType("RNSVGSvg");
    expect(svg).toBeTruthy();
  });

  it("uses gray colors instead of gold", () => {
    const { UNSAFE_getAllByType } = render(<GrayscaleCoinIcon />);
    const paths = UNSAFE_getAllByType("RNSVGPath");

    // Check that some paths use gray colors
    const fills = paths.map(path => path.props.fill).filter(Boolean);

    // Should have gray colors, not gold
    const hasGrayColors = fills.some(fill =>
      fill && (
        fill.includes("#BDBDBD") ||
        fill.includes("#9E9E9E") ||
        fill.includes("#757575") ||
        fill.includes("#616161") ||
        fill.includes("#424242") ||
        fill.includes("#E0E0E0")
      )
    );

    // Should not have gold colors
    const hasGoldColors = fills.some(fill =>
      fill && (
        fill.includes("#F7A531") ||
        fill.includes("#F39117") ||
        fill.includes("#ED8118") ||
        fill.includes("#EE7016") ||
        fill.includes("#C54B17") ||
        fill.includes("#FDC74E")
      )
    );

    expect(hasGrayColors).toBe(true);
    expect(hasGoldColors).toBe(false);
  });

  it("maintains same viewBox as original coin", () => {
    const { UNSAFE_getByType } = render(<GrayscaleCoinIcon />);
    const svg = UNSAFE_getByType("RNSVGSvg");
    expect(svg.props.viewBox).toBe("0 0 2122 2122");
  });
});
