import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { Href, Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState, AppStateStatus, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SettingsMenuItem } from "@/components/settings/SettingsMenuItem";
import { useAnswers } from "@/db/repositories/questions.repository";
import { colors, spacing } from "@/lib/theme/tokens";

export default function SettingsScreen() {
  const router = useRouter();
  const { data: answers } = useAnswers("onboarding");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const nameAnswer = answers?.find((a) => a.questionKey === "name");
  const userName = nameAnswer?.answer;

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === "granted");
  };

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkNotificationPermission();
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: "Configurações" }} />
      <LinearGradient colors={["#FFFFFF", "#F8F9FB"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
          <View style={styles.content}>
            <SettingsMenuItem
              testID="settings-menu-profile"
              icon={<Text style={styles.emoji}>👤</Text>}
              title="Perfil"
              subtitle={userName}
              onPress={() => router.push("/settings/profile" as Href)}
            />
            <View style={styles.separator} />
            <SettingsMenuItem
              testID="settings-menu-notifications"
              icon={<Text style={styles.emoji}>🔔</Text>}
              title="Notificações"
              subtitle={notificationsEnabled ? "Ativadas" : "Desativadas"}
              onPress={() => router.push("/settings/notifications" as Href)}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    marginTop: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral.gray[200],
    marginLeft: spacing.xl + 40 + spacing.md, // Align with text
  },
  emoji: {
    fontSize: 20,
  },
});
