# Design System

Gamified design system for the Tabagismo smoking cessation app. Built with React Native and designed for iOS and Android.

---

## Overview

The design system provides a consistent, gamified visual language across the app. It includes design tokens, reusable components, and animation utilities that create an engaging experience to support users in their smoking cessation journey.

### Architecture

```
┌──────────────────────────┐
│      App Screens         │  Compose components
├──────────────────────────┤
│      Components          │  Button, TextField, etc.
├──────────────────────────┤
│    Animation Utilities   │  Shared animation presets
├──────────────────────────┤
│      Design Tokens       │  Colors, spacing, typography
└──────────────────────────┘
```

---

## Design Tokens

Design tokens are the foundation of the design system. They define colors, spacing, typography, shadows, and border radii used throughout the app.

**Location:** `lib/design-system/tokens.ts`

### Colors

The color palette supports both light and dark modes. Colors are organized by semantic purpose:

| Token | Purpose |
|-------|---------|
| `primary` | Main brand color, primary actions |
| `secondary` | Secondary actions and accents |
| `success` | Positive feedback, achievements |
| `warning` | Caution states |
| `danger` | Errors, destructive actions |
| `background` | Screen backgrounds |
| `surface` | Card and container backgrounds |
| `text` | Primary text color |
| `textSecondary` | Secondary/muted text |
| `border` | Borders and dividers |

#### Usage

```typescript
import { tokens } from '@/lib/design-system/tokens';

// Access colors for current theme
const backgroundColor = tokens.colors.background;
const primaryColor = tokens.colors.primary;
```

### Spacing

Consistent spacing scale based on a 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing, icon gaps |
| `sm` | 8px | Small padding, compact layouts |
| `md` | 16px | Default padding, standard gaps |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Large section spacing |
| `2xl` | 48px | Screen-level spacing |

#### Usage

```typescript
import { tokens } from '@/lib/design-system/tokens';

const style = {
  padding: tokens.spacing.md,    // 16
  marginBottom: tokens.spacing.lg, // 24
};
```

### Typography

Typography tokens define font sizes, weights, and line heights:

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `h1` | 32px | Bold | Screen titles |
| `h2` | 24px | Bold | Section headers |
| `h3` | 20px | SemiBold | Subsection headers |
| `body` | 16px | Regular | Body text |
| `bodySmall` | 14px | Regular | Secondary text |
| `caption` | 12px | Regular | Labels, hints |
| `button` | 16px | SemiBold | Button text |

#### Usage

```typescript
import { tokens } from '@/lib/design-system/tokens';

const style = {
  fontSize: tokens.typography.body.fontSize,
  fontWeight: tokens.typography.body.fontWeight,
  lineHeight: tokens.typography.body.lineHeight,
};
```

### Shadows

Shadow tokens for elevation levels:

| Token | Usage |
|-------|-------|
| `sm` | Subtle elevation (cards) |
| `md` | Medium elevation (floating elements) |
| `lg` | High elevation (modals, tooltips) |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4px | Subtle rounding |
| `md` | 8px | Cards, inputs |
| `lg` | 12px | Buttons, larger elements |
| `xl` | 16px | Prominent rounding |
| `full` | 9999px | Circular elements, pills |

---

## Theme Support

The design system supports light and dark modes via the `useColorScheme` hook.

**Key files:**
- `constants/theme.ts` — Color definitions per theme
- `hooks/use-color-scheme.ts` — Current color scheme hook
- `hooks/use-theme-color.ts` — Resolve themed color values

### Usage

```typescript
import { useThemeColor } from '@/hooks/use-theme-color';

function MyComponent() {
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');

  return <View style={{ backgroundColor: bgColor }}>
    <Text style={{ color: textColor }}>Hello</Text>
  </View>;
}
```

### Custom Theme Overrides

Pass explicit light/dark values to override defaults:

```typescript
const color = useThemeColor(
  { light: '#000', dark: '#fff' },
  'text'
);
```

---

## Animation Tokens

Animation utilities provide consistent motion across the app, creating the gamified feel.

**Location:** `lib/design-system/animations.ts`

### Duration

| Token | Value | Usage |
|-------|-------|-------|
| `fast` | 150ms | Micro-interactions, toggles |
| `normal` | 300ms | Standard transitions |
| `slow` | 500ms | Emphasis, celebratory animations |

### Easing

| Token | Usage |
|-------|-------|
| `easeIn` | Elements entering |
| `easeOut` | Elements exiting |
| `easeInOut` | Standard transitions |
| `spring` | Bouncy, gamified interactions |

### Common Animation Patterns

#### Press Feedback

Buttons and interactive elements use scale animations on press:

```typescript
// Scale down slightly on press, spring back on release
pressIn:  scale(0.95), duration: fast
pressOut: scale(1.0),  duration: normal, easing: spring
```

#### Success Celebration

Achievement unlocks and milestone celebrations:

```typescript
// Scale up with bounce, then settle
scale(0) → scale(1.1) → scale(1.0)
duration: slow, easing: spring
```

#### Fade Transitions

Screen and element transitions:

```typescript
// Fade in with slight upward movement
opacity: 0 → 1, translateY: 10 → 0
duration: normal, easing: easeOut
```

---

## Components

### Themed Components

Base components that respect the current theme:

#### ThemedText

Text component with automatic theme colors and preset styles.

**Location:** `components/themed-text.tsx`

```typescript
import { ThemedText } from '@/components/themed-text';

<ThemedText type="title">Título</ThemedText>
<ThemedText type="subtitle">Subtítulo</ThemedText>
<ThemedText type="default">Texto padrão</ThemedText>
<ThemedText type="defaultSemiBold">Texto em negrito</ThemedText>
```

**Props:**
- `type`: `'default'` | `'title'` | `'defaultSemiBold'` | `'subtitle'` | `'link'`
- `lightColor` / `darkColor`: Optional theme overrides
- All standard `TextProps`

#### ThemedView

View component with automatic background color.

**Location:** `components/themed-view.tsx`

```typescript
import { ThemedView } from '@/components/themed-view';

<ThemedView>
  <ThemedText>Conteúdo</ThemedText>
</ThemedView>
```

### Button

Gamified button component with multiple variants, sizes, and press animations.

**Location:** `components/Button.tsx`

#### Variants

| Variant | Usage |
|---------|-------|
| `primary` | Main actions (e.g., "Registrar progresso") |
| `secondary` | Secondary actions |
| `outline` | Tertiary actions, less emphasis |
| `ghost` | Minimal emphasis, inline actions |
| `danger` | Destructive actions (e.g., "Excluir") |

#### Sizes

| Size | Usage |
|------|-------|
| `sm` | Compact contexts, inline actions |
| `md` | Default size |
| `lg` | Prominent actions, CTAs |

#### Usage

```typescript
import { Button } from '@/components/Button';

<Button variant="primary" size="lg" onPress={handlePress}>
  Registrar Progresso
</Button>

<Button variant="outline" size="sm" onPress={handleCancel}>
  Cancelar
</Button>

<Button variant="danger" onPress={handleDelete}>
  Excluir
</Button>
```

#### Animation

- Press feedback: Scales down to 0.95 on press
- Spring animation on release
- Disabled state: Reduced opacity, no animation

### TextField

Text input component with labels, error states, and loading indicators.

**Location:** `components/TextField.tsx`

#### States

| State | Description |
|-------|-------------|
| Default | Standard input appearance |
| Focused | Highlighted border, active label |
| Error | Red border, error message displayed |
| Disabled | Reduced opacity, non-interactive |
| Loading | Loading indicator shown |

#### Usage

```typescript
import { TextField } from '@/components/TextField';

<TextField
  label="Nome"
  placeholder="Digite seu nome"
  value={name}
  onChangeText={setName}
/>

<TextField
  label="Email"
  error="Email inválido"
  value={email}
  onChangeText={setEmail}
/>
```

#### Animation

- Focus: Border color transition
- Error: Subtle shake animation
- Label: Animated float on focus

---

## Best Practices

### Do's

- **Use design tokens** for all colors, spacing, and typography values
- **Use themed components** (`ThemedText`, `ThemedView`) for automatic dark mode support
- **Use semantic color tokens** (`primary`, `danger`) instead of raw hex values
- **Follow the spacing scale** for consistent layouts
- **Test both light and dark modes** when building new UI

### Don'ts

- **Don't hardcode colors** — Always use tokens or theme hooks
- **Don't use arbitrary spacing values** — Use the spacing scale
- **Don't create one-off animation configs** — Use animation tokens
- **Don't skip the loading/error states** — All interactive components should handle these
- **Don't bypass the component API** — Use props, not style overrides for variants

### Accessibility

- All interactive components must have appropriate `accessibilityLabel` props
- Maintain sufficient color contrast ratios (4.5:1 for text, 3:1 for large text)
- Support dynamic text sizing
- Ensure touch targets are at least 44x44 points

### Adding New Components

1. Create component in `/components/ComponentName.tsx`
2. Create tests in `/components/ComponentName.test.tsx`
3. Use design tokens for all visual values
4. Support light and dark modes
5. Add press animations for interactive elements
6. Document usage in this file
7. Add example to the design demo screen

---

## File Reference

| File | Description |
|------|-------------|
| `lib/design-system/tokens.ts` | Design tokens (colors, spacing, typography, shadows, radii) |
| `lib/design-system/animations.ts` | Animation tokens and utilities |
| `constants/theme.ts` | Theme color definitions |
| `hooks/use-color-scheme.ts` | Color scheme detection hook |
| `hooks/use-theme-color.ts` | Themed color resolution hook |
| `components/themed-text.tsx` | Themed text component |
| `components/themed-view.tsx` | Themed view component |
| `components/Button.tsx` | Button component |
| `components/TextField.tsx` | Text field component |
