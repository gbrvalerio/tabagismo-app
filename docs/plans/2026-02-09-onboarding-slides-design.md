# Onboarding Slides Design

**Date:** 2026-02-09
**Status:** Approved
**Feature:** Informational onboarding slides phase

---

## Overview

Add an initial informational onboarding phase with swipeable slides before the existing questions and notification permission flow. Users will see 3 problem-solution slides with icons, titles, and descriptions.

---

## User Flow

```
1. App Launch
   ↓
2. OnboardingGuard checks slidesCompleted
   ↓ (if false)
3. /onboarding-slides (NEW)
   ↓ (after CTA on slide 3)
4. /onboarding (questions - existing)
   ↓ (after questions complete)
5. /notification-permission (existing)
   ↓
6. /(tabs)
```

---

## Database Schema

### New Table: `onboarding_slides`

```typescript
{
  id: integer (primary key)
  order: integer (for sequencing slides)
  icon: string (SVG file path, e.g., '@/assets/images/onboarding-1.svg')
  title: string (Brazilian Portuguese)
  description: string (Brazilian Portuguese)
  createdAt: timestamp
}
```

### Update: `user_settings`

Add field: `slidesCompleted: boolean` (default: false)

### Seed Data (3 Slides)

**Slide 1 - Problem:**
- Title: "Parar de fumar é difícil sozinho"
- Description: Brief empathy statement about the difficulty of quitting
- Icon: Placeholder SVG (smoking/struggle theme)

**Slide 2 - Solution:**
- Title: "Nós ajudamos você nessa jornada"
- Description: How the app supports users in quitting
- Icon: Placeholder SVG (support/helping hand theme)

**Slide 3 - Action:**
- Title: "Vamos começar juntos"
- Description: Encouragement + transition to questions
- Icon: Placeholder SVG (success/celebration theme)

---

## Repository Hooks

- `useOnboardingSlides()` - Fetch slides ordered by `order` field
- `useMarkSlidesCompleted()` - Mutation to set `slidesCompleted = true`
- `useSlidesStatus()` - Check if slides already viewed

---

## Component Architecture

### New Route: `/onboarding-slides`

**Configuration:**
- Registered in `app/_layout.tsx` as stack screen
- `gestureEnabled: false` (prevent swipe dismiss)
- `headerShown: false` (full-screen experience)

### Main Screen: `app/onboarding-slides.tsx`

**Responsibilities:**
- Fetch slides with `useOnboardingSlides()`
- Manage current slide index state
- Handle swipe gestures via `FlatList` with horizontal pagination
- Show Skip button on slide 2+
- Show CTA button on slide 3
- Call `useMarkSlidesCompleted()` on completion/skip
- Navigate to `/onboarding` after completion

### Supporting Components

**`components/onboarding-slides/SlideItem.tsx`**
- Display icon (SVG placeholder), title, description
- Styled with design tokens

**`components/onboarding-slides/PaginationDots.tsx`**
- Visual dots showing current slide position
- Active dot highlighted

### OnboardingGuard Update

**Current behavior:** Checks `onboardingCompleted` → redirects to `/onboarding`

**New behavior:**
1. Check `slidesCompleted` first
2. If false → redirect to `/onboarding-slides`
3. If true → check `onboardingCompleted`
4. Redirect priority: slides → questions → notification → tabs

---

## UI Design

### Visual Design

- **Background:** `LinearGradient` (white to light blue, matching notification screen)
- **Layout:** Centered content with `SafeAreaView`
- **Icon:** Large SVG (80-100px), centered above text
- **Title:** `typographyPresets.hero`, centered, black
- **Description:** `typographyPresets.body`, centered, gray-600, max 2-3 lines
- **Spacing:** Generous vertical spacing using xl/xxl tokens

### Swipe Implementation

Use `FlatList` with:
- `horizontal={true}`
- `pagingEnabled={true}` (snap to slides)
- `showsHorizontalScrollIndicator={false}`
- `onMomentumScrollEnd` to track current slide index

### Button Behavior

**Skip Button** (appears on slide 2+):
- Position: Top-right corner
- Style: Text button, subtle (gray-600)
- Action: Marks slides completed → navigates to `/onboarding`

**CTA Button** (only on slide 3):
- Position: Bottom center (above safe area)
- Style: Gradient button (orange, matching notification permission screen)
- Text: "Começar" or "Vamos Lá!"
- Action: Marks slides completed → navigates to `/onboarding`

### Pagination Dots

- Position: Below description, above CTA area
- Active dot: Orange gradient
- Inactive dots: Gray-300
- Updates as user swipes

### Animations

- Smooth slide transitions (native `FlatList` momentum)
- Fade-in CTA button on slide 3 entry
- No complex animations (prioritize performance)

---

## Testing Strategy

### Test Files

- `app/onboarding-slides.test.tsx` - Main screen behavior
- `components/onboarding-slides/SlideItem.test.tsx` - Individual slide rendering
- `components/onboarding-slides/PaginationDots.test.tsx` - Dot indicators
- `db/repositories/onboarding-slides.repository.test.ts` - Database hooks

### Key Test Scenarios

**Main Screen:**
- Fetches and displays slides in correct order
- Shows slide 1 on mount (no skip button)
- Shows skip button on slide 2
- Shows CTA button only on slide 3
- Skip button marks completed and navigates to `/onboarding`
- CTA button marks completed and navigates to `/onboarding`
- Swipe updates pagination dots
- Handles loading state
- Handles empty slides (edge case)

**SlideItem Component:**
- Renders icon, title, description
- Handles missing icon gracefully
- Applies correct styles

**PaginationDots:**
- Renders correct number of dots
- Highlights active dot
- Updates on slide change

**Repository Hooks:**
- `useOnboardingSlides` returns slides ordered by `order` field
- `useMarkSlidesCompleted` updates setting to true
- `useSlidesStatus` returns correct completion state

**OnboardingGuard Update:**
- Redirects to `/onboarding-slides` if not completed
- Allows through to questions if slides completed
- Priority: slides → questions → notification → tabs

### TDD Approach

- Red phase: Write tests first (use `--no-verify` for commits)
- Green phase: Implement to pass tests
- Refactor phase: Clean up code
- **Target:** 90%+ coverage (CI requirement)

---

## Implementation Notes

- SVG icons are placeholders initially (can be replaced later)
- All user-facing text in Brazilian Portuguese
- Follows existing patterns from notification permission screen
- Dynamic slide content (database-driven) allows future A/B testing
- Skip unlocks on slide 2 ensures users see at least the problem statement

---

## File Structure

```
/app
  /onboarding-slides.tsx          # Main screen
  /onboarding-slides.test.tsx     # Screen tests

/components
  /onboarding-slides
    /SlideItem.tsx                # Individual slide component
    /SlideItem.test.tsx
    /PaginationDots.tsx           # Dot indicators
    /PaginationDots.test.tsx

/db
  /schema
    /onboarding-slides.ts         # Table schema
  /repositories
    /onboarding-slides.repository.ts      # Query/mutation hooks
    /onboarding-slides.repository.test.ts
  /migrations
    /XXXX_add_onboarding_slides.ts        # Migration file

/assets
  /images
    /onboarding-1.svg             # Placeholder (problem)
    /onboarding-2.svg             # Placeholder (solution)
    /onboarding-3.svg             # Placeholder (action)
```
