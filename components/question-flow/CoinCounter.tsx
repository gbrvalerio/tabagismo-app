import { useUserCoins } from "@/db";
import { spacing, typographyPresets } from "@/lib/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { CoinSvg } from "./CoinSvg";

interface CoinCounterProps {
  testID?: string;
}

export function CoinCounter({ testID }: CoinCounterProps) {
  const { data: coins = 0, isLoading } = useUserCoins();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (coins > 0) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
  }, [coins, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Ensure we always display a number
  const displayValue = isLoading ? "..." : String(coins);

  return (
    <Animated.View testID={testID} style={animatedStyle}>
      <LinearGradient
        testID={testID ? `${testID}-gradient` : "coin-counter-gradient"}
        colors={["#F7A531", "#F39119"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <CoinSvg size={24} variant="filled" />
        <Text style={styles.count}>{displayValue}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md - 4, // 12px
    borderRadius: 9999,
    shadowColor: "#F7A531",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  count: {
    ...typographyPresets.coinCounter,
    color: "#FFFFFF",
    marginLeft: spacing.xs + 2, // 6px gap between coin and count
  },
});
