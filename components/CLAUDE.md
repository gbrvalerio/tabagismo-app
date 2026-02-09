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

Main orchestrator wrapped in LinearGradient (#FFFFFF → #F8F9FB), SafeAreaView, and KeyboardAvoidingView. Manages current question index, answers cache, and applicable questions via `computeApplicableQuestions()` from `@/lib/onboarding-flow`. Handles answer saving, navigation (Voltar/Próxima/Concluir), completion, and coin awards.

**Gamification:**
- Awards 1 coin per question via `useAwardCoins` (creates transaction record)
- Checks `coin_transactions` table (not `onboardingAnswers`) to prevent duplicate rewards
- Triggers 3D flip animation on CoinTrail coin via `animatingCoinIndex` state
- Triggers haptic feedback (success notification) on coin award
- **Transaction-based:** Coins persist across onboarding resets, only awarded once per question
- Idle button shake/pulse animation after 3 seconds if user hasn't progressed

**Hooks used:** `useOnboardingQuestions`, `useOnboardingAnswers`, `useSaveAnswer`, `useDeleteDependentAnswers`, `useCompleteOnboarding`, `useAwardCoins`

### QuestionText

**File:** `onboarding/QuestionText.tsx`

Displays question text using Poppins Bold typography. Uses `typographyPresets.hero` (Poppins_700Bold, 30px, letterSpacing -0.3, lineHeight 38). Color: `colors.neutral.black`.

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

### CoinSvg

**File:** `onboarding/CoinSvg.tsx`

Wrapper component for the coin SVG asset (`assets/images/coin.svg`). Imports the SVG file as a React component using react-native-svg-transformer. Supports outlined (35% opacity) and filled variants, with optional glow shadow effect.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `24` | Coin diameter in pixels |
| `variant` | `'outlined' \| 'filled'` | `'filled'` | Visual style (35% opacity vs full) |
| `showGlow` | `boolean` | `false` | Enables gold shadow glow effect |
| `testID` | `string` | `'coin-svg'` | Test identifier |

**Implementation Note:** This component imports the SVG file directly rather than hardcoding SVG markup, following the project's asset management guidelines.

### AnimatedCoin

**File:** `onboarding/AnimatedCoin.tsx`

Animated wrapper around CoinSvg. Provides 3D flip animation (scaleX 1→0→1 over 600ms) and highlighted pulse animation (scale 1→1.2 repeating). Triggers haptic feedback on flip.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | — | Coin diameter in pixels |
| `variant` | `'outlined' \| 'filled'` | — | Visual style passed to CoinSvg |
| `animate` | `boolean` | `false` | Triggers 3D flip animation (once) |
| `highlighted` | `boolean` | `false` | Enables repeating pulse animation |
| `showGlow` | `boolean` | `false` | Enables glow on CoinSvg |
| `onAnimationComplete` | `() => void` | — | Called after 600ms flip completes |
| `testID` | `string` | `'animated-coin'` | Test identifier |

### CoinCounter

**File:** `onboarding/CoinCounter.tsx`

Pill-shaped counter with LinearGradient background (#F7A531 → #F39119). Shows CoinSvg (20px, filled, glow) + coin count text using `typographyPresets.coinCounter` (Poppins Bold 18px). Bounce animation on increment via `withSpring`. Reads from `useUserCoins()` hook.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `testID` | `string` | — | Test identifier |

### CoinTrail

**File:** `onboarding/CoinTrail.tsx`

Progress indicator with a gradient progress line and AnimatedCoin dots (16px). Progress line fills proportionally to answered questions using LinearGradient (#F7A531 → #F39119). Coins show as outlined (unanswered) or filled (answered). Current step coin has highlighted pulse. Supports `animatingCoinIndex` for triggering 3D flip on newly answered questions.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentStep` | `number` | — | Current question (1-indexed) |
| `totalSteps` | `number` | — | Total questions count |
| `answeredQuestions` | `string[]` | — | Array of answered question keys |
| `animatingCoinIndex` | `number \| null` | `null` | Index of coin to animate (3D flip) |
| `onCoinAnimationComplete` | `() => void` | — | Called after flip animation completes |
| `testID` | `string` | — | Test identifier |

### Input Components

Located in `onboarding/inputs/`. All use Poppins typography and design tokens from `@/lib/theme/tokens`.

| Component | File | Description |
|-----------|------|-------------|
| `OnboardingTextInput` | `inputs/TextInput.tsx` | Text input with floating label, auto-focus (300ms), 2px bottom border (gray→primary), Poppins Regular 16px, soft shadow |
| `OnboardingNumberInput` | `inputs/NumberInput.tsx` | Numeric input with floating label, auto-focus (300ms), 2px bottom border (gray→secondary), Poppins Regular 16px, number badge, soft shadow |
| `SingleChoiceCards` | `inputs/SingleChoiceCards.tsx` | Touchable cards with haptic feedback, transparent→primary border on select, 5% primary tint background, Poppins Regular 16px, 0.97 scale press, radio circle indicator |
| `MultipleChoiceCards` | `inputs/MultipleChoiceCards.tsx` | Touchable cards with haptic feedback, transparent→secondary border on select, 5% secondary tint background, Poppins Regular 16px, 0.97 scale press, checkbox indicator |

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
