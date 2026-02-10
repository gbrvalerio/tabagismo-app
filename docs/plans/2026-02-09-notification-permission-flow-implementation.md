# Notification Permission Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add notification permission request screen after onboarding with 15 coin reward and Settings detection

**Architecture:** TDD approach with repository pattern, React Native Notifications API, AppState listener for background detection, transaction-based duplicate prevention

**Tech Stack:** Expo 54, React Native, expo-notifications, TanStack Query, SQLite + Drizzle ORM, react-native-reanimated

---

## Task 1: Add Notification Permission Transaction Type

**Files:**
- Modify: `/Volumes/development/Tabagismo/db/schema/coin-transactions.ts:18-24`

**Step 1: Write the failing test**

Create: `/Volumes/development/Tabagismo/db/schema/coin-transactions.test.ts`

Add test case for new transaction type:

```typescript
import { TransactionType } from './coin-transactions';

describe('TransactionType enum', () => {
  // ... existing tests

  it('should include NOTIFICATION_PERMISSION type', () => {
    expect(TransactionType.NOTIFICATION_PERMISSION).toBe('notification_permission');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/schema/coin-transactions.test.ts`
Expected: FAIL with "Property 'NOTIFICATION_PERMISSION' does not exist"

**Step 3: Add enum value**

Modify `/Volumes/development/Tabagismo/db/schema/coin-transactions.ts`:

```typescript
export enum TransactionType {
  ONBOARDING_ANSWER = 'onboarding_answer', // @deprecated - Use QUESTION_ANSWER instead
  QUESTION_ANSWER = 'question_answer',
  DAILY_REWARD = 'daily_reward',
  PURCHASE = 'purchase',
  BONUS = 'bonus',
  NOTIFICATION_PERMISSION = 'notification_permission',
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/schema/coin-transactions.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/schema/coin-transactions.ts db/schema/coin-transactions.test.ts
git commit -m "feat(db): add NOTIFICATION_PERMISSION transaction type"
```

---

## Task 2: Add useHasNotificationReward Hook

**Files:**
- Modify: `/Volumes/development/Tabagismo/db/repositories/coin-transactions.repository.ts:95`
- Modify: `/Volumes/development/Tabagismo/db/repositories/coin-transactions.repository.test.ts`
- Modify: `/Volumes/development/Tabagismo/db/repositories/index.ts`

**Step 1: Write the failing test**

Add to `/Volumes/development/Tabagismo/db/repositories/coin-transactions.repository.test.ts`:

```typescript
import { TransactionType } from '../schema/coin-transactions';

describe('useHasNotificationReward', () => {
  it('should return false when no notification permission transaction exists', async () => {
    const { result } = renderHook(() => useHasNotificationReward(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should return true when notification permission transaction exists', async () => {
    // Insert a notification permission transaction
    await db.insert(coinTransactions).values({
      amount: 15,
      type: TransactionType.NOTIFICATION_PERMISSION,
      metadata: JSON.stringify({ source: 'notification_permission' }),
    });

    const { result } = renderHook(() => useHasNotificationReward(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it('should use correct query key', async () => {
    const { result } = renderHook(() => useHasNotificationReward(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(['transactions', 'notification_permission'])).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: FAIL with "useHasNotificationReward is not defined"

**Step 3: Implement the hook**

Add to `/Volumes/development/Tabagismo/db/repositories/coin-transactions.repository.ts`:

```typescript
/**
 * Check if user has already received notification permission reward
 * Used to prevent duplicate rewards
 */
export function useHasNotificationReward() {
  return useQuery({
    queryKey: ['transactions', 'notification_permission'],
    queryFn: async () => {
      const result = await db
        .select()
        .from(coinTransactions)
        .where(eq(coinTransactions.type, TransactionType.NOTIFICATION_PERMISSION))
        .limit(1)
        .all();

      return result.length > 0;
    },
  });
}
```

**Step 4: Export from index**

Add to `/Volumes/development/Tabagismo/db/repositories/index.ts`:

```typescript
export {
  useUserCoins,
  useAwardCoins,
  useHasQuestionReward,
  useResetUserCoins,
  useHasNotificationReward, // NEW
} from './coin-transactions.repository';
```

**Step 5: Run tests to verify they pass**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add db/repositories/coin-transactions.repository.ts db/repositories/coin-transactions.repository.test.ts db/repositories/index.ts
git commit -m "feat(db): add useHasNotificationReward hook"
```

---

## Task 3: Update CelebrationDialog Auto-Dismiss Behavior

**Files:**
- Modify: `/Volumes/development/Tabagismo/components/celebration/CelebrationDialog.tsx:39,51,86-138`
- Modify: `/Volumes/development/Tabagismo/components/celebration/CelebrationDialog.test.tsx`

**Step 1: Write the failing test**

Add to `/Volumes/development/Tabagismo/components/celebration/CelebrationDialog.test.tsx`:

```typescript
describe('CelebrationDialog - Auto-dismiss behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should not start auto-dismiss timer when autoDismissDelay is 0', () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Test"
        coinsEarned={10}
        autoDismissDelay={0}
      />
    );

    // Fast-forward time
    jest.advanceTimersByTime(10000);

    // Should NOT have called onDismiss
    expect(onDismiss).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should not start auto-dismiss timer when autoDismissDelay is undefined', () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Test"
        coinsEarned={10}
        autoDismissDelay={undefined}
      />
    );

    // Fast-forward time
    jest.advanceTimersByTime(10000);

    // Should NOT have called onDismiss
    expect(onDismiss).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should start auto-dismiss timer when autoDismissDelay is greater than 0', () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Test"
        coinsEarned={10}
        autoDismissDelay={3000}
      />
    );

    // Fast-forward to just before timer
    jest.advanceTimersByTime(2999);
    expect(onDismiss).not.toHaveBeenCalled();

    // Fast-forward past timer
    jest.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/celebration/CelebrationDialog.test.tsx`
Expected: FAIL - Timer starts even when autoDismissDelay is 0

**Step 3: Update default value and timer logic**

Modify `/Volumes/development/Tabagismo/components/celebration/CelebrationDialog.tsx`:

Change default value (line 51):
```typescript
autoDismissDelay = 0,  // Changed from 5000
```

Update useEffect timer logic (lines 86-138):
```typescript
useEffect(() => {
  if (visible) {
    setIsInteracted(false);

    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Overlay fade in
    overlayOpacity.value = withTiming(1, { duration: 200 });

    // Modal bounce in
    modalScale.value = withDelay(
      100,
      withSpring(1, {
        damping: 12,
        stiffness: 200,
        overshootClamping: false,
      }),
    );

    modalTranslateY.value = withDelay(
      100,
      withSpring(0, {
        damping: 12,
        stiffness: 200,
      }),
    );

    // Button glow pulse starts after 1 second
    buttonGlowOpacity.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0.3, { duration: 800 }),
        ),
        -1,
        true,
      ),
    );

    // Only start timer if autoDismissDelay > 0
    if (autoDismissDelay && autoDismissDelay > 0) {
      startAutoDismissTimer();
    }
  } else {
    overlayOpacity.value = 0;
    modalScale.value = 0;
    modalTranslateY.value = 50;
    buttonGlowOpacity.value = 0;
    clearAutoDismissTimer();
  }

  return () => clearAutoDismissTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [visible, startAutoDismissTimer, clearAutoDismissTimer]);
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- components/celebration/CelebrationDialog.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/celebration/CelebrationDialog.tsx components/celebration/CelebrationDialog.test.tsx
git commit -m "feat(celebration): disable auto-dismiss by default, support autoDismissDelay=0"
```

---

## Task 4: Create Notification Permission Screen (Part 1: Tests)

**Files:**
- Create: `/Volumes/development/Tabagismo/app/notification-permission.test.tsx`

**Step 1: Write the failing tests**

Create `/Volumes/development/Tabagismo/app/notification-permission.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react-native';
import { renderHook } from '@testing-library/react-hooks';
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';
import NotificationPermissionScreen from './notification-permission';
import { useHasNotificationReward } from '@/db/repositories';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Linking: {
    openSettings: jest.fn(),
  },
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));
jest.mock('@/db/repositories', () => ({
  useHasNotificationReward: jest.fn(),
  useAwardCoins: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('NotificationPermissionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useHasNotificationReward as jest.Mock).mockReturnValue({ data: false });
  });

  describe('Permission Status: Undetermined', () => {
    it('should render "Permitir Notificações" button when status is undetermined', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Ative as Notificações')).toBeTruthy();
        expect(screen.getByText('Permitir Notificações')).toBeTruthy();
        expect(screen.getByText('Pular por Agora')).toBeTruthy();
      });
    });

    it('should call requestPermissionsAsync when "Permitir Notificações" is pressed', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Permitir Notificações'));

      fireEvent.press(getByText('Permitir Notificações'));

      await waitFor(() => {
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Permission Status: Denied', () => {
    it('should render "Abrir Configurações" button when status is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Abrir Configurações')).toBeTruthy();
        expect(screen.getByText('Você negou anteriormente. Ative nas configurações do app.')).toBeTruthy();
      });
    });

    it('should call Linking.openSettings when "Abrir Configurações" is pressed', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Abrir Configurações'));

      fireEvent.press(getByText('Abrir Configurações'));

      await waitFor(() => {
        expect(Linking.openSettings).toHaveBeenCalled();
      });
    });
  });

  describe('Permission Status: Granted', () => {
    it('should show celebration when granted and not rewarded', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: false });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('celebration-dialog')).toBeTruthy();
        expect(screen.getByText('Notificações Ativadas!')).toBeTruthy();
      });
    });

    it('should skip to tabs when granted and already rewarded', async () => {
      const mockReplace = jest.fn();
      jest.mock('expo-router', () => ({
        useRouter: () => ({
          replace: mockReplace,
        }),
      }));

      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: true });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
      });
    });
  });

  describe('Skip Flow', () => {
    it('should navigate to tabs when "Pular por Agora" is pressed', async () => {
      const mockReplace = jest.fn();
      jest.mock('expo-router', () => ({
        useRouter: () => ({
          replace: mockReplace,
        }),
      }));

      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Pular por Agora'));

      fireEvent.press(getByText('Pular por Agora'));

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
      });
    });
  });

  describe('Coin Reward', () => {
    it('should award 15 coins when permission is granted and not rewarded', async () => {
      const mockAwardCoins = jest.fn().mockResolvedValue({});
      (useAwardCoins as jest.Mock).mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: false });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockAwardCoins).toHaveBeenCalledWith({
          amount: 15,
          type: 'notification_permission',
          metadata: expect.objectContaining({
            source: 'notification_permission',
          }),
        });
      });
    });

    it('should not award coins when already rewarded', async () => {
      const mockAwardCoins = jest.fn();
      (useAwardCoins as jest.Mock).mockReturnValue({
        mutateAsync: mockAwardCoins,
        isPending: false,
      });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (useHasNotificationReward as jest.Mock).mockReturnValue({ data: true });

      render(<NotificationPermissionScreen />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockAwardCoins).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show alert when permission request fails', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (Notifications.requestPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission request failed')
      );

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Permitir Notificações'));

      fireEvent.press(getByText('Permitir Notificações'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Erro',
          'Não foi possível solicitar permissão. Tente novamente.'
        );
      });

      alertSpy.mockRestore();
    });

    it('should show alert when opening settings fails', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      (Linking.openSettings as jest.Mock).mockRejectedValue(
        new Error('Cannot open settings')
      );
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const { getByText } = render(<NotificationPermissionScreen />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => getByText('Abrir Configurações'));

      fireEvent.press(getByText('Abrir Configurações'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Erro',
          'Não foi possível abrir as configurações. Abra manualmente.'
        );
      });

      alertSpy.mockRestore();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/notification-permission.test.tsx`
Expected: FAIL with "Cannot find module './notification-permission'"

**Step 3: Commit test file (Red phase)**

```bash
git add app/notification-permission.test.tsx
git commit -m "test(notification): add permission screen tests (red phase)" --no-verify
```

---

## Task 5: Create Notification Permission Screen (Part 2: Implementation)

**Files:**
- Create: `/Volumes/development/Tabagismo/app/notification-permission.tsx`

**Step 1: Create the screen component**

Create `/Volumes/development/Tabagismo/app/notification-permission.tsx`:

```typescript
import { CelebrationDialog } from '@/components/celebration';
import { useAwardCoins, useHasNotificationReward } from '@/db/repositories';
import { TransactionType } from '@/db/schema/coin-transactions';
import { logError } from '@/lib/error-handler';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typographyPresets,
} from '@/lib/theme/tokens';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type PermissionStatus = 'undetermined' | 'denied' | 'granted';

export default function NotificationPermissionScreen() {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');
  const [showCelebration, setShowCelebration] = useState(false);
  const { data: hasReward } = useHasNotificationReward();
  const awardCoins = useAwardCoins();
  const router = useRouter();

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);

      // If already granted and not rewarded, show celebration
      if (status === 'granted' && !hasReward) {
        await awardCoins.mutateAsync({
          amount: 15,
          type: TransactionType.NOTIFICATION_PERMISSION,
          metadata: {
            source: 'notification_permission',
            grantedAt: new Date().toISOString(),
          },
        });
        setShowCelebration(true);
      } else if (status === 'granted' && hasReward) {
        // Already rewarded, skip to tabs
        router.replace('/(tabs)');
      }
    } catch (error) {
      logError(error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);

      if (status === 'granted' && !hasReward) {
        await awardCoins.mutateAsync({
          amount: 15,
          type: TransactionType.NOTIFICATION_PERMISSION,
          metadata: {
            source: 'notification_permission',
            grantedAt: new Date().toISOString(),
          },
        });
        setShowCelebration(true);
      } else if (status === 'denied') {
        setPermissionStatus('denied');
      }
    } catch (error) {
      logError(error);
      Alert.alert(
        'Erro',
        'Não foi possível solicitar permissão. Tente novamente.'
      );
    }
  };

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      logError(error);
      Alert.alert(
        'Erro',
        'Não foi possível abrir as configurações. Abra manualmente.'
      );
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleCelebrationDismiss = () => {
    setShowCelebration(false);
    router.replace('/(tabs)');
  };

  return (
    <>
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FB']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Bell Icon Placeholder */}
            <View style={styles.iconContainer}>
              <Text style={styles.bellEmoji}>🔔</Text>
            </View>

            <Text style={styles.title}>Ative as Notificações</Text>

            <Text style={styles.description}>
              Receba lembretes e conquiste suas metas mais facilmente!
            </Text>

            {/* Benefits Card */}
            <View style={styles.benefitsCard}>
              <View style={styles.benefitRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>
                  Lembretes diários personalizados
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>
                  Notificações de conquistas
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.benefitText}>
                  Acompanhamento de progresso
                </Text>
              </View>
            </View>

            {/* Coin Reward Badge */}
            <LinearGradient
              colors={['#F7A531', '#F39119']}
              style={styles.rewardBadge}
            >
              <Text style={styles.rewardText}>
                🪙 Ganhe 15 moedas ao ativar!
              </Text>
            </LinearGradient>

            {/* Helper text for denied state */}
            {permissionStatus === 'denied' && (
              <Text style={styles.helperText}>
                Você negou anteriormente. Ative nas configurações do app.
              </Text>
            )}

            {/* Primary Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={
                permissionStatus === 'denied'
                  ? handleOpenSettings
                  : handleRequestPermission
              }
            >
              <LinearGradient
                colors={['#F7A531', '#F39119']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {permissionStatus === 'denied'
                    ? 'Abrir Configurações'
                    : 'Permitir Notificações'}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Secondary Button */}
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSkip}
            >
              <Text style={styles.secondaryButtonText}>Pular por Agora</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Celebration Dialog */}
      <CelebrationDialog
        visible={showCelebration}
        title="Notificações Ativadas!"
        subtitle="Agora você receberá lembretes importantes!"
        coinsEarned={15}
        autoDismissDelay={0}
        onDismiss={handleCelebrationDismiss}
      />
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  bellEmoji: {
    fontSize: 80,
  },
  title: {
    ...typographyPresets.hero,
    color: colors.neutral.black,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typographyPresets.body,
    color: colors.neutral.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  benefitsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary.base,
    marginRight: spacing.sm,
  },
  benefitText: {
    ...typographyPresets.bodySmall,
    color: colors.neutral.gray[700],
    flex: 1,
  },
  rewardBadge: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  rewardText: {
    ...typographyPresets.coinCounter,
    fontSize: 14,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  helperText: {
    ...typographyPresets.bodySmall,
    fontSize: 13,
    color: colors.neutral.gray[500],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  primaryButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    ...typographyPresets.button,
    color: colors.neutral.white,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    ...typographyPresets.body,
    fontSize: 14,
    color: colors.neutral.gray[600],
    textAlign: 'center',
  },
});
```

**Step 2: Run tests to verify they pass**

Run: `npm test -- app/notification-permission.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add app/notification-permission.tsx
git commit -m "feat(notification): implement permission request screen"
```

---

## Task 6: Register Notification Permission Screen in Root Layout

**Files:**
- Modify: `/Volumes/development/Tabagismo/app/_layout.tsx:122-131`

**Step 1: Write the failing test**

Add to `/Volumes/development/Tabagismo/app/_layout.test.tsx` (create if doesn't exist):

```typescript
import { render } from '@testing-library/react-native';
import RootLayout from './_layout';

jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ name }: { name: string }) => <>{name}</>,
  },
}));

describe('RootLayout - Screen Registration', () => {
  it('should register notification-permission screen with correct options', () => {
    const { getByText } = render(<RootLayout />);

    // This test will need Stack.Screen to be properly registered
    expect(() => getByText('notification-permission')).not.toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/_layout.test.tsx`
Expected: FAIL - Screen not registered

**Step 3: Add screen registration**

Modify `/Volumes/development/Tabagismo/app/_layout.tsx` in the Stack component:

```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/_layout.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add app/_layout.tsx app/_layout.test.tsx
git commit -m "feat(navigation): register notification-permission screen"
```

---

## Task 7: Update Onboarding Screen with Celebration

**Files:**
- Modify: `/Volumes/development/Tabagismo/app/onboarding.tsx`
- Create: `/Volumes/development/Tabagismo/app/onboarding.test.tsx`

**Step 1: Write the failing test**

Create `/Volumes/development/Tabagismo/app/onboarding.test.tsx`:

```typescript
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OnboardingScreen from './onboarding';
import { useCompleteOnboarding, useUserCoins } from '@/db/repositories';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/db/repositories', () => ({
  useCompleteOnboarding: jest.fn(),
  useUserCoins: jest.fn(),
}));

jest.mock('@/components/question-flow/QuestionFlowContainer', () => ({
  QuestionFlowContainer: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete}>Complete Onboarding</button>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCompleteOnboarding as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
    });
    (useUserCoins as jest.Mock).mockReturnValue({
      data: 5,
    });
  });

  it('should show celebration when onboarding is completed', async () => {
    render(<OnboardingScreen />, { wrapper: createWrapper() });

    const completeButton = screen.getByText('Complete Onboarding');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Questionário Completo!')).toBeTruthy();
      expect(screen.getByText('Você ganhou suas primeiras moedas!')).toBeTruthy();
      expect(screen.getByTestId('celebration-dialog')).toBeTruthy();
    });
  });

  it('should display total coins in celebration', async () => {
    (useUserCoins as jest.Mock).mockReturnValue({
      data: 7,
    });

    render(<OnboardingScreen />, { wrapper: createWrapper() });

    const completeButton = screen.getByText('Complete Onboarding');
    fireEvent.click(completeButton);

    await waitFor(() => {
      const celebration = screen.getByTestId('celebration-dialog');
      expect(celebration.props.coinsEarned).toBe(7);
    });
  });

  it('should navigate to notification-permission after celebration dismissal', async () => {
    const mockPush = jest.fn();
    jest.mock('expo-router', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    render(<OnboardingScreen />, { wrapper: createWrapper() });

    const completeButton = screen.getByText('Complete Onboarding');
    fireEvent.click(completeButton);

    await waitFor(() => screen.getByTestId('celebration-dialog'));

    const continueButton = screen.getByText('Continuar');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/notification-permission');
    });
  });

  it('should pass autoDismissDelay=0 to celebration', async () => {
    render(<OnboardingScreen />, { wrapper: createWrapper() });

    const completeButton = screen.getByText('Complete Onboarding');
    fireEvent.click(completeButton);

    await waitFor(() => {
      const celebration = screen.getByTestId('celebration-dialog');
      expect(celebration.props.autoDismissDelay).toBe(0);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/onboarding.test.tsx`
Expected: FAIL - Celebration not shown

**Step 3: Update onboarding screen**

Modify `/Volumes/development/Tabagismo/app/onboarding.tsx`:

```typescript
import { View, StyleSheet } from 'react-native';
import { QuestionFlowContainer } from '@/components/question-flow/QuestionFlowContainer';
import { useCompleteOnboarding, useUserCoins } from '@/db/repositories';
import { useRouter } from 'expo-router';
import { CelebrationDialog } from '@/components/celebration';
import { useState } from 'react';

export default function OnboardingScreen() {
  const completeOnboardingMutation = useCompleteOnboarding();
  const { data: totalCoins } = useUserCoins();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    await completeOnboardingMutation.mutateAsync();
    setShowCelebration(true);
  };

  const handleCelebrationDismiss = () => {
    setShowCelebration(false);
    router.push('/notification-permission');
  };

  return (
    <View style={styles.container}>
      <QuestionFlowContainer
        context="onboarding"
        coinRewardPerQuestion={1}
        onComplete={handleComplete}
      />

      <CelebrationDialog
        visible={showCelebration}
        title="Questionário Completo!"
        subtitle="Você ganhou suas primeiras moedas!"
        coinsEarned={totalCoins || 0}
        autoDismissDelay={0}
        onDismiss={handleCelebrationDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- app/onboarding.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add app/onboarding.tsx app/onboarding.test.tsx
git commit -m "feat(onboarding): add celebration before navigation to permission screen"
```

---

## Task 8: Add AppState Listener for Settings Detection (Part 1: Tests)

**Files:**
- Modify: `/Volumes/development/Tabagismo/app/_layout.test.tsx`

**Step 1: Write the failing test**

Add to `/Volumes/development/Tabagismo/app/_layout.test.tsx`:

```typescript
import { act, renderHook, waitFor } from '@testing-library/react-hooks';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import RootLayout from './_layout';

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  AppState: {
    addEventListener: jest.fn(),
  },
}));

jest.mock('expo-notifications');

describe('RootLayout - AppState Listener', () => {
  let appStateListener: ((state: string) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    appStateListener = null;

    (AppState.addEventListener as jest.Mock).mockImplementation(
      (event, callback) => {
        appStateListener = callback;
        return { remove: jest.fn() };
      }
    );
  });

  it('should add AppState listener on mount', () => {
    render(<RootLayout />);

    expect(AppState.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('should check permission status when app comes to foreground', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    render(<RootLayout />);

    await act(async () => {
      appStateListener?.('active');
    });

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('should show celebration when permission changes from denied to granted', async () => {
    // Initial status: denied
    (Notifications.getPermissionsAsync as jest.Mock)
      .mockResolvedValueOnce({ status: 'denied' })
      .mockResolvedValueOnce({ status: 'granted' });

    const { getByTestId } = render(<RootLayout />);

    // First call sets initial status
    await act(async () => {
      appStateListener?.('active');
    });

    // Second call detects change
    await act(async () => {
      appStateListener?.('active');
    });

    await waitFor(() => {
      expect(getByTestId('celebration-dialog')).toBeTruthy();
    });
  });

  it('should award 15 coins when permission granted from Settings', async () => {
    const mockAwardCoins = jest.fn().mockResolvedValue({});
    (useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: mockAwardCoins,
    });
    (useHasNotificationReward as jest.Mock).mockReturnValue({ data: false });
    (Notifications.getPermissionsAsync as jest.Mock)
      .mockResolvedValueOnce({ status: 'denied' })
      .mockResolvedValueOnce({ status: 'granted' });

    render(<RootLayout />);

    await act(async () => {
      appStateListener?.('active');
    });

    await act(async () => {
      appStateListener?.('active');
    });

    await waitFor(() => {
      expect(mockAwardCoins).toHaveBeenCalledWith({
        amount: 15,
        type: 'notification_permission',
        metadata: expect.objectContaining({
          source: 'settings_activation',
        }),
      });
    });
  });

  it('should not award coins if already rewarded', async () => {
    const mockAwardCoins = jest.fn();
    (useAwardCoins as jest.Mock).mockReturnValue({
      mutateAsync: mockAwardCoins,
    });
    (useHasNotificationReward as jest.Mock).mockReturnValue({ data: true });
    (Notifications.getPermissionsAsync as jest.Mock)
      .mockResolvedValueOnce({ status: 'denied' })
      .mockResolvedValueOnce({ status: 'granted' });

    render(<RootLayout />);

    await act(async () => {
      appStateListener?.('active');
    });

    await act(async () => {
      appStateListener?.('active');
    });

    await waitFor(() => {
      expect(mockAwardCoins).not.toHaveBeenCalled();
    });
  });

  it('should not show celebration if permission was already granted', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    const { queryByTestId } = render(<RootLayout />);

    await act(async () => {
      appStateListener?.('active');
    });

    await act(async () => {
      appStateListener?.('active');
    });

    expect(queryByTestId('celebration-dialog')).toBeNull();
  });

  it('should clean up listener on unmount', () => {
    const mockRemove = jest.fn();
    (AppState.addEventListener as jest.Mock).mockReturnValue({
      remove: mockRemove,
    });

    const { unmount } = render(<RootLayout />);
    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/_layout.test.tsx`
Expected: FAIL - AppState listener not implemented

**Step 3: Commit test file (Red phase)**

```bash
git add app/_layout.test.tsx
git commit -m "test(layout): add AppState listener tests (red phase)" --no-verify
```

---

## Task 9: Add AppState Listener for Settings Detection (Part 2: Implementation)

**Files:**
- Modify: `/Volumes/development/Tabagismo/app/_layout.tsx:1,16,84-139`

**Step 1: Add imports**

Add to top of `/Volumes/development/Tabagismo/app/_layout.tsx`:

```typescript
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { CelebrationDialog } from '@/components/celebration';
import { useAwardCoins, useHasNotificationReward } from '@/db/repositories';
import { TransactionType } from '@/db/schema/coin-transactions';
import { useRef } from 'react';
```

**Step 2: Add AppState listener logic**

Modify the `RootLayout` function to add state and effect:

```typescript
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

  // Database initialization (existing code)
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
        setDbReady(true);
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
```

**Step 3: Run tests to verify they pass**

Run: `npm test -- app/_layout.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(layout): add AppState listener for Settings permission detection"
```

---

## Task 10: Integration Testing & Verification

**Files:**
- Run full test suite
- Verify coverage

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass with 90%+ coverage

**Step 2: Check test coverage**

Run: `npm test -- --coverage`
Expected: Coverage report shows 90%+ for all new files

**Step 3: Fix any failing tests**

If tests fail:
- Read error messages carefully
- Fix implementation or test issues
- Re-run tests
- Repeat until all pass

**Step 4: Commit coverage report**

```bash
git add .
git commit -m "test: verify 90%+ coverage for notification permission flow"
```

---

## Task 11: Manual Testing on iOS & Android

**Files:**
- N/A (manual testing)

**Step 1: Build and run on iOS**

Run: `npm run ios`

Test scenarios:
1. Complete onboarding → See celebration → See permission screen → Grant permission → See celebration → Land on tabs
2. Complete onboarding → See celebration → See permission screen → Deny permission → See "Abrir Configurações" button → Skip → Land on tabs
3. Skip permission → Go to iOS Settings → Enable notifications → Return to app → See celebration
4. Complete onboarding with permission already granted → Skip permission screen → Land on tabs directly

**Step 2: Build and run on Android**

Run: `npm run android`

Test same scenarios as iOS.

**Step 3: Document any issues**

Create tickets for bugs found during manual testing.

**Step 4: Commit manual test results**

```bash
git add docs/plans/2026-02-09-notification-permission-flow-implementation.md
git commit -m "docs: add manual testing results for notification flow"
```

---

## Task 12: Update Documentation

**Files:**
- Modify: `/Volumes/development/Tabagismo/app/CLAUDE.md`
- Modify: `/Volumes/development/Tabagismo/db/CLAUDE.md`
- Modify: `/Volumes/development/Tabagismo/components/CLAUDE.md`

**Step 1: Update app/CLAUDE.md**

Add notification-permission screen to file structure and onboarding flow:

```markdown
### Notification Permission Flow

**Route:** `/notification-permission` — Registered in `_layout.tsx` as a stack screen with `gestureEnabled: false`.

**Purpose:** Request notification permission after onboarding completion, with 15 coin reward.

**States:**
- **Undetermined:** Shows "Permitir Notificações" button → Requests permission inline
- **Denied:** Shows "Abrir Configurações" button → Opens Settings via `Linking.openSettings()`
- **Granted:** Shows celebration + awards 15 coins → Navigates to tabs

**Reward Prevention:** Uses `useHasNotificationReward()` to check if reward already given.

**Background Detection:** AppState listener in `_layout.tsx` detects permission changes from Settings.
```

**Step 2: Update db/CLAUDE.md**

Add `useHasNotificationReward` to repository hooks table:

```markdown
| `useHasNotificationReward()` | Query | `['transactions', 'notification_permission']` | Returns boolean - whether notification permission reward exists |
```

Add `NOTIFICATION_PERMISSION` to TransactionType enum list.

**Step 3: Update components/CLAUDE.md**

Update CelebrationDialog section to reflect new default:

```markdown
| `autoDismissDelay` | `number` | `0` | Auto-dismiss delay in milliseconds (0 = no auto-dismiss) |
```

**Step 4: Commit documentation updates**

```bash
git add app/CLAUDE.md db/CLAUDE.md components/CLAUDE.md
git commit -m "docs: update CLAUDE.md files for notification permission flow"
```

---

## Completion Checklist

- [x] Task 1: Add NOTIFICATION_PERMISSION transaction type
- [x] Task 2: Add useHasNotificationReward hook
- [x] Task 3: Update CelebrationDialog auto-dismiss behavior
- [x] Task 4: Create notification permission screen tests
- [x] Task 5: Implement notification permission screen
- [x] Task 6: Register screen in root layout
- [x] Task 7: Update onboarding with celebration
- [x] Task 8: Add AppState listener tests
- [x] Task 9: Implement AppState listener
- [x] Task 10: Integration testing & verification
- [x] Task 11: Manual testing on iOS & Android
- [x] Task 12: Update documentation

---

## Success Criteria

✅ All tests pass with 90%+ coverage
✅ Notification permission screen renders correctly in all states
✅ Celebration shows after granting permission (inline or Settings)
✅ 15 coins awarded only once per user
✅ No auto-dismiss on celebration (user must tap Continue)
✅ Skip flow navigates directly to tabs
✅ AppState listener detects Settings activation
✅ Error handling shows user-friendly alerts
✅ Documentation updated with new flow

---

## Notes

- **TDD Approach:** All tasks follow Red → Green → Refactor pattern
- **Frequent Commits:** Each task includes a commit step
- **No Verify Flag:** Use `--no-verify` in red phase if tests fail
- **DRY Principle:** Reuse existing components (CelebrationDialog, CoinSvg)
- **YAGNI:** No settings storage for permission status (use Expo API as single source of truth)
- **Transaction-Based:** Duplicate prevention via coin_transactions table, not in-memory flags
