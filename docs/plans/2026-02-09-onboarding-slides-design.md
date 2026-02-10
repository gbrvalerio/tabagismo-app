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
  metadata: text (JSON string for flexible content like benefits list)
  createdAt: timestamp
}
```

### Update: `user_settings`

Add field: `slidesCompleted: boolean` (default: false)

### Seed Data (3 Slides)

**Slide 1 - Problem:**
- Title: "Parar de fumar é difícil sozinho"
- Description: "Você não está sozinho. Milhares de pessoas enfrentam essa mesma batalha todos os dias."
- Icon: Placeholder SVG (smoking/struggle theme, consider 35% opacity for muted "problem" tone)
- Metadata: `null`

**Slide 2 - Solution:**
- Title: "Nós ajudamos você nessa jornada"
- Description: "Com ferramentas práticas e suporte personalizado:"
- Icon: Placeholder SVG (support/helping hand theme)
- Metadata:
  ```json
  {
    "showBenefits": true,
    "benefits": [
      "Acompanhe seu progresso em tempo real",
      "Ganhe moedas e conquiste metas",
      "Receba lembretes motivacionais"
    ]
  }
  ```

**Slide 3 - Action:**
- Title: "Vamos começar juntos"
- Description: "Responda algumas perguntas rápidas e inicie sua jornada livre do cigarro."
- Icon: Placeholder SVG (success/celebration theme, consider subtle glow effect)
- Metadata: `null`

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

**Implementation Pattern:**
```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FadeInDown } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

// Parse metadata helper
const parseMetadata = (metadataString: string | null) => {
  if (!metadataString) return null;
  try {
    return JSON.parse(metadataString);
  } catch {
    return null;
  }
};

<LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
  <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    {/* Skip Button (top-right, visible on slide 2+) */}
    {currentIndex >= 1 && (
      <Animated.View entering={FadeInDown.springify()}>
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>Pular</Text>
        </Pressable>
      </Animated.View>
    )}

    <FlatList
      data={slides}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      initialNumToRender={1}
      maxToRenderPerBatch={1}
      onMomentumScrollEnd={handleScrollEnd}
      renderItem={({ item }) => {
        const metadata = parseMetadata(item.metadata);
        return (
          <SlideItem
            icon={item.icon}
            title={item.title}
            description={item.description}
            showBenefits={metadata?.showBenefits}
            benefits={metadata?.benefits}
          />
        );
      }}
      keyExtractor={(item) => item.id.toString()}
    />

    <PaginationDots total={slides.length} activeIndex={currentIndex} />

    {/* CTA Button (bottom, visible only on slide 3) */}
    {currentIndex === slides.length - 1 && (
      <Animated.View entering={FadeInDown.springify().damping(12).stiffness(200)}>
        <Pressable onPress={handleComplete}>
          <LinearGradient colors={['#F7A531', '#F39119']}>
            <Text style={styles.buttonText}>Vamos Lá!</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    )}
  </SafeAreaView>
</LinearGradient>
```

**State Management:**
```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const { data: slides, isLoading } = useOnboardingSlides();
const markCompleted = useMarkSlidesCompleted();
const router = useRouter();

const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  const offsetX = event.nativeEvent.contentOffset.x;
  const index = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
  setCurrentIndex(index);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

const handleSkip = async () => {
  await markCompleted.mutateAsync();
  router.push('/onboarding');
};

const handleComplete = async () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  await markCompleted.mutateAsync();
  router.push('/onboarding');
};
```

### Supporting Components

**`components/onboarding-slides/SlideItem.tsx`**
- Display icon (SVG placeholder), title, description
- Supports optional benefits list (extracted from metadata)
- Renders benefits card with checkmarks (matching notification-permission pattern)
- Styled with design tokens from `@/lib/theme/tokens`
- Full-width layout with centered content

**Props:**
```typescript
interface SlideItemProps {
  icon: string;
  title: string;
  description: string;
  showBenefits?: boolean;
  benefits?: string[];
}
```

**Benefits Card Structure (Slide 2):**
```typescript
{showBenefits && benefits && (
  <View style={styles.benefitsCard}>
    {benefits.map((benefit, index) => (
      <View key={index} style={styles.benefitRow}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.benefitText}>{benefit}</Text>
      </View>
    ))}
  </View>
)}

// Styles
benefitsCard: {
  backgroundColor: colors.neutral.white,
  borderRadius: borderRadius.lg,
  padding: spacing.lg,
  width: '100%',
  marginBottom: spacing.md,
  ...shadows.md,
},
benefitRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: spacing.sm,
},
checkmark: {
  fontSize: 18,
  color: colors.primary.base,
  marginRight: spacing.sm,
},
benefitText: {
  ...typographyPresets.small,
  color: colors.neutral.gray[700],
  flex: 1,
},
```

**`components/onboarding-slides/PaginationDots.tsx`**
- Visual dots showing current slide position
- Active dot: `colors.primary.base` (#FF6B35)
- Inactive dots: `colors.neutral.gray[300]` (#D1D1D1)
- Optional: Consider using mini coin icons instead of dots for gamification alignment

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

- **Background:** `LinearGradient` with colors `['#FFFFFF', '#F8F9FB']` (matches notification-permission screen)
- **Layout:** Centered content with `SafeAreaView` edges `['top', 'bottom']`
- **Icon:** Large SVG (100-120px), centered above text
- **Title:** `typographyPresets.hero` (Poppins Bold 30px, letterSpacing -0.3), centered, `colors.neutral.black`
- **Description:** `typographyPresets.body` (Poppins Regular 16px), centered, `colors.neutral.gray[600]`, max 2-3 lines
- **Spacing:** Generous vertical spacing using `spacing.xl` / `spacing.xxl` tokens
- **Benefits Card** (slide 2): White background, `borderRadius.lg`, `spacing.lg` padding, `shadows.md`

### Swipe Implementation

Use `FlatList` with:
- `horizontal={true}`
- `pagingEnabled={true}` (snap to slides)
- `showsHorizontalScrollIndicator={false}`
- `onMomentumScrollEnd` to track current slide index
- `initialNumToRender={1}` (performance optimization)
- `maxToRenderPerBatch={1}` (performance optimization)

**Haptic Feedback:**
- Light impact on swipe between slides

### Button Behavior

**Skip Button** (appears on slide 2+):
- Position: Top-right corner
- Style: Text button using `typographyPresets.body` (fontSize 14), `colors.neutral.gray[600]`
- Padding: `spacing.sm` vertical, `spacing.md` horizontal
- Action: Marks slides completed → navigates to `/onboarding`
- Animation: Fade in with `FadeInDown.springify()` on slide 2 entry
- Haptic: Light impact on press

**CTA Button** (only on slide 3):
- Position: Bottom center (above safe area)
- Style: `LinearGradient` with colors `['#F7A531', '#F39119']` (matches notification-permission)
- Text: "Vamos Lá!" using `typographyPresets.button` (Poppins SemiBold 18px), white color
- Border radius: `borderRadius.lg`
- Padding: `spacing.md` vertical, `spacing.xl` horizontal
- Press effect: Scale 0.97, opacity 0.9
- Action: Marks slides completed → navigates to `/onboarding`
- Animation: Fade in with `FadeInDown.springify().damping(12).stiffness(200)`
- Haptic: Medium impact on press

### Pagination Dots

- Position: Below description, above CTA area
- Active dot: `colors.primary.base` (#FF6B35)
- Inactive dots: `colors.neutral.gray[300]` (#D1D1D1)
- Size: 8px diameter, 6px spacing
- Updates as user swipes
- Optional enhancement: Use mini coin icons for gamification alignment

### Animations

- **Slide transitions:** Native `FlatList` momentum (smooth, performant)
- **CTA button:** `FadeInDown` from `react-native-reanimated` with spring physics
- **Skip button:** `FadeInDown` when entering slide 2
- **Button press:** Scale transform (0.97) + opacity (0.9)
- All animations use spring physics for cohesive feel

### Aesthetic Direction: "Gamified Arcade"

The app uses a vibrant, playful aesthetic with gamification elements. Slides should reflect this:

**Visual Language:**
- **Color Palette:** Energetic orange (`colors.primary.base`), electric teal (`colors.secondary.base`), gold accents
- **Typography:** Bold Poppins for hierarchy, creates friendly/approachable tone
- **Gradients:** Subtle, directional (top-to-bottom white→tinted background)
- **Shadows:** Soft, elevated cards with `shadows.md` for depth
- **Micro-interactions:** Spring physics, haptic feedback, scale transforms

**Icon Treatment (Future Enhancement):**
- Use SVG illustrations with gradient strokes (orange→teal)
- Slide 1: Grayscale/muted (35% opacity) for "problem" tone
- Slide 2: Full color, vibrant
- Slide 3: Full color with subtle glow effect (success/action theme)
- Avoid flat, generic icon styles — prefer playful, hand-drawn aesthetic

**Pagination Enhancement (Optional):**
- Replace dots with mini coin icons (16px `CoinSvg` components)
- Aligns with app's coin-based gamification
- Outlined variant for inactive, filled for active/completed
- Adds playful character while maintaining functionality

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
- Shows slide 1 on mount (no skip button visible)
- Skip button does NOT appear on slide 1
- Shows skip button on slide 2+
- Skip button fades in with animation on slide 2 entry
- CTA button does NOT appear on slides 1-2
- Shows CTA button only on slide 3
- CTA button fades in with animation on slide 3 entry
- Skip button marks completed and navigates to `/onboarding`
- CTA button marks completed and navigates to `/onboarding`
- Swipe updates pagination dots
- Scroll position resets when changing slides
- Handles loading state
- Handles empty slides (edge case)
- Haptic feedback triggers on CTA press
- Haptic feedback triggers on swipe between slides

**SlideItem Component:**
- Renders icon, title, description
- Renders benefits card when metadata.showBenefits is true
- Renders checkmark list items correctly
- Handles missing icon gracefully
- Handles missing benefits gracefully
- Applies correct styles from design tokens
- Description truncates if exceeds max length

**PaginationDots:**
- Renders correct number of dots
- Highlights active dot with primary color
- Inactive dots use gray-300 color
- Updates on slide change
- Correct spacing between dots

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

### Design System Compliance

- **Colors:** Use `colors.*` tokens exclusively (no hardcoded hex values)
- **Typography:** Use `typographyPresets.*` for all text styling
- **Spacing:** Use `spacing.*` tokens (no magic numbers)
- **Shadows:** Use `shadows.*` tokens for card elevation
- **Border Radius:** Use `borderRadius.*` tokens
- **Haptic Feedback:** Import from `@/lib/haptics` (not expo-haptics directly)
- **Gradients:** Match exact colors from notification-permission screen

### Content Strategy

- SVG icons are placeholders initially (can be replaced with custom illustrations)
- All user-facing text in Brazilian Portuguese
- Icon aesthetic: Consider vibrant orange/teal gradient strokes for gamification alignment
- Slide 2 benefits structure allows easy content updates via database

### Integration Points

- Follows existing patterns from notification-permission screen (gradient, buttons, typography)
- Matches question flow container style (SafeAreaView, LinearGradient, animation physics)
- Dynamic slide content (database-driven) allows future A/B testing
- Skip unlocks on slide 2 ensures users see at least the problem statement
- Metadata column enables flexible content structures without schema changes

### Performance Considerations

- FlatList optimizations: `initialNumToRender={1}`, `maxToRenderPerBatch={1}`
- Only 3 slides — no virtualization concerns
- Animations use native driver where possible
- Images should be optimized SVGs (not raster)

---

## File Structure

```
/app
  /onboarding-slides.tsx          # Main screen
  /onboarding-slides.test.tsx     # Screen tests

/components
  /onboarding-slides
    /index.ts                     # Barrel export for clean imports
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

**Barrel Export (`components/onboarding-slides/index.ts`):**
```typescript
export { SlideItem } from './SlideItem';
export { PaginationDots } from './PaginationDots';
```

**Usage:**
```typescript
import { SlideItem, PaginationDots } from '@/components/onboarding-slides';
```

---

## Integration Checklist

Before starting implementation, verify alignment with existing codebase:

### Visual Consistency
- [ ] LinearGradient background matches notification-permission (`['#FFFFFF', '#F8F9FB']`)
- [ ] CTA button gradient matches notification-permission (`['#F7A531', '#F39119']`)
- [ ] Button typography uses `typographyPresets.button` (Poppins SemiBold 18px)
- [ ] Skip button matches secondary button pattern from notification screen
- [ ] Icon size is 100-120px (consistent with notification bell emoji scale)

### Design Tokens
- [ ] All colors reference `colors.*` paths (no hardcoded hex)
- [ ] All spacing uses `spacing.*` tokens (no magic numbers)
- [ ] All typography uses `typographyPresets.*` or `typography.*`
- [ ] Shadows applied from `shadows.*` tokens (not inline)
- [ ] Border radius uses `borderRadius.*` tokens

### Component Patterns
- [ ] SafeAreaView uses edges `['top', 'bottom']` (matches question flow)
- [ ] FlatList has performance optimizations (`initialNumToRender`, `maxToRenderPerBatch`)
- [ ] Animations use `FadeInDown` from react-native-reanimated
- [ ] Button press effects use scale 0.97 + opacity 0.9 pattern
- [ ] Benefits card matches notification-permission structure

### Functionality
- [ ] Haptic feedback imports from `@/lib/haptics` (not expo-haptics)
- [ ] Navigation uses `router.push('/onboarding')` after completion
- [ ] Metadata parsing handles JSON.parse errors gracefully
- [ ] Skip button hidden on slide 1 (not just opacity 0)
- [ ] CTA button only renders on slide 3 (not hidden on slides 1-2)

### Testing
- [ ] All test scenarios from plan are covered
- [ ] Haptic feedback is mocked in tests
- [ ] Animation entrance tests use `findByTestId` (async wait)
- [ ] 90%+ coverage achieved before CI push

### Database
- [ ] Schema includes `metadata` text column
- [ ] Seed data has all 3 slides with correct metadata structure
- [ ] Migration file converted from .sql to .ts (Metro bundler requirement)
- [ ] Repository hooks follow existing naming pattern
