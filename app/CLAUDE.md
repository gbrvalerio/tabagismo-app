# Navigation & Screens Guide

Expo Router (file-based routing) for navigation.

---

## Quick Start: Add a New Screen

### Tab Screen

**Create `/app/(tabs)/profile.tsx`:**
```typescript
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

**Add tab icon in `/app/(tabs)/_layout.tsx`:**
```typescript
<Tabs.Screen
  name="profile"
  options={{
    title: 'Profile',
    tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
  }}
/>
```

### Modal Screen

**Create `/app/settings.tsx`:**
```typescript
import { View, Text } from 'react-native';

export default function SettingsModal() {
  return (
    <View>
      <Text>Settings</Text>
    </View>
  );
}
```

**Register in `/app/_layout.tsx`:**
```typescript
<Stack.Screen
  name="settings"
  options={{
    presentation: 'modal',
    title: 'Settings'
  }}
/>
```

**Navigate from any screen:**
```typescript
import { router } from 'expo-router';

<Button onPress={() => router.push('/settings')} />
```

### Stack Screen (Nested)

**Create `/app/(tabs)/index/details.tsx`:**
```typescript
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Details for {id}</Text>
    </View>
  );
}
```

**Navigate with params:**
```typescript
import { router } from 'expo-router';

<Button onPress={() => router.push('/details?id=123')} />
// or
<Button onPress={() => router.push({ pathname: '/details', params: { id: 123 } })} />
```

---

## Routing Patterns

### File-Based Routes

```
/app
  /(tabs)           → Tab navigator
    /index.tsx      → /
    /explore.tsx    → /explore
  /modal.tsx        → /modal (modal presentation)
  /[id].tsx         → Dynamic route: /123
  /_layout.tsx      → Root layout (providers)
```

### Navigation Methods

```typescript
import { router } from 'expo-router';

// Navigate forward
router.push('/profile');

// Replace current screen
router.replace('/login');

// Go back
router.back();

// Navigate with params
router.push({ pathname: '/user/[id]', params: { id: '123' } });
```

### Get Route Params

```typescript
import { useLocalSearchParams } from 'expo-router';

export default function UserScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();

  return <Text>User {id}</Text>;
}
```

---

## Screen Patterns

### With Database Query

```typescript
import { View, Text, ActivityIndicator } from 'react-native';
import { useUser } from '@/db';

export default function UserScreen({ id }: { id: number }) {
  const { data: user, isLoading, error } = useUser(id);

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>{user?.name}</Text>
    </View>
  );
}
```

### With Mutation

```typescript
import { View, Button } from 'react-native';
import { useCreateUser } from '@/db';
import { router } from 'expo-router';

export default function CreateUserScreen() {
  const createMutation = useCreateUser();

  const handleCreate = () => {
    createMutation.mutate(
      { name: 'John', email: 'john@example.com' },
      {
        onSuccess: (user) => {
          router.push(`/user/${user.id}`);
        },
      }
    );
  };

  return (
    <View>
      <Button
        title="Create User"
        onPress={handleCreate}
        disabled={createMutation.isPending}
      />
    </View>
  );
}
```

### With Form State

```typescript
import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

export default function FormScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // Validation
    if (!name || !email) return;

    // Submit logic
    console.log({ name, email });
  };

  return (
    <View>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
```

---

## Layout Configuration

### Root Layout (`/app/_layout.tsx`)

Already configured with:
- ✅ ErrorBoundary
- ✅ QueryClientProvider (TanStack Query)
- ✅ Database migrations on startup
- ✅ Theme provider
- ✅ OnboardingGuard (redirects to `/onboarding` if not completed)
- ✅ Auto-seeds onboarding questions on first launch

**Don't modify unless adding global providers.**

### Tab Layout (`/app/(tabs)/_layout.tsx`)

Configure tab bar icons and titles here.

```typescript
<Tabs.Screen
  name="index"
  options={{
    title: 'Home',
    tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
  }}
/>
```

---

## Screen Options

### Hide Header

```typescript
export default function FullScreenView() {
  return <View />;
}

// In _layout.tsx
<Stack.Screen name="fullscreen" options={{ headerShown: false }} />
```

### Custom Header

```typescript
<Stack.Screen
  name="custom"
  options={{
    headerTitle: 'Custom Title',
    headerRight: () => <Button title="Save" onPress={() => {}} />,
  }}
/>
```

### Modal Presentation

```typescript
<Stack.Screen
  name="modal"
  options={{
    presentation: 'modal',
    headerLeft: () => <Button title="Close" onPress={() => router.back()} />,
  }}
/>
```

---

## Common Imports

```typescript
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUsers, useCreateUser } from '@/db';
```

---

## File Structure

```
/app
  /(tabs)
    /_layout.tsx              # Tab navigator config
    /index.tsx                # Home tab
    /explore.tsx              # Explore tab
  /_layout.tsx                # Root layout (providers, OnboardingGuard, AppState listener)
  /onboarding.tsx             # Onboarding screen (modal, no header, no gesture dismiss)
  /notification-permission.tsx # Notification permission screen (no header, no gesture dismiss)
  /modal.tsx                  # Modal screen
  /+not-found.tsx             # 404 page
```

---

## Onboarding Flow

The app has a multi-stage onboarding flow with priority routing: **slides → questions → notification permission → tabs**

### Stage 1: Onboarding Slides (`/onboarding-slides`)

Informational onboarding phase with 3 swipeable slides shown before the questions flow.

**Route:** `/onboarding-slides` — Registered in `_layout.tsx` with `headerShown: false`, `gestureEnabled: false`.

**Key Features:**
- FlatList horizontal pagination with haptic feedback (Light on swipe, Medium on CTA)
- Skip button (visible slide 2+, hidden on last slide)
- CTA button "Vamos Lá!" (visible slide 3 only)
- Database-driven content with JSON metadata support
- Benefits card rendering from slide metadata
- SVG icon imports (not inline SVG)

**Components Used:**
- `SlideItem` — Individual slide with icon, title, description, optional benefits card
- `PaginationDots` — Visual indicator for current slide position

**Completion:** Both Skip and CTA buttons call `useMarkSlidesCompleted()` which sets `slidesCompleted = true` in settings table, then navigate to `/onboarding`.

### Stage 2: Onboarding Questions (`/onboarding`)

The onboarding screen is a full-screen modal (`gestureEnabled: false`) that appears after slides are completed.

**Route:** `/onboarding` — Registered in `_layout.tsx` as a modal `Stack.Screen`.

**Guard:** `OnboardingGuard` component wraps the `Stack` and checks completion status with priority:
1. If `slidesCompleted = false` → redirect to `/onboarding-slides`
2. If `onboardingCompleted = false` → redirect to `/onboarding`
3. If `notificationPermissionGranted = false` → redirect to `/notification-permission`
4. Otherwise → allow access to `/(tabs)`

**Implementation:** The onboarding screen uses `QuestionFlowContainer` with `context="onboarding"`. The container handles question display, answer saving, navigation, and coin awards generically.

**Completion:** When the user answers the last question and taps "Concluir", `useCompleteOnboarding()` is called which sets the `onboardingCompleted` setting to `true`, then navigates to `/notification-permission` via `router.replace`.

**Flow engine:** `lib/question-flow.ts` provides `computeApplicableQuestions()` and `calculateProgress()` for filtering conditional questions and tracking progress.

---

### Stage 3: Notification Permission Flow (`/notification-permission`)

**Route:** `/notification-permission` — Registered in `_layout.tsx` as a stack screen with `gestureEnabled: false`.

**Purpose:** Request notification permission after onboarding completion, with 15 coin reward.

**States:**
- **Undetermined:** Shows "Permitir Notificações" button → Requests permission inline
- **Denied:** Shows "Abrir Configurações" button → Opens Settings via `Linking.openSettings()`
- **Granted:** Shows celebration + awards 15 coins → Navigates to tabs

**Reward Prevention:** Uses `useHasNotificationReward()` to check if reward already given.

**Background Detection:** AppState listener in `_layout.tsx` detects permission changes from Settings.

---

## Rules

### ✅ DO
- Use `router.push()` for navigation
- Use `useLocalSearchParams()` for route params
- Keep screens focused (single responsibility)
- Extract reusable UI to `/components`

### ❌ DON'T
- Use React Navigation directly (use Expo Router)
- Put business logic in screens (use hooks/repositories)
- Create deeply nested routes without reason
- Forget to handle loading/error states

---

## Troubleshooting

### Screen not appearing
**Fix:** Ensure file is in correct folder and exported as default

### Params not working
**Fix:** Use `useLocalSearchParams()` hook, not props

### Navigation not working
**Fix:** Import from `expo-router`, not `react-navigation`
