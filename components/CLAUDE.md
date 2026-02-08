# Components

Reusable UI components for the Tabagismo app.

---

## Existing Components

### ThemedText

**File:** `themed-text.tsx`

Theme-aware text component with preset typography styles.

```typescript
import { ThemedText } from '@/components/themed-text';

<ThemedText type="title">Título</ThemedText>
<ThemedText type="subtitle">Subtítulo</ThemedText>
<ThemedText type="default">Texto padrão</ThemedText>
<ThemedText type="defaultSemiBold">Texto semi-negrito</ThemedText>
<ThemedText type="link">Link</ThemedText>
```

**Props:** Extends `TextProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'default' \| 'title' \| 'defaultSemiBold' \| 'subtitle' \| 'link'` | `'default'` | Typography preset |
| `lightColor` | `string` | — | Override color in light mode |
| `darkColor` | `string` | — | Override color in dark mode |

### ThemedView

**File:** `themed-view.tsx`

Theme-aware container with automatic background color.

```typescript
import { ThemedView } from '@/components/themed-view';

<ThemedView>
  <ThemedText>Content here</ThemedText>
</ThemedView>
```

**Props:** Extends `ViewProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lightColor` | `string` | — | Override background in light mode |
| `darkColor` | `string` | — | Override background in dark mode |

### HapticTab

**File:** `haptic-tab.tsx`

Pressable wrapper used for tab bar buttons.

```typescript
import { HapticTab } from '@/components/haptic-tab';
```

### IconSymbol

**File:** `ui/icon-symbol.tsx`

Icon placeholder component.

```typescript
import { IconSymbol } from '@/components/ui/icon-symbol';

<IconSymbol name="house" size={24} color="#000" />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Icon name (required) |
| `size` | `number` | — | Icon size in pixels |
| `color` | `string` | — | Icon color |

---

## Onboarding Components

All onboarding UI lives in `components/onboarding/`. Uses design tokens from `@/lib/theme/tokens`.

### OnboardingGuard

**File:** `onboarding/OnboardingGuard.tsx`

Wraps the app's `Stack` in `_layout.tsx`. Checks `useOnboardingStatus()` and redirects to `/onboarding` if not completed.

### OnboardingContainer

**File:** `onboarding/OnboardingContainer.tsx`

Main orchestrator wrapped in SafeAreaView and KeyboardAvoidingView for proper mobile layout. Manages current question index, answers cache, and applicable questions via `computeApplicableQuestions()` from `@/lib/onboarding-flow`. Handles answer saving, navigation (Voltar/Próxima/Concluir), completion, and coin awards.

**Layout Structure:**
- Header: Back button (when currentIndex > 0) + CoinCounter (top-right) + CoinTrail (progress dots)
- Content: Fixed question text + ScrollView for inputs/options
- Footer: Next/Finish button (when answered)
- Overlay: CoinBurstAnimation (triggers on first-time answers)

**Gamification:**
- Awards 1 coin per first-time answer via `useIncrementCoins`
- Shows CoinBurstAnimation arc trajectory on coin award
- Triggers haptic feedback (success notification) on coin award
- Tracks `isFirstTime` flag to prevent duplicate coin awards on answer updates

**Safe Area & Keyboard:**
- Uses `SafeAreaView` with `edges={['top', 'bottom']}` for notch/home indicator support
- Uses `KeyboardAvoidingView` with platform-specific behavior (iOS: padding, Android: height)
- ScrollView enables scrolling for long option lists

**Hooks used:** `useOnboardingQuestions`, `useOnboardingAnswers`, `useSaveAnswer`, `useDeleteDependentAnswers`, `useCompleteOnboarding`, `useUserCoins`, `useIncrementCoins`

### QuestionCard

**File:** `onboarding/QuestionCard.tsx`

Animated wrapper for question content. Uses `react-native-reanimated` with slide-in (`translateX`), scale, and fade animations via `withSpring` and `withTiming`.

### QuestionText

**File:** `onboarding/QuestionText.tsx`

Displays question text. Uses `useThemeColor({}, 'text')` for theming. Font size 24, weight 700.

### QuestionInput (Factory)

**File:** `onboarding/QuestionInput.tsx`

Routes to the correct input component based on `question.type`:
- `TEXT` → `OnboardingTextInput`
- `NUMBER` → `OnboardingNumberInput`
- `SINGLE_CHOICE` → `SingleChoiceCards`
- `MULTIPLE_CHOICE` → `MultipleChoiceCards`

Extracts `choices` from `question.metadata` for choice-based types.

### ProgressBar (Replaced by CoinTrail)

**File:** `onboarding/ProgressBar.tsx`

Animated progress bar. Takes `progress` (0-100). Uses `withSpring` for smooth width transitions. No longer used in OnboardingContainer (replaced by CoinTrail).

### CoinIcon

**File:** `onboarding/CoinIcon.tsx`

Base coin visualization with outlined/filled variants and optional pulse animation. Uses `react-native-reanimated` for highlight pulse effect.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | — | Coin diameter in pixels |
| `variant` | `'outlined' \| 'filled'` | — | Visual style (gray border vs gold fill) |
| `highlighted` | `boolean` | `false` | Enables repeating pulse animation |

### CoinCounter

**File:** `onboarding/CoinCounter.tsx`

Displays current coin count with animated bounce on increment. Reads from `useUserCoins()` hook. Shows gold coin icon + count text.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `testID` | `string` | — | Test identifier |

### CoinTrail

**File:** `onboarding/CoinTrail.tsx`

Progress indicator showing coins as dots. Outlined = not answered, filled = earned. Highlights current question coin with pulse animation.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentStep` | `number` | — | Current question (1-indexed) |
| `totalSteps` | `number` | — | Total questions count |
| `answeredQuestions` | `string[]` | — | Array of answered question keys |
| `testID` | `string` | — | Test identifier |

### CoinBurstAnimation

**File:** `onboarding/CoinBurstAnimation.tsx`

Animated coin that flies from center to top-right in an arc trajectory with 2 full rotations and fade-out. Triggers on first-time answers.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | `boolean` | — | Controls render and animation start |
| `onComplete` | `() => void` | — | Called after 800ms animation completes |

### Input Components

Located in `onboarding/inputs/`:

| Component | File | Description |
|-----------|------|-------------|
| `OnboardingTextInput` | `inputs/TextInput.tsx` | Text input with auto-focus (300ms delay), bottom border, uses `icon` theme color |
| `OnboardingNumberInput` | `inputs/NumberInput.tsx` | Numeric input with auto-focus (300ms delay), `keyboardType="numeric"`, `parseInt` validation |
| `SingleChoiceCards` | `inputs/SingleChoiceCards.tsx` | Touchable cards with haptic feedback, single selection |
| `MultipleChoiceCards` | `inputs/MultipleChoiceCards.tsx` | Touchable cards with haptic feedback, toggle selection |

---

## Design System Components (Planned)

Components being added as part of the gamified design system:

- **Button** — Primary, secondary, outline, ghost, danger variants with loading/disabled states and animations
- **TextField** — Text input with label, error, helper text, and loading states

---

## Theme System

### Colors

Defined in `constants/theme.ts` via `Colors.light` and `Colors.dark`.

Available color keys: `text`, `background`, `tint`, `icon`, `tabIconDefault`, `tabIconSelected`

### Hooks

- **`useColorScheme()`** — Returns current color scheme (`'light'` | `'dark'`)
- **`useThemeColor(props, colorName)`** — Resolves a theme color with optional per-mode overrides

### Usage Pattern

```typescript
const color = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
```

---

## Conventions

- **File naming:** `PascalCase.tsx` for components, `kebab-case.tsx` for screens
- **Test files:** `component-name.test.tsx` (co-located)
- **Exports:** Named exports (not default)
- **Theming:** Use `useThemeColor` hook, never hardcode colors
- **Platform:** iOS and Android only (no web support)
