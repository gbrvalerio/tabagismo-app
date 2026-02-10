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

## Question Flow Components

Question flow UI lives in `components/onboarding/` (will move to `components/question-flow/` in a future task). Uses design tokens from `@/lib/theme/tokens`.

### OnboardingGuard

**File:** `question-flow/OnboardingGuard.tsx`

Wraps the app's `Stack` in `_layout.tsx`. Manages onboarding flow routing with priority:
1. If `slidesCompleted = false` → redirect to `/onboarding-slides`
2. If `onboardingCompleted = false` → redirect to `/onboarding`
3. If `notificationPermissionGranted = false` → redirect to `/notification-permission`
4. Otherwise → allow access to `/(tabs)`

**Hooks used:** `useSlidesStatus()`, `useOnboardingStatus()`, `useNotificationPermissionStatus()`

### QuestionFlowContainer

**File:** `onboarding/QuestionFlowContainer.tsx` (generic, context-aware replacement for OnboardingContainer)

Generic orchestrator for any question flow context. Wrapped in LinearGradient (#FFFFFF → #F8F9FB), SafeAreaView, and KeyboardAvoidingView. Manages current question index, answers cache, and applicable questions via `computeApplicableQuestions()` from `@/lib/question-flow`.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `context` | `string` | Question context (e.g., `'onboarding'`) |
| `onComplete` | `() => void` | Called when user completes the flow |

**Gamification:**
- Awards 1 coin per question via `useAwardCoins` (creates transaction record)
- Checks `coin_transactions` table to prevent duplicate rewards
- Triggers 3D flip animation on CoinTrail coin via `animatingCoinIndex` state
- Triggers haptic feedback (success notification) on coin award
- **Transaction-based:** Coins persist across resets, only awarded once per question
- Idle button shake/pulse animation after 3 seconds if user hasn't progressed

**Hooks used:** `useQuestions(context)`, `useAnswers(context)`, `useSaveAnswer(context)`, `useDeleteDependentAnswers(context)`, `useAwardCoins`

### OnboardingContainer (Deprecated)

**File:** `onboarding/OnboardingContainer.tsx`

@deprecated — Use `QuestionFlowContainer` with `context="onboarding"` instead.

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

## Onboarding Slides Components

Located in `components/onboarding-slides/`. Uses design tokens from `@/lib/theme/tokens`.

### PaginationDots

**File:** `onboarding-slides/PaginationDots.tsx`

Visual indicator for current slide position in swipeable slides.

```typescript
import { PaginationDots } from '@/components/onboarding-slides';

<PaginationDots total={3} activeIndex={currentIndex} />
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `total` | `number` | Total number of slides |
| `activeIndex` | `number` | Current slide index (0-indexed) |

**Design:** 8px circular dots with 8px gap, active dot uses `colors.primary.base`, inactive uses `colors.neutral.gray[300]`

### SlideItem

**File:** `onboarding-slides/SlideItem.tsx`

Individual slide component that displays icon, title, description, and optional benefits card.

```typescript
import { SlideItem } from '@/components/onboarding-slides';

<SlideItem
  icon="@/assets/images/onboarding-2.svg"
  title="Nós ajudamos você nessa jornada"
  description="Com ferramentas práticas e suporte personalizado:"
  showBenefits={true}
  benefits={['Benefit 1', 'Benefit 2', 'Benefit 3']}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `string` | Yes | Path to SVG icon (imported as React component via iconMap) |
| `title` | `string` | Yes | Slide title (Brazilian Portuguese) |
| `description` | `string` | Yes | Slide description text |
| `showBenefits` | `boolean` | No | Whether to show benefits card |
| `benefits` | `string[]` | No | Array of benefit strings to display |

**Design:**
- Full-width container with vertical padding
- Icon: 120x120px placeholder (replaced with SVG imports)
- Title: `typographyPresets.hero` (Poppins Bold 30px)
- Description: `typographyPresets.body`
- Benefits card: White background, rounded corners, shadow, checkmark bullets

**Icon Handling:**
- Uses `iconMap` to match icon path strings to imported SVG components
- Falls back to placeholder View if icon not found
- IMPORTANT: Never copy SVG markup inline — always import as React components

---

## Celebration Components

Gamified celebration dialog for milestone achievements. Located in `components/celebration/`.

### CelebrationDialog

**File:** `celebration/CelebrationDialog.tsx`

Orchestrator component that displays animated celebration modal with coin cascade, slot machine counter, radial burst, and sparkle particles. Uses "Arcade Explosion" aesthetic with coordinated animations.

```typescript
import { CelebrationDialog } from '@/components/celebration';

<CelebrationDialog
  visible={showCelebration}
  onDismiss={() => setShowCelebration(false)}
  title="5 Dias Sem Fumar!"
  subtitle="Continue assim!"
  coinsEarned={25}
  autoDismissDelay={5000}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | — | Controls modal visibility (required) |
| `onDismiss` | `() => void` | — | Callback when user dismisses modal (required) |
| `title` | `string` | — | Main celebration text (required) |
| `subtitle` | `string` | — | Optional secondary text |
| `coinsEarned` | `number` | — | Number of coins to display in counter (required) |
| `autoDismissDelay` | `number` | `0` | Auto-dismiss delay in milliseconds (0 = no auto-dismiss) |
| `testID` | `string` | `'celebration-dialog'` | Test identifier |

**Animations:**
- Modal bounce in with spring physics (100ms delay, damping: 12)
- Radial burst expand + rotate (200ms delay, 700ms duration)
- Coin cascade in parabolic arcs (300ms delay, staggered 50ms per coin)
- Sparkle particles scatter (300ms delay, 800-1200ms lifespan)
- Title letter-by-letter bounce (500ms delay, staggered 30ms per letter)
- Slot machine counter flip (800ms delay, 400ms duration)
- Button glow pulse (1000ms delay, infinite loop)

**Auto-Dismiss Behavior:**
- Timer starts when `visible` becomes `true`
- Timer cancels on any user interaction (overlay tap, card tap, button press)
- Timer does NOT reset after cancellation (one-time countdown)
- Timer cleans up on unmount

**Haptic Feedback:**
- Success notification on modal open (100ms)
- Medium impact on each coin landing (staggered 300-900ms)
- Light impact on button press and auto-dismiss

### Sub-Components

#### CoinCascade

**File:** `celebration/CoinCascade.tsx`

12 coins rain down in semi-circular fan pattern with parabolic physics.

| Prop | Type | Description |
|------|------|-------------|
| `modalCenterY` | `number` | Y coordinate for coins to land at |
| `testID` | `string` | Test identifier |

**Animation:** Parabolic arc with rotation, motion blur (shadow), landing bounce

#### SlotMachineCounter

**File:** `celebration/SlotMachineCounter.tsx`

Animated number counter with digit reels that flip like slot machine.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Number to display (0-999+) |
| `testID` | `string` | Test identifier |

**Animation:** Plus symbol fades in first, digits flip right-to-left with spring overshoot

#### RadialBurst

**File:** `celebration/RadialBurst.tsx`

8 geometric rays shoot outward from modal center.

| Prop | Type | Description |
|------|------|-------------|
| `testID` | `string` | Test identifier |

**Animation:** Scale expands (0 → 1.5 → 1.0), rotates 15°, opacity flashes (0 → 0.6 → 0.3)

#### SparkleParticles

**File:** `celebration/SparkleParticles.tsx`

20 confetti-like sparkles scatter randomly around modal.

| Prop | Type | Description |
|------|------|-------------|
| `testID` | `string` | Test identifier |

**Animation:** Circular scatter, fade in/out, spring scale, rotation

**Color Distribution:** 60% gold, 25% orange, 15% teal

---

## Settings Components

Located in `components/settings/`. Used by the settings screens in `/app/settings/`.

### SettingsMenuItem

**File:** `settings/SettingsMenuItem.tsx`

Reusable menu row for the settings hub. Displays an icon, label, and chevron indicator.

```typescript
import { SettingsMenuItem } from '@/components/settings/SettingsMenuItem';

<SettingsMenuItem
  icon="person-outline"
  label="Perfil"
  onPress={() => router.push('/settings/profile')}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `string` | Ionicons icon name |
| `label` | `string` | Menu item text (Brazilian Portuguese) |
| `onPress` | `() => void` | Navigation callback |

### ProfileEditModal

**File:** `settings/ProfileEditModal.tsx`

Full-screen modal for editing onboarding answers. Reuses the `QuestionInput` component from the onboarding flow to render the correct input type (text, number, single choice, multiple choice) based on the question being edited.

```typescript
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';

<ProfileEditModal
  visible={!!editingQuestion}
  question={editingQuestion}
  currentAnswer={currentAnswer}
  onSave={(answer) => saveAnswer(answer)}
  onClose={() => setEditingQuestion(null)}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `visible` | `boolean` | Controls modal visibility |
| `question` | `Question \| null` | The question being edited |
| `currentAnswer` | `string \| null` | Current saved answer value |
| `onSave` | `(answer: string) => void` | Callback with new answer value |
| `onClose` | `() => void` | Callback to dismiss modal |

**Key Pattern:** Reuses `QuestionInput` from onboarding — any changes to input components automatically apply to both onboarding and profile editing.

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
