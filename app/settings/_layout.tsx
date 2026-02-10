import { Stack } from "expo-router";

import { colors, typography } from "@/lib/theme/tokens";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontFamily: typography.fontFamily.poppins.semibold,
        },
        headerShadowVisible: false,
        headerBackTitle: "",
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
