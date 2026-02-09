# Gamified Onboarding Redesign

**Date:** 2026-02-08
**Status:** Approved Design
**Style:** Modern Minimalist Game UI

---

## Overview

Complete redesign of the onboarding experience with a flattened, game-like interface. Replaces card-based layout with seamless gradient background, enhances coin system with SVG assets and 3D animations, and creates a cohesive gamified flow using Poppins typography.

---

## Design Principles

1. **Modern Minimalist** — Clean, flat design with smooth gradients and crisp animations
2. **Gamified Flow** — Progress feels like advancing through game levels
3. **Seamless Experience** — No visual barriers, everything flows together
4. **Satisfying Feedback** — Every interaction has tactile, responsive feedback
5. **Visual Hierarchy** — Clear focus on the question (hero element) and action buttons

---

## 1. Overall Layout & Visual Hierarchy

### Background
- **Gradient:** White (#FFFFFF) at top → Soft blue-gray (#F8F9FB) at bottom
- **Effect:** Creates depth without competing with content
- **Benefit:** Cool tones make warm gold coins pop

### Layout Zones

#### Header (Fixed Top)
- **Left:** "← Voltar" button (Poppins Medium, 16px, #666666)
- **Right:** Coin counter HUD (pill-shaped, gradient)
- **Below:** Enhanced coin trail progress indicator
- **Separator:** None - seamless flow into content

#### Content (Scrollable Middle)
- **Question text:** Directly on gradient (no card wrapper)
  - Font: Poppins Bold, 30px
  - Color: #1A1A1A
  - Padding: 24px top for breathing room
- **Input components:** Soft elevated cards
  - Background: White
  - Shadow: Subtle (0px 2px 8px rgba(0,0,0,0.06))
  - Border radius: 12-16px

#### Footer (Fixed Bottom)
- **Button:** Full-width gradient pill (appears when answered)
- **Margins:** 16px horizontal, 20px vertical
- **Style:** Primary gradient, Poppins SemiBold, 18px

---

## 2. Coin Components & Animations

### Coin SVG Implementation

**Component:** `<CoinSvg>`
- Uses `react-native-svg` to render `assets/images/coin.svg`
- Accepts `size` prop for scaling
- Supports animated `scaleX` for 3D flip effect
- Can apply glow via drop shadow filters

**SVG Colors:**
- Gold: #F7A531
- Amber: #F39119
- Orange: #ED6F17

### Coin Counter HUD (Top-Right)

**Container:**
- Shape: Pill (full border radius)
- Background: Gradient from gold (#F7A531) to amber (#F39119)
- Padding: 8px vertical, 12px horizontal
- Shadow: Soft amber glow (0px 2px 8px rgba(247,165,49,0.3))

**Layout:**
- Horizontal flexbox
- Left: Coin SVG (24px)
- Gap: 6px
- Right: Count number (Poppins Bold, 18px, white)

**Animation:**
- Triggers: When count increments
- Effect: Scale bounce (1 → 1.15 → 1)
- Duration: 400ms
- Spring: damping 10, stiffness 200

### Enhanced Coin Trail

**Container:**
- Full width with 16px horizontal padding
- Coins evenly spaced across width

**Coin States:**
- **Outlined (not earned):**
  - SVG at 35% opacity
  - Gray tone
  - Size: 16px
- **Filled (earned):**
  - Full color SVG
  - Subtle golden glow (drop shadow: 0px 2px 4px rgba(247,165,49,0.4))
  - Size: 16px
- **Current (highlighted):**
  - Pulsing scale animation (1 → 1.2 → 1)
  - Duration: 1000ms per cycle
  - Repeat: Infinite
  - Easing: Ease-in-out

**Connecting Element:**
- Thin progress line (2px height)
- Color: Light gray (#E5E5E5)
- Positioned behind coins
- Fills with gold gradient (#F7A531 → #F39119) as progress increases

### Coin Earn Animation (On Trail)

**Trigger:** Question answered for first time

**Animation Sequence (600ms):**

```
0ms: Start
  - Haptic fires (success notification)
  - Shadow blur: 4px

0-300ms: First half rotation
  - scaleX: 1 → 0 (flip to edge)
  - Shadow blur: 4 → 12px (glow intensifies)

300ms: Midpoint
  - State changes: outlined → filled
  - scaleX at 0 (edge view)

300-600ms: Second half rotation
  - scaleX: 0 → 1 (flip completes)
  - Shadow blur: 12 → 6px (settles)

600ms: End
  - Coin in filled state with subtle glow
  - Counter HUD bounces simultaneously
```

**Implementation:**
- Animation happens directly on the trail (no flying coin)
- 3D flip effect using scaleX transforms (Y-axis rotation simulation)
- Synchronized glow pulse via shadow blur radius
- Haptic feedback at start

---

## 3. Input Components Styling

### Single Choice & Multiple Choice Cards

**Card Style:**
- Background: White (#FFFFFF)
- Border radius: 12px
- Shadow: 0px 2px 8px rgba(0,0,0,0.06)
- Padding: 16px vertical, 20px horizontal
- Margin: 12px bottom spacing
- Border: 2px solid
  - Default: Transparent
  - Selected: Primary color

**Text:**
- Font: Poppins Regular
- Size: 16px
- Color: #333333

**Interaction:**
- Press: Scale to 0.97, spring back to 1.0
- Duration: 100ms down, 200ms spring back
- Haptic: Light impact
- Selected state: Background tint (primary at 5% opacity)

### Text Input

**Container:**
- Background: White
- Border radius: 12px
- Shadow: 0px 2px 8px rgba(0,0,0,0.06)
- Padding: 16px

**Border:**
- Style: 2px bottom border only
- Default: Light gray (#E5E5E5)
- Focused: Primary color
- Transition: 200ms ease-out

**Input Text:**
- Font: Poppins Regular
- Size: 16px
- Color: #1A1A1A
- Placeholder: #999999

**Behavior:**
- Auto-focus: 300ms delay (maintained)

### Number Input

Same as text input, plus:
- Keyboard type: Numeric
- Input mode: Decimal
- Validation: Parse to integer
- Error state: Red border (#EF4444) with shake animation

### General Input Behavior

- Animate in with question (fade + slide up, 100ms delay)
- Smooth state transitions (200ms ease-out)
- Minimum 48px height (accessibility)
- Error states use shake animation (similar to button idle shake)

---

## 4. Buttons & Typography System

### Primary Action Buttons

**"Próxima" Button:**
- Width: Full width minus 32px margins
- Height: 56px
- Border radius: 28px (pill)
- Background: Gradient (primary → darker primary, left to right)
- Shadow: 0px 4px 12px rgba(primary, 0.25)
- Text: "Próxima →" (Poppins SemiBold, 18px, white)

**"Concluir" Button:**
- Same dimensions as Próxima
- Background: Gradient (#10B981 → #059669)
- Shadow: 0px 4px 12px rgba(16,185,129,0.25)
- Text: "✓ Concluir" (Poppins SemiBold, 18px, white)

**Interaction:**
- Press: Scale to 0.96, spring back to 1.0
- Duration: 150ms
- Spring: damping 15, stiffness 300
- Haptic: Medium impact
- Entry: Fade in from bottom with spring (100ms delay after answer)

### Back Button ("Voltar")

**Style:**
- Minimal text-only
- Text: "← Voltar" (Poppins Medium, 16px, #666666)
- Padding: 12px (generous tap area)
- Position: Top-left, 16px from edges

**Interaction:**
- Press: Opacity to 0.6
- Haptic: Light impact

### Typography Scale

```typescript
// Hero (Questions)
{
  fontFamily: 'Poppins_700Bold',
  fontSize: 30,
  lineHeight: 38,
  color: '#1A1A1A',
  letterSpacing: -0.3,
}

// Subhead (Input labels)
{
  fontFamily: 'Poppins_500Medium',
  fontSize: 14,
  lineHeight: 20,
  color: '#666666',
}

// Body (Choice text, helper text)
{
  fontFamily: 'Poppins_400Regular',
  fontSize: 16,
  lineHeight: 24,
  color: '#333333',
}

// Button Text
{
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 18,
  lineHeight: 24,
  color: '#FFFFFF',
}

// Coin Counter
{
  fontFamily: 'Poppins_700Bold',
  fontSize: 18,
  lineHeight: 24,
  color: '#FFFFFF',
}

// Small (Secondary labels)
{
  fontFamily: 'Poppins_400Regular',
  fontSize: 14,
  lineHeight: 20,
  color: '#999999',
}
```

**Font Loading:**
```bash
npm install @expo-google-fonts/poppins
```

Required fonts:
- `Poppins_400Regular`
- `Poppins_500Medium`
- `Poppins_600SemiBold`
- `Poppins_700Bold`

---

## 5. Animations & Transitions

### Screen Transitions (Between Questions)

**Question Text:**
- Fade out: 200ms
- Fade in new: 300ms with slide up (10px)
- Easing: Ease-out cubic

**Input Area:**
- Cross-fade: 250ms
- New inputs slide up: 15px
- Stagger: Inputs animate 100ms after question

### Micro-interactions

**Button Press:**
- Duration: 150ms
- Scale: 1.0 → 0.96 → 1.0
- Spring: damping 15, stiffness 300
- Haptic: At press start

**Choice Card Tap:**
- Scale duration: 100ms down, 200ms spring back
- Scale: 1.0 → 0.97 → 1.0
- Border color: Animates to primary (200ms ease-out)
- Background tint: Fades in (150ms)
- Haptic: Light impact

**Coin Trail - Current Highlight:**
- Scale pulse: 1.0 → 1.2 → 1.0
- Duration: 1000ms per cycle
- Repeat: Infinite
- Easing: Ease-in-out sine wave

**Question Entry:**
- Initial: opacity 0, translateY +20px, scale 0.96
- Sequence:
  1. Opacity: 0 → 1 (200ms)
  2. TranslateY: +20 → 0 (300ms spring)
  3. Scale: 0.96 → 1.0 (250ms spring, 50ms delay)
- Spring: damping 18, stiffness 120

**Button Entry (when answered):**
- Initial: opacity 0, translateY +30px
- Animation: Fade + slide up (300ms)
- Spring overshoot: Slight bounce
- Delay: 100ms after answer selected

### Performance

- Use `useNativeDriver: true` for transform/opacity
- Avoid animating layout properties
- Reuse animation values (Reanimated shared values)
- Keep animations under 600ms
- Use spring physics for natural motion

---

## Component Changes Summary

### Components to Update

1. **OnboardingContainer.tsx**
   - Remove QuestionCard wrapper
   - Add gradient background view
   - Update layout structure (header/content/footer)
   - Remove header separator line
   - Update button styles

2. **QuestionCard.tsx**
   - DELETE (no longer used)

3. **CoinIcon.tsx**
   - REPLACE with CoinSvg.tsx
   - Implement SVG rendering from assets/images/coin.svg
   - Add 3D flip animation support (scaleX)
   - Add glow filter support

4. **CoinCounter.tsx**
   - Update to pill-shaped gradient container
   - Use new CoinSvg component
   - Update typography to Poppins Bold

5. **CoinTrail.tsx**
   - Increase coin size (12px → 16px)
   - Use new CoinSvg component
   - Add connecting progress line
   - Add gold fill gradient for progress
   - Update glow effects

6. **CoinBurstAnimation.tsx**
   - REMOVE flying animation
   - Animation now handled in CoinTrail
   - May delete this component entirely

7. **QuestionText.tsx**
   - Update to Poppins Bold, 30px
   - Update color to #1A1A1A
   - Add letter spacing -0.3px

8. **SingleChoiceCards.tsx / MultipleChoiceCards.tsx**
   - Update card styling (shadows, borders, padding)
   - Add scale press animation
   - Update typography to Poppins

9. **TextInput.tsx / NumberInput.tsx**
   - Update styling (shadows, borders)
   - Update typography to Poppins

### New Components to Create

1. **CoinSvg.tsx**
   - Renders coin.svg asset
   - Accepts size, animated scaleX, glow props
   - Reusable across CoinCounter, CoinTrail, animations

### Theme Updates

Update `/lib/theme/tokens.ts` to include Poppins typography tokens:

```typescript
export const typography = {
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  // ... rest of typography tokens
}
```

---

## Implementation Notes

### Font Setup

1. Install fonts:
```bash
npm install @expo-google-fonts/poppins expo-font
```

2. Load in `app/_layout.tsx`:
```typescript
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';

// In component
const [fontsLoaded] = useFonts({
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
});
```

### SVG Setup

1. Install react-native-svg (likely already installed with Expo)
2. Create SvgXml or SvgUri component wrapper
3. Import coin.svg as asset

### Gradient Background

Use `LinearGradient` from `expo-linear-gradient`:
```typescript
<LinearGradient
  colors={['#FFFFFF', '#F8F9FB']}
  style={styles.background}
>
  {/* content */}
</LinearGradient>
```

### Animation Libraries

- React Native Reanimated 2 (already in use)
- Expo Haptics (already in use)

---

## Success Metrics

- **Visual Impact:** Onboarding feels game-like and engaging
- **Performance:** All animations run at 60fps
- **Usability:** Clear visual hierarchy, obvious next actions
- **Delight:** Coin earn animation creates satisfying reward feedback
- **Consistency:** Typography and spacing consistent throughout

---

## Future Enhancements (Out of Scope)

- Sound effects on coin earn
- Particle effects on coin earn
- Animated background patterns
- Celebration animation on completion
- Leaderboard or achievement system
