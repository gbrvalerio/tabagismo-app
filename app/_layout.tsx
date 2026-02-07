import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/lib/query-client';
import { runMigrations } from '@/db';

export const unstable_settings = {
  anchor: '(tabs)',
};

function ErrorFallback({ error }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    runMigrations()
      .then(() => setDbReady(true))
      .catch((error) => {
        console.error('Failed to initialize database:', error);
        setDbReady(true); // Continue anyway to show error boundary
      });
  }, []);

  if (!dbReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
