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
