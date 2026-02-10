# Config Screen — Design Spec

**Date:** 2026-02-10
**Branch:** `feat/config-screen`
**Status:** Design

---

## Overview

A settings hub accessible via a gear icon on the home screen, with stack navigation into two sub-screens: **Perfil** and **Notificações**.

---

## Decisions

- **Navigation:** Stack-based (gear → settings hub → detail screens)
- **Profile editing:** List with tap-to-edit (not sequential flow replay)
- **Coins:** No coins for editing answers (one-time onboarding incentive only)
- **Notification toggle:** Smart toggle reflecting real OS permission state
- **Gear button:** Absolute-positioned inside home screen (not tab header modification)
- **Edit modal:** Full-screen modal for editing answers (not bottom sheet)
- **Component paths:** All question-flow components live in `@/components/question-flow/`

---

## Screen Architecture

**3 new screens via expo-router:**

- `/app/settings/index.tsx` — Settings hub (list of menu items)
- `/app/settings/profile.tsx` — Profile editing (onboarding answers)
- `/app/settings/notifications.tsx` — Notification toggle

**Navigation flow:**

```
Home (gear icon top-right, absolute-positioned)
  └─ Settings Hub
       ├─ Perfil → Profile Edit screen
       └─ Notificações → Notification Settings screen
```

---

## Screen 1: Settings Hub (`/app/settings/index.tsx`)

**Header:** "Configurações" with back arrow (standard stack header, styled with Poppins)

**Background:** `LinearGradient` from `#FFFFFF` → `#F8F9FB` (matching existing screens like `notification-permission.tsx`)

**Body:** Two menu rows in a white card with `shadows.md`:

- **Perfil** — Icon: 👤 person emoji or user SVG, subtitle showing user's name from answers
- **Notificações** — Icon: 🔔 bell emoji, subtitle showing "Ativadas" / "Desativadas"

**Each row is a `Pressable` with:**

- Left: icon (40x40 rounded container with `colors.background.tertiary`)
- Center: title (Poppins SemiBold 16px) + subtitle (Poppins Regular 14px, gray.500)
- Right: chevron `>`
- Haptic feedback on press (Light impact)
- 0.97 scale on press (matching existing card patterns)

---

## Screen 2: Profile Edit (`/app/settings/profile.tsx`)

**Header:** "Perfil" with back arrow

**Background:** `LinearGradient` from `#FFFFFF` → `#F8F9FB`

**Body:** ScrollView with all 14 onboarding questions displayed as editable list items, grouped by category.

### Category Groups (using `QuestionCategory`)

- **Perfil** — name, gender, age, religion
- **Vício** — addiction_type
- **Hábitos** — cigarettes_per_day OR pod_duration_days, cost, years_smoking
- **Motivação** — quit_attempts, stop_smoking_date
- **Objetivos** — goals, main_fears_and_concerns

### Each Category Section

- Left accent bar: 3px wide, `colors.primary.base` (#FF6B35), `borderRadius.sm`, full height of header
- Section header text: Poppins SemiBold 14px, `colors.neutral.gray[500]`, uppercase
- No full-width divider — the orange accent bar provides visual separation

### Each Question Row

- Question text (Poppins Regular 14px, gray.600)
- Current answer displayed (Poppins Medium 16px, `colors.neutral.black`)
- For multiple choice answers: comma-joined display
- For conditional questions not applicable: hidden entirely
- Tap opens a **full-screen modal** with the same input component used in onboarding
- On save: uses `useSaveAnswer('onboarding')` — same upsert logic
- If changing `addiction_type`: triggers `useDeleteDependentAnswers` to clean up conditional answers
- No coins awarded (coinRewardPerQuestion = 0)
- Haptic feedback: `Haptics.notificationAsync(Success)` on save (matching onboarding pattern)

### Full-Screen Edit Modal

Instead of a bottom sheet, use a full-screen modal (stack push or `presentation: 'modal'`):

- Header with question text as title + "Salvar" / close button
- Body reuses `QuestionInput` component from `@/components/question-flow/QuestionInput.tsx`
- Input components (`SingleChoiceCards`, `MultipleChoiceCards`, `TextInput`) from `@/components/question-flow/inputs/`
- Same look and feel as onboarding — components are designed for full-screen use

**Why full-screen instead of bottom sheet:**
- No new dependency needed (no `@gorhom/bottom-sheet`)
- Input components were designed for full-screen layouts — they'd feel cramped in a sheet
- Consistent with the app's existing full-screen patterns

### Component Reuse

The existing `QuestionInput` component + input components (`SingleChoiceCards`, `MultipleChoiceCards`, `TextInput`) from `@/components/question-flow/inputs/` are reused directly inside the edit modal — same look and feel as onboarding.

### Empty State

If somehow no answers exist, show a "Completar perfil" button that navigates to the onboarding flow.

---

## Screen 3: Notifications (`/app/settings/notifications.tsx`)

**Header:** "Notificações" with back arrow

**Background:** `LinearGradient` from `#FFFFFF` → `#F8F9FB`

**Body:** Single white card with `shadows.md`.

### Smart Toggle Row

- Left: bell icon
- Center: "Notificações" title + status subtitle
- Right: Switch component (React Native `Switch`)

### States

- **Granted:** Switch ON (tintColor: `colors.primary.base`), subtitle "Ativadas"
- **Denied:** Switch OFF, tapping calls `Linking.openSettings()`. Subtitle "Desativadas — toque para abrir configurações"
- **Undetermined:** Switch OFF, tapping requests permission via `Notifications.requestPermissionsAsync()`

### AppState Listener

Same pattern as existing `notification-permission.tsx` — re-checks permission when app returns from settings.

No coin rewards here (already handled during onboarding).

### Info Card Below Toggle

Reuses the same benefits card visual pattern from `notification-permission.tsx` (white card, checkmark bullets, `shadows.md`):

- ✓ Lembretes diários personalizados
- ✓ Notificações de conquistas
- ✓ Acompanhamento de progresso

Checkmark color: `colors.primary.base`, text: `typographyPresets.small`, `colors.neutral.gray[700]`

---

## Dashboard Gear Button

**Absolute-positioned inside the home screen** (top-right of `SafeAreaView`).

The tabs layout currently has `headerShown: false` and modifying it would add complexity. Instead, add the gear icon directly in the home screen component:

```tsx
<SafeAreaView>
  <Pressable
    style={styles.gearButton}
    onPress={() => router.push('/settings')}
    hitSlop={8}
  >
    {/* ⚙️ gear icon, 24px, colors.neutral.gray[600] */}
  </Pressable>
  {/* ... rest of home screen */}
</SafeAreaView>
```

- 44x44 hit area (via padding + hitSlop)
- `colors.neutral.gray[600]` color
- `position: 'absolute'`, `top: 0`, `right: spacing.md`
- Light haptic on press

---

## New Files

### Screens

- `app/settings/index.tsx` — Settings hub
- `app/settings/profile.tsx` — Profile editing
- `app/settings/notifications.tsx` — Notification settings
- `app/settings/_layout.tsx` — Settings stack layout (header styling with Poppins)

### Components

- `components/settings/SettingsMenuItem.tsx` — Reusable menu row
- `components/settings/ProfileEditModal.tsx` — Full-screen modal for editing a question

### Route Registration

- Add `settings` stack screen group in `app/_layout.tsx`

### Tests

- One test file per new component/screen (TDD as per project rules)

---

## Design Tokens Used

- **Background:** `LinearGradient` `#FFFFFF` → `#F8F9FB` (all screens)
- **Cards:** `colors.neutral.white` + `shadows.md` + `borderRadius.lg`
- **Text:** `typographyPresets.body`, `.subhead`, `.small`
- **Section accents:** `colors.primary.base` (#FF6B35) left bar on category headers
- **Primary action:** `colors.primary.base` (switch tint)
- **Spacing:** `spacing.md` (16px) padding, `spacing.sm` (8px) gaps
- **Haptics:** Light impact for navigation, Medium impact for toggle, Success notification for answer save

---

## Key Design Decisions

- **No QuestionFlowContainer reuse** for profile editing — it's a sequential stepper, not suited for random-access editing. Instead, show a flat list with tap-to-edit.
- **Full-screen edit modal** instead of bottom sheet — avoids new dependency, input components were designed for full-screen, consistent with app patterns.
- **Reuse input components** (`SingleChoiceCards`, `MultipleChoiceCards`, `TextInput`) from `@/components/question-flow/inputs/` inside the edit modal — same look and feel as onboarding.
- **Respect conditional dependencies** — if user changes addiction type in profile, dependent answers are cleared (same `useDeleteDependentAnswers` logic).
- **No new database tables needed** — all data already exists in `question_answers` and notification permissions come from the OS.
- **Gear button absolute-positioned** — avoids modifying tab header config, future-proofs for dashboard redesign.
- **Orange accent bars** on category sections — visually distinctive and consistent with the app's energetic identity.
- **LinearGradient backgrounds** on all settings screens — matches existing `notification-permission.tsx` and onboarding patterns.

---

## Category Display Names (pt-BR)

- `PROFILE` → "Perfil"
- `ADDICTION` → "Vício"
- `HABITS` → "Hábitos"
- `MOTIVATION` → "Motivação"
- `GOALS` → "Objetivos"

---

## Onboarding Questions Reference (14 total)

- **name** — PROFILE, TEXT
- **gender** — PROFILE, SINGLE_CHOICE
- **age** — PROFILE, SINGLE_CHOICE
- **addiction_type** — ADDICTION, SINGLE_CHOICE
- **cigarettes_per_day** — HABITS, SINGLE_CHOICE (conditional: addiction_type = Cigarro/Tabaco)
- **cigarretes_cost** — HABITS, SINGLE_CHOICE (conditional: addiction_type = Cigarro/Tabaco)
- **pod_duration_days** — HABITS, SINGLE_CHOICE (conditional: addiction_type = Pod/Vape)
- **pod_cost** — HABITS, SINGLE_CHOICE (conditional: addiction_type = Pod/Vape)
- **years_smoking** — HABITS, SINGLE_CHOICE
- **quit_attempts** — MOTIVATION, SINGLE_CHOICE
- **stop_smoking_date** — MOTIVATION, SINGLE_CHOICE
- **goals** — GOALS, MULTIPLE_CHOICE
- **main_fears_and_concerns** — GOALS, MULTIPLE_CHOICE
- **religion** — PROFILE, SINGLE_CHOICE
