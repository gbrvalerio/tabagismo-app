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
        headerBackButtonDisplayMode: "minimal", // Shows only chevron icon without text
        headerTintColor: colors.neutral.black, // Black tint for back button
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
