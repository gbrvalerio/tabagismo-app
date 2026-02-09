# Notification Permission Flow with Gamification

**Date:** 2026-02-09
**Status:** Approved
**Author:** Claude Code (Brainstorming Session)

---

## Overview

Add a notification permission request screen after onboarding completion, with celebration dialogs and coin rewards to incentivize users to enable notifications. The system detects permission changes (including via Settings) and rewards users appropriately.

---

## Goals

1. Request notification permission at the optimal moment (after onboarding completion)
2. Reward users for enabling notifications (15 coins)
3. Detect when users enable notifications via Settings
4. Provide clear paths for both inline permission and Settings navigation
5. Allow users to skip if they prefer
6. Prevent duplicate rewards

---

## User Flow

### Happy Path

1. **Onboarding Questions** (`/onboarding`)
   - User answers all questions (existing behavior)
   - Each question awards 1 coin via `useAwardCoins()`
   - CoinTrail shows progress

2. **Onboarding Completion Celebration**
   - After last question answered, show `CelebrationDialog`
   - Display total coins earned from questions (sum from `useUserCoins()`)
   - Title: "Questionário Completo!"
   - Subtitle: "Você ganhou suas primeiras moedas!"
   - User must tap "Continuar" (no auto-dismiss: `autoDismissDelay={0}`)
   - Navigate to `/notification-permission`

3. **Notification Permission Screen** (`/notification-permission`)
   - New full-screen route (not modal, not part of onboarding)
   - Gradient background matches onboarding aesthetic
   - Explains benefits of notifications
   - Shows coin reward badge: "🪙 Ganhe 15 moedas ao ativar!"
   - Two permission state paths:
     - **Path A (Undetermined):** Shows "Permitir Notificações" button → Requests via `Notifications.requestPermissionsAsync()`
     - **Path B (Denied):** Shows "Abrir Configurações" button → Opens app settings via `Linking.openSettings()`
   - Always shows "Pular por Agora" button

4. **Permission Granted Flow**
   - If granted (inline or from Settings), show celebration
   - Award 15 coins via `useAwardCoins()` with type `NOTIFICATION_PERMISSION`
   - Check `useHasNotificationReward()` to prevent duplicates
   - Title: "Notificações Ativadas!"
   - Subtitle: "Agora você receberá lembretes importantes!"
   - User taps "Continuar" (no auto-dismiss)
   - Navigate to `/(tabs)`

5. **Permission Denied/Skipped Flow**
   - User taps "Pular por Agora"
   - Navigate directly to `/(tabs)` without celebration
   - No coins awarded
   - User can enable later (will be detected by AppState listener)

### Background Detection Flow

6. **Settings Activation Detection** (Global)
   - `AppState` listener in root layout (`_layout.tsx`)
   - On app foreground, check if permission status changed to "granted"
   - If changed AND not already rewarded, show celebration + award 15 coins
   - Uses `useRef` to track previous status
   - Prevents duplicate rewards via `useHasNotificationReward()`

---

## Architecture

### Routing Structure

```
/app
  /onboarding.tsx              # Modified: Add celebration before navigation
  /notification-permission.tsx # NEW: Full-screen permission request
  /(tabs)                      # Existing: Main app
  /_layout.tsx                 # Modified: Add screen config + AppState listener
```

### Component Flow

```
┌─────────────────────────────────────────────────────────┐
│ Onboarding Screen                                       │
│ - QuestionFlowContainer awards 1 coin per question     │
│ - After last question: Show celebration                │
│ - CelebrationDialog (total coins, no auto-dismiss)     │
│ - Navigate to /notification-permission                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Notification Permission Screen                          │
│ - Check permission status on mount                      │
│ - Show appropriate UI based on status                   │
│                                                          │
│ Status: Undetermined                                    │
│   → Button: "Permitir Notificações"                     │
│   → Action: Request permission inline                   │
│                                                          │
│ Status: Denied                                          │
│   → Button: "Abrir Configurações"                       │
│   → Action: Open Settings via Linking                   │
│                                                          │
│ Status: Granted                                         │
│   → Show celebration (if not rewarded)                  │
│   → Award 15 coins                                      │
│   → Navigate to tabs                                    │
│                                                          │
│ Always: "Pular por Agora" button → Navigate to tabs    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Main App (Tabs)                                         │
│ - AppState listener detects permission changes          │
│ - If permission granted from Settings: Show celebration │
└─────────────────────────────────────────────────────────┘
```

---

## UI Design

### Notification Permission Screen

**File:** `/app/notification-permission.tsx`

#### Layout
- Full-screen LinearGradient background: `#FFFFFF → #F8F9FB`
- SafeAreaView wrapper
- Centered content with vertical spacing

#### Visual Elements

**Bell Icon:**
- Large icon (~80px) at top
- Primary color with subtle pulse animation
- Can use Expo notifications bell or custom SVG

**Title:**
- "Ative as Notificações"
- Poppins Bold, 28px
- Color: `colors.neutral.black`
- Centered

**Description:**
- "Receba lembretes e conquiste suas metas mais facilmente!"
- Poppins Regular, 16px
- Color: `colors.neutral.gray[600]`
- Centered
- Margin bottom: `spacing.lg`

**Benefits List:**
- Container with white background card
- Border radius: `borderRadius.lg`
- Padding: `spacing.lg`
- 3-4 bullet points with checkmark icons:
  - "✓ Lembretes diários personalizados"
  - "✓ Notificações de conquistas"
  - "✓ Acompanhamento de progresso"
- Poppins Regular, 14px
- Left-aligned

**Coin Reward Badge:**
- Below benefits list
- Pill-shaped container
- LinearGradient background: `#F7A531 → #F39119` (same as CoinCounter)
- Text: "🪙 Ganhe 15 moedas ao ativar!"
- Poppins SemiBold, 14px
- White text color
- Centered

#### Button States

**State 1: Permission Undetermined**
- Primary button: "Permitir Notificações"
  - Full width gradient button (same as CoinCounter gradient)
  - Poppins Bold, 16px
  - White text
  - Border radius: `borderRadius.lg`
  - Padding: `spacing.md` vertical, `spacing.xl` horizontal
  - Haptic feedback on press
  - Scale animation (0.97) on press
- Secondary button: "Pular por Agora"
  - Ghost/text button
  - Poppins Regular, 14px
  - Color: `colors.neutral.gray[600]`
  - No background
  - Margin top: `spacing.md`

**State 2: Permission Denied**
- Primary button: "Abrir Configurações"
  - Same styling as "Permitir Notificações"
- Helper text above button:
  - "Você negou anteriormente. Ative nas configurações do app."
  - Poppins Regular, 13px
  - Color: `colors.neutral.gray[500]`
  - Centered
  - Margin bottom: `spacing.sm`
- Secondary button: "Pular por Agora" (same as State 1)

**State 3: Permission Granted**
- Automatically show celebration and navigate
- No buttons displayed (transient state)

#### Animations
- Screen fade in on mount (300ms)
- Bell icon subtle pulse: scale 1.0 → 1.05 (infinite loop, 2s duration)
- Button press scale: 0.97 with spring physics
- Haptic feedback on button press

#### Navigation Behavior
- No back button (prevent navigation back to onboarding)
- `gestureEnabled: false` to disable swipe back
- Similar to onboarding screen behavior

---

## Celebration Dialog Updates

### Current Behavior
- `autoDismissDelay` defaults to `5000ms`
- Timer starts on mount
- User interaction cancels timer

### New Behavior
- If `autoDismissDelay` is `0` or `undefined` → No auto-dismiss timer
- If `autoDismissDelay > 0` → Auto-dismiss after delay (existing behavior)

### Implementation Change

**File:** `/components/celebration/CelebrationDialog.tsx`

```typescript
// Change default from 5000 to 0
autoDismissDelay = 0

// In useEffect, only start timer if > 0
if (autoDismissDelay && autoDismissDelay > 0) {
  startAutoDismissTimer();
}
```

### Usage Patterns

**Onboarding Completion Celebration:**
```typescript
<CelebrationDialog
  visible={showOnboardingCelebration}
  title="Questionário Completo!"
  subtitle="Você ganhou suas primeiras moedas!"
  coinsEarned={totalCoinsFromQuestions}
  autoDismissDelay={0} // No auto-dismiss
  onDismiss={() => {
    setShowOnboardingCelebration(false);
    router.push('/notification-permission');
  }}
/>
```

**Notification Permission Celebration:**
```typescript
<CelebrationDialog
  visible={showNotificationCelebration}
  title="Notificações Ativadas!"
  subtitle="Agora você receberá lembretes importantes!"
  coinsEarned={15}
  autoDismissDelay={0} // No auto-dismiss
  onDismiss={() => {
    setShowNotificationCelebration(false);
    router.replace('/(tabs)');
  }}
/>
```

---

## Database Changes

### New Transaction Type

**File:** `/db/schema/coin-transactions.ts`

Add new enum value:
```typescript
export enum TransactionType {
  ONBOARDING_ANSWER = 'onboarding_answer', // @deprecated
  QUESTION_ANSWER = 'question_answer',
  DAILY_REWARD = 'daily_reward',
  PURCHASE = 'purchase',
  BONUS = 'bonus',
  NOTIFICATION_PERMISSION = 'notification_permission', // NEW
}
```

### New Repository Hook

**File:** `/db/repositories/coin-transactions.repository.ts`

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

**Export from:** `/db/repositories/index.ts`

### Awarding Notification Coins

```typescript
const awardCoins = useAwardCoins();
const { data: hasReward } = useHasNotificationReward();

// Only award if not already rewarded
if (!hasReward) {
  await awardCoins.mutateAsync({
    amount: 15,
    type: TransactionType.NOTIFICATION_PERMISSION,
    metadata: JSON.stringify({
      source: 'notification_permission',
      grantedAt: new Date().toISOString()
    })
  });
}
```

### No Settings Storage

**Decision:** Do NOT store notification permission status in settings table.

**Rationale:**
- Single source of truth: Expo Notifications API
- No sync issues or stale data
- API check is fast and reliable
- Simpler implementation (YAGNI)

---

## Implementation Details

### Notification Permission Screen

**File:** `/app/notification-permission.tsx`

#### Permission Status Flow

```typescript
import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

export default function NotificationPermissionScreen() {
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'denied' | 'granted'>('undetermined');
  const [showCelebration, setShowCelebration] = useState(false);
  const { data: hasReward } = useHasNotificationReward();
  const awardCoins = useAwardCoins();
  const router = useRouter();

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);

    // If already granted and not rewarded, show celebration
    if (status === 'granted' && !hasReward) {
      await awardCoins.mutateAsync({
        amount: 15,
        type: TransactionType.NOTIFICATION_PERMISSION,
        metadata: JSON.stringify({ source: 'notification_permission' })
      });
      setShowCelebration(true);
    } else if (status === 'granted' && hasReward) {
      // Already rewarded, skip to tabs
      router.replace('/(tabs)');
    }
  };

  const handleRequestPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted' && !hasReward) {
        await awardCoins.mutateAsync({
          amount: 15,
          type: TransactionType.NOTIFICATION_PERMISSION,
          metadata: JSON.stringify({ source: 'notification_permission' })
        });
        setShowCelebration(true);
      } else if (status === 'denied') {
        // Update UI to show Settings button
        setPermissionStatus('denied');
      }
    } catch (error) {
      logError(error);
      Alert.alert('Erro', 'Não foi possível solicitar permissão. Tente novamente.');
    }
  };

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
      // AppState listener in _layout.tsx will handle detection
    } catch (error) {
      logError(error);
      Alert.alert('Erro', 'Não foi possível abrir as configurações. Abra manualmente.');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleCelebrationDismiss = () => {
    setShowCelebration(false);
    router.replace('/(tabs)');
  };

  // Render based on permission status...
}
```

#### Error Handling

**Permission Request Errors:**
- Catch and log via `logError()`
- Show user-friendly alert: "Não foi possível solicitar permissão. Tente novamente."
- Keep button enabled for retry

**Settings Opening Errors:**
- Catch and log via `logError()`
- Show alert: "Não foi possível abrir as configurações. Abra manualmente."
- Provide fallback instructions

### Root Layout Updates

**File:** `/app/_layout.tsx`

#### Screen Registration

```typescript
<Stack>
  {/* Existing screens */}
  <Stack.Screen name="onboarding" options={{ headerShown: false }} />

  {/* NEW: Notification permission screen */}
  <Stack.Screen
    name="notification-permission"
    options={{
      headerShown: false,
      gestureEnabled: false // Prevent swipe back
    }}
  />

  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
</Stack>
```

#### AppState Listener for Settings Detection

```typescript
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
  const statusRef = useRef<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [notificationCelebration, setNotificationCelebration] = useState(false);
  const { data: hasReward } = useHasNotificationReward();
  const awardCoins = useAwardCoins();

  useEffect(() => {
    // Initialize permission status
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      statusRef.current = status;
    })();

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
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
              metadata: JSON.stringify({
                source: 'settings_activation',
                detectedAt: new Date().toISOString()
              })
            });
            setNotificationCelebration(true);
          }
        }

        // Update status ref
        statusRef.current = status;
      }
    });

    return () => subscription.remove();
  }, [hasReward, awardCoins]);

  return (
    <>
      {/* Existing layout */}
      <Stack>...</Stack>

      {/* Global notification celebration */}
      <CelebrationDialog
        visible={notificationCelebration}
        title="Notificações Ativadas!"
        subtitle="Agora você receberá lembretes importantes!"
        coinsEarned={15}
        autoDismissDelay={0}
        onDismiss={() => setNotificationCelebration(false)}
      />
    </>
  );
}
```

### Onboarding Screen Updates

**File:** `/app/onboarding.tsx`

```typescript
export default function OnboardingScreen() {
  const completeOnboardingMutation = useCompleteOnboarding();
  const { data: totalCoins } = useUserCoins();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    // Mark onboarding as complete
    await completeOnboardingMutation.mutateAsync();

    // Show celebration with total coins earned
    setShowCelebration(true);
  };

  const handleCelebrationDismiss = () => {
    setShowCelebration(false);
    // Navigate to notification permission screen
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
        autoDismissDelay={0} // No auto-dismiss
        onDismiss={handleCelebrationDismiss}
      />
    </View>
  );
}
```

---

## Edge Cases & Error Handling

### Permission Request Errors
- **Scenario:** API throws error
- **Handling:** Show alert, keep button enabled for retry

### Settings Opening Not Supported
- **Scenario:** `Linking.openSettings()` fails (rare)
- **Handling:** Show alert with manual instructions

### Permission Status Edge Cases

**User already has permission before onboarding:**
- Screen checks status on mount → `granted`
- Check `useHasNotificationReward()` → `false`
- Show celebration + award 15 coins
- Navigate to tabs

**User grants permission but app is killed:**
- On next launch, OnboardingGuard sees completed onboarding
- User goes to tabs directly (no permission screen)
- No celebration shown (acceptable - already got onboarding celebration)
- No coins awarded (transaction not created)
- Future: Could add one-time check on first tab mount

**Rapid app switching (multiple foreground events):**
- `useRef` tracks previous status
- Only trigger celebration if status changed from not-granted → granted
- Transaction check prevents duplicate rewards even if celebration shown twice

**User taps request but kills app while system dialog is open:**
- System dialog persists
- If granted: Next foreground detection catches it
- If denied: Next launch shows denied state
- No duplicate rewards (transaction-based)

### Race Conditions

**Celebration shows but app killed before dismissing:**
- Transaction already created (coins awarded)
- On next launch, user goes to tabs
- No celebration re-shown (acceptable)

**User backgrounds app while celebration visible:**
- Celebration Modal persists
- On foreground, user continues where they left off
- No duplicate reward (transaction already exists)

### Navigation Edge Cases

**Back button press on permission screen:**
- Prevented via `gestureEnabled: false`
- No header back button
- User must choose an action (similar to onboarding)

**Deep linking while on permission screen:**
- Allow deep link navigation
- Permission screen is not a modal blocker
- User can complete permission flow later

---

## Testing Strategy

### Component Tests

**CelebrationDialog:**
- ✓ Test `autoDismissDelay={0}` → No timer starts
- ✓ Test `autoDismissDelay={5000}` → Timer starts (existing)
- ✓ Test `autoDismissDelay={undefined}` → No timer starts
- ✓ Verify timer cleanup on unmount

**Notification Permission Screen:**
- ✓ Renders with `undetermined` status → Shows "Permitir Notificações"
- ✓ Renders with `denied` status → Shows "Abrir Configurações"
- ✓ Renders with `granted` status → Shows celebration (if not rewarded)
- ✓ "Permitir Notificações" tap → Calls `requestPermissionsAsync()`
- ✓ "Abrir Configurações" tap → Calls `Linking.openSettings()`
- ✓ "Pular por Agora" tap → Navigates to tabs
- ✓ Celebration shows after permission granted
- ✓ Celebration only shows once (duplicate prevention)
- ✓ Navigation after celebration dismissed
- ✓ Error handling for permission request failure
- ✓ Error handling for settings opening failure

**Onboarding Screen:**
- ✓ Celebration shows after last question answered
- ✓ Celebration displays correct coin total from `useUserCoins()`
- ✓ Navigation to `/notification-permission` after celebration
- ✓ Celebration has no auto-dismiss (`autoDismissDelay={0}`)

### Integration Tests

**AppState Listener:**
- ✓ Mock `AppState` events
- ✓ Foreground event with permission change → Shows celebration
- ✓ Foreground event without permission change → No celebration
- ✓ Duplicate reward prevention via transaction check
- ✓ StatusRef updates correctly

**Full Flow:**
1. User completes onboarding questions
2. Celebration shows with total coins
3. User dismisses → Navigates to permission screen
4. User grants permission
5. Celebration shows with 15 coins
6. User dismisses → Navigates to tabs
7. Verify total coins = question coins + 15

### Repository Tests

**`useHasNotificationReward()`:**
- ✓ Returns `false` when no transaction exists
- ✓ Returns `true` when transaction exists
- ✓ Query key is `['transactions', 'notification_permission']`

**Transaction creation:**
- ✓ Award coins with `NOTIFICATION_PERMISSION` type
- ✓ Metadata includes `source` and `grantedAt`/`detectedAt`
- ✓ Coins added to total balance

### Mock Requirements

```typescript
// Expo Notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

// React Native Linking & AppState
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Linking: {
    openSettings: jest.fn(),
  },
  AppState: {
    addEventListener: jest.fn(),
  },
}));
```

### Coverage Target

- Maintain 90% coverage requirement
- Focus on:
  - Permission state transitions
  - Celebration triggers
  - Reward duplicate prevention
  - Navigation flows
  - Error handling paths

---

## Implementation Checklist

### Phase 1: Database & Repository
- [ ] Add `NOTIFICATION_PERMISSION` to `TransactionType` enum
- [ ] Add `useHasNotificationReward()` hook with tests
- [ ] Export hook from repositories index
- [ ] Verify tests pass (90% coverage)

### Phase 2: CelebrationDialog Update
- [ ] Write tests for `autoDismissDelay={0}` behavior
- [ ] Update default value to `0`
- [ ] Update timer logic to only start if `autoDismissDelay > 0`
- [ ] Update existing tests if needed
- [ ] Verify tests pass

### Phase 3: Notification Permission Screen
- [ ] Write screen component tests (TDD - Red phase)
- [ ] Create `/app/notification-permission.tsx`
- [ ] Implement permission status detection
- [ ] Implement UI for all three states (undetermined/denied/granted)
- [ ] Implement button handlers
- [ ] Implement celebration integration
- [ ] Implement error handling
- [ ] Verify tests pass (Green phase)

### Phase 4: Onboarding Updates
- [ ] Write tests for celebration integration
- [ ] Add celebration state to onboarding screen
- [ ] Update `handleComplete` to show celebration
- [ ] Update navigation to `/notification-permission`
- [ ] Pass `autoDismissDelay={0}` to celebration
- [ ] Verify tests pass

### Phase 5: Root Layout Updates
- [ ] Add `notification-permission` screen registration
- [ ] Add AppState listener logic
- [ ] Add global celebration state
- [ ] Add celebration component to layout
- [ ] Write tests for AppState listener
- [ ] Verify tests pass

### Phase 6: Integration & Verification
- [ ] Test full flow end-to-end manually
- [ ] Run all tests: `npm test`
- [ ] Verify 90% coverage maintained
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test Settings activation flow
- [ ] Test skip flow
- [ ] Test edge cases (app kill, rapid switching, etc.)

---

## Text Content (Brazilian Portuguese)

### Onboarding Completion
- **Title:** "Questionário Completo!"
- **Subtitle:** "Você ganhou suas primeiras moedas!"
- **Button:** "Continuar"

### Notification Permission Screen
- **Title:** "Ative as Notificações"
- **Description:** "Receba lembretes e conquiste suas metas mais facilmente!"
- **Benefits:**
  - "✓ Lembretes diários personalizados"
  - "✓ Notificações de conquistas"
  - "✓ Acompanhamento de progresso"
- **Reward Badge:** "🪙 Ganhe 15 moedas ao ativar!"
- **Primary Button (Undetermined):** "Permitir Notificações"
- **Primary Button (Denied):** "Abrir Configurações"
- **Secondary Button:** "Pular por Agora"
- **Helper Text (Denied):** "Você negou anteriormente. Ative nas configurações do app."

### Notification Celebration
- **Title:** "Notificações Ativadas!"
- **Subtitle:** "Agora você receberá lembretes importantes!"
- **Button:** "Continuar"

### Error Messages
- **Permission Request Error:** "Não foi possível solicitar permissão. Tente novamente."
- **Settings Error:** "Não foi possível abrir as configurações. Abra manualmente."

---

## Design Tokens

From `/lib/theme/tokens`:

**Colors:**
- Primary: `colors.primary.base`
- Text: `colors.neutral.black`
- Secondary Text: `colors.neutral.gray[600]`
- Tertiary Text: `colors.neutral.gray[500]`
- White: `colors.neutral.white`

**Gradients:**
- Background: `#FFFFFF → #F8F9FB` (LinearGradient)
- Button/Badge: `#F7A531 → #F39119` (LinearGradient)

**Typography:**
- Title: Poppins Bold, 28px
- Subtitle: Poppins Regular, 16px
- Body: Poppins Regular, 14px
- Button: Poppins Bold, 16px
- Badge: Poppins SemiBold, 14px

**Spacing:**
- Extra Large: `spacing.xl`
- Large: `spacing.lg`
- Medium: `spacing.md`
- Small: `spacing.sm`

**Border Radius:**
- Large: `borderRadius.lg`
- Extra Large: `borderRadius.xl`

---

## Dependencies

**Required (should be installed):**
- `expo-notifications` - Permission API
- `expo-linking` - Open Settings
- `react-native` - AppState, Linking

**Verify Installation:**
```bash
npm list expo-notifications
```

---

## Summary

This design adds a notification permission flow that:

✅ **Integrates seamlessly** - Appears after onboarding completion
✅ **Rewards engagement** - 15 coins for enabling notifications
✅ **Detects Settings activation** - AppState listener catches changes
✅ **Prevents duplicates** - Transaction-based reward system
✅ **Respects user choice** - Optional, can skip
✅ **Handles edge cases** - Comprehensive error handling
✅ **Maintains quality** - TDD approach, 90% coverage

**Key Metrics:**
- Notification permission reward: 15 coins
- Onboarding question reward: 1 coin each
- Auto-dismiss delay: 0 (user must tap Continue)
- Transaction type: `NOTIFICATION_PERMISSION`

**User Flow:**
Questions → Celebration (coins) → Permission Screen → Celebration (15 coins) → Main App
