import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { ActivityIndicator, AppState, AppStateStatus, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import "react-native-reanimated";

import { CelebrationDialog } from "@/components/celebration";
import { OnboardingGuard } from "@/components/question-flow/OnboardingGuard";
import { runMigrations } from "@/db";
import { db } from "@/db/client";
import { useAwardCoins, useHasNotificationReward } from "@/db/repositories";
import { questions } from "@/db/schema";
import { TransactionType } from "@/db/schema/coin-transactions";
import { seedOnboardingQuestions } from "@/db/seed/seed-questions";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { queryClient } from "@/lib/query-client";

export const unstable_settings = {
  anchor: "(tabs)",
};

function ErrorFallback({ error }: FallbackProps) {
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Notification permission detection
  const statusRef = useRef<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [notificationCelebration, setNotificationCelebration] = useState(false);
  const { data: hasReward } = useHasNotificationReward();
  const awardCoins = useAwardCoins();

  useEffect(() => {
    async function initDatabase() {
      await runMigrations();
      const existingQuestions = await db.select().from(questions).all();
      if (existingQuestions.length === 0 || __DEV__) {
        await seedOnboardingQuestions();
      }
    }

    initDatabase()
      .then(() => setDbReady(true))
      .catch((error) => {
        console.error("Failed to initialize database:", error);
        setDbReady(true); // Continue anyway to show error boundary
      });
  }, []);

  // AppState listener for notification permission detection
  useEffect(() => {
    // Initialize permission status
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        statusRef.current = status as 'granted' | 'denied' | 'undetermined';
      } catch (error) {
        console.error('Failed to get initial permission status:', error);
      }
    })();

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          try {
            const { status } = await Notifications.getPermissionsAsync();
            const previousStatus = statusRef.current;

            // Check if permission changed from not-granted to granted
            if (previousStatus !== 'granted' && status === 'granted') {
              // Check if already rewarded
              if (!hasReward) {
                // Award coins and show celebration
                await awardCoins.mutateAsync({
                  amount: 15,
                  type: TransactionType.NOTIFICATION_PERMISSION,
                  metadata: {
                    source: 'settings_activation',
                    detectedAt: new Date().toISOString(),
                  },
                });
                setNotificationCelebration(true);
              }
            }

            // Update status ref
            statusRef.current = status as 'granted' | 'denied' | 'undetermined';
          } catch (error) {
            console.error('Failed to check permission status:', error);
          }
        }
      }
    );

    return () => subscription.remove();
  }, [hasReward, awardCoins]);

  if (!dbReady || !fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <OnboardingGuard>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{
                  presentation: "modal",
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="notification-permission"
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
            </Stack>
          </OnboardingGuard>
          <StatusBar style="auto" />

          {/* Global notification celebration */}
          <CelebrationDialog
            visible={notificationCelebration}
            title="Notificações Ativadas!"
            subtitle="Agora você receberá lembretes importantes!"
            coinsEarned={15}
            autoDismissDelay={0}
            onDismiss={() => setNotificationCelebration(false)}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
