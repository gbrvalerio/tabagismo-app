import CoinIcon from "@/assets/images/coin.svg";
import GrayscaleCoinIcon from "@/components/question-flow/GrayscaleCoinIcon";
import { StyleSheet, View } from "react-native";

interface CoinSvgProps {
  size?: number;
  variant?: "outlined" | "filled";
  showGlow?: boolean;
  testID?: string;
}

export function CoinSvg({
  size = 24,
  variant = "filled",
  showGlow = false,
  testID = "coin-svg",
}: CoinSvgProps) {
  const CoinComponent = variant === "outlined" ? GrayscaleCoinIcon : CoinIcon;

  const containerStyle = [
    { width: size, height: size },
    showGlow && styles.glow,
  ];

  return (
    <View testID={`${testID}-container`} style={containerStyle}>
      <CoinComponent
        testID={testID}
        width={size}
        height={size}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    shadowColor: "#F7A531",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});
