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

Main orchestrator. Manages current question index, answers cache, and applicable questions via `computeApplicableQuestions()` from `@/lib/onboarding-flow`. Handles answer saving, navigation (Voltar/Proxima/Concluir), and completion.

**Hooks used:** `useOnboardingQuestions`, `useOnboardingAnswers`, `useSaveAnswer`, `useDeleteDependentAnswers`, `useCompleteOnboarding`

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

### ProgressBar

**File:** `onboarding/ProgressBar.tsx`

Animated progress bar. Takes `progress` (0-100). Uses `withSpring` for smooth width transitions.

### Input Components

Located in `onboarding/inputs/`:

| Component | File | Description |
|-----------|------|-------------|
| `OnboardingTextInput` | `inputs/TextInput.tsx` | Text input with bottom border, uses `icon` theme color |
| `OnboardingNumberInput` | `inputs/NumberInput.tsx` | Numeric input with `keyboardType="numeric"`, `parseInt` validation |
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

- **File naming:** `kebab-case.tsx`
- **Test files:** `component-name.test.tsx` (co-located)
- **Exports:** Named exports (not default)
- **Theming:** Use `useThemeColor` hook, never hardcode colors
- **Platform:** iOS and Android only (no web support)
