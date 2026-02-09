# Gamified Onboarding UI Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans OR superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Redesign onboarding with flattened game-like UI, SVG coin animations, Poppins typography, and gradient backgrounds per approved design spec.

**Architecture:** Replace QuestionCard with direct-on-gradient layout using LinearGradient. Create CoinSvg component for SVG rendering. Load Poppins fonts. Enhance CoinTrail with progress line and 3D flip animations. Update all input components with new styling and press animations. Remove old CoinBurstAnimation (animation moves to CoinTrail).

**Tech Stack:** React Native, Reanimated 2, expo-linear-gradient, react-native-svg, @expo-google-fonts/poppins

**Design Reference:** `/docs/plans/2026-02-08-gamified-onboarding-redesign.md`

---

## High-Level Task Breakdown

1. **Setup** — Install dependencies, load fonts, update theme tokens
2. **Core Components** — CoinSvg, AnimatedCoin with 3D flip
3. **UI Components** — Update CoinCounter (pill), CoinTrail (progress line), QuestionText (Poppins)
4. **Input Components** — Restyle choice cards and text inputs
5. **Main Container** — Redesign OnboardingContainer with gradient background
6. **Cleanup** — Remove old components, update tests
7. **Polish** — Manual testing, documentation

---

## Detailed Implementation Steps

### Phase 1: Setup & Foundation

**Task 1: Install Dependencies**
- Run: `npm install @expo-google-fonts/poppins react-native-svg`
- Commit: "chore: add poppins fonts and svg dependencies"

**Task 2: Update Theme Tokens**
- Add Poppins font families to `lib/theme/tokens.ts`
- Add typography presets (hero, body, button, coinCounter, etc.)
- Write tests for new tokens
- Commit: "feat(theme): add Poppins typography tokens and presets"

**Task 3: Load Fonts in Root Layout**
- Import and load Poppins fonts in `app/_layout.tsx`
- Add `fontsLoaded` check before rendering
- Write tests for font loading
- Commit: "feat(fonts): load Poppins fonts in root layout"

---

### Phase 2: Coin SVG Implementation

**Task 4: Create CoinSvg Component**
- Create `components/onboarding/CoinSvg.tsx`
- Render coin.svg using react-native-svg
- Support size, variant (outlined/filled), showGlow props
- Support animated scaleX for 3D flip
- Write comprehensive tests
- Commit: "feat(coin): create CoinSvg component with SVG rendering"

**Task 5: Create AnimatedCoin Component**
- Create `components/onboarding/AnimatedCoin.tsx`
- Implement 3D flip animation (scaleX: 1 → 0 → 1)
- Implement glow pulse (shadow radius: 4 → 12 → 6)
- Implement highlight pulse for current question
- Duration: 600ms total
- Write tests for animation triggers
- Commit: "feat(coin): add AnimatedCoin with 3D flip animation"

---

### Phase 3: Update Existing Coin Components

**Task 6: Redesign CoinCounter**
- Update to pill-shaped gradient container (gold → amber)
- Use CoinSvg instead of emoji
- Update typography to Poppins Bold
- Add amber glow shadow
- Update tests
- Commit: "feat(coin): update CoinCounter with pill gradient design"

**Task 7: Enhance CoinTrail**
- Increase coin size (12px → 16px)
- Add progress line (2px gray background)
- Add gold gradient fill for progress
- Use AnimatedCoin for 3D flip on earn
- Add `animatingCoinIndex` and `onCoinAnimationComplete` props
- Update tests
- Commit: "feat(coin): enhance CoinTrail with progress line and 3D flip"

**Task 8: Update QuestionText**
- Apply Poppins Bold, 30px
- Use hero typography preset from tokens
- Letter spacing -0.3px
- Color #1A1A1A
- Update tests
- Commit: "feat(onboarding): update QuestionText with Poppins hero typography"

---

### Phase 4: Input Component Styling

**Task 9: Update Choice Card Components**
- **SingleChoiceCards & MultipleChoiceCards:**
  - White background, 12px border radius
  - Soft shadow (0px 2px 8px rgba(0,0,0,0.06))
  - 2px border (transparent default, primary when selected)
  - Poppins Regular text, 16px
  - Scale press animation (1.0 → 0.97 → 1.0)
  - Background tint when selected (5% primary opacity)
  - Update tests
- Commit: "feat(inputs): update choice cards with new styling and animations"

**Task 10: Update Text & Number Inputs**
- White background, 12px border radius
- Soft shadow (0px 2px 8px rgba(0,0,0,0.06))
- 2px bottom border (gray default, primary when focused)
- Poppins Regular, 16px
- Auto-focus 300ms delay
- Update tests
- Commit: "feat(inputs): update text and number inputs with new styling"

---

### Phase 5: Main Container Redesign

**Task 11: Remove Old Components**
- Delete `CoinBurstAnimation.tsx` + test
- Delete `QuestionCard.tsx` + test
- Delete `CoinIcon.tsx` + test
- Commit: "refactor(coin): remove old CoinBurst, QuestionCard, and CoinIcon components"

**Task 12: Redesign OnboardingContainer**
- Add LinearGradient background (#FFFFFF → #F8F9FB)
- Remove QuestionCard wrapper (render question text directly)
- Remove header separator line
- Update header layout (Back button + spacer + CoinCounter)
- Update CoinTrail to use AnimatedCoin
- Add `animatingCoinIndex` state
- Trigger animation on coin award
- Update button styles (gradient pills with shadows)
- Update all typography to Poppins
- Update tests
- Commit: "feat(onboarding): redesign container with gradient background and flat layout"

---

### Phase 6: Integration & Testing

**Task 13: Wire Coin Animation**
- Update OnboardingContainer `handleAnswer`:
  - Set `animatingCoinIndex` to `currentIndex` on first-time answer
  - Trigger coin flip animation in CoinTrail
  - Clear `animatingCoinIndex` on animation complete
- Update tests
- Commit: "feat(coin): wire 3D flip animation to answer flow"

**Task 14: Run Full Test Suite**
- Run: `npm test`
- Verify all tests pass
- Run: `npm test -- --coverage`
- Verify coverage ≥ 90%
- Fix any failing tests
- Commit: "test: fix failing tests after redesign"

**Task 15: Typecheck & Lint**
- Run: `npm run typecheck`
- Run: `npm run lint`
- Fix any errors
- Commit: "chore: fix linting and type errors"

---

### Phase 7: Manual QA & Polish

**Task 16: Manual Testing (iOS)**
- Run: `npm run ios`
- Test checklist:
  - [ ] Fonts load correctly (Poppins visible)
  - [ ] Gradient background renders smoothly
  - [ ] Coins display using SVG (not emoji)
  - [ ] Coin counter has pill gradient design
  - [ ] Coin trail shows progress line
  - [ ] 3D flip animation works on answer
  - [ ] Input components have new styling
  - [ ] Buttons have gradient backgrounds
  - [ ] Animations run at 60fps
  - [ ] No layout issues
- Fix any visual issues
- Commit: "polish(onboarding): iOS visual adjustments"

**Task 17: Manual Testing (Android)**
- Run: `npm run android`
- Test same checklist as iOS
- Fix platform-specific issues
- Commit: "polish(onboarding): Android visual adjustments"

---

### Phase 8: Documentation

**Task 18: Update Component Documentation**
- Update `components/CLAUDE.md`:
  - Document new CoinSvg component
  - Document AnimatedCoin component
  - Update CoinCounter (pill design)
  - Update CoinTrail (progress line, 3D flip)
  - Remove old components (CoinBurstAnimation, QuestionCard, CoinIcon)
  - Update input component docs
  - Update QuestionText (Poppins)
- Commit: "docs: update component documentation for gamified redesign"

**Task 19: Final Verification**
- Run: `npm test` (all pass)
- Run: `npm run typecheck` (no errors)
- Run: `npm run lint` (no errors)
- Test git hooks work
- Create final commit if needed
- Commit: "chore: final cleanup and polish"

---

## Completion Checklist

- [ ] Dependencies installed (@expo-google-fonts/poppins, react-native-svg)
- [ ] Poppins fonts loading successfully
- [ ] Theme tokens updated with typography presets
- [ ] CoinSvg component created
- [ ] AnimatedCoin component with 3D flip created
- [ ] CoinCounter redesigned (pill gradient)
- [ ] CoinTrail enhanced (progress line + 3D flip)
- [ ] QuestionText updated (Poppins Bold 30px)
- [ ] Choice cards restyled (soft shadows, press animations)
- [ ] Text/number inputs restyled
- [ ] Old components deleted (CoinBurstAnimation, QuestionCard, CoinIcon)
- [ ] OnboardingContainer redesigned (gradient background, flat layout)
- [ ] Coin animation wired to answer flow
- [ ] All tests passing (90%+ coverage)
- [ ] Typecheck passing
- [ ] Lint passing
- [ ] Manual testing complete (iOS + Android)
- [ ] Documentation updated
- [ ] Git hooks working

---

## Key Technical Details

### 3D Flip Animation (AnimatedCoin)
```typescript
// Simulates Y-axis rotation using scaleX
scaleX: 1 → 0 (flip to edge) → 1 (flip completes)
Duration: 300ms each half = 600ms total
Glow: shadowRadius 4 → 12 → 6
State change at midpoint (scaleX = 0): outlined → filled
```

### Gradient Background (OnboardingContainer)
```typescript
<LinearGradient
  colors={['#FFFFFF', '#F8F9FB']}
  style={styles.gradient}
>
```

### Pill Design (CoinCounter)
```typescript
<LinearGradient
  colors={['#F7A531', '#F39119']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.container}
>
```

### Typography (Poppins)
```typescript
hero: { fontFamily: 'Poppins_700Bold', fontSize: 30, lineHeight: 38, letterSpacing: -0.3 }
body: { fontFamily: 'Poppins_400Regular', fontSize: 16, lineHeight: 24 }
button: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, lineHeight: 24 }
```

---

## Notes

- **TDD Approach:** Write test → watch fail → implement → watch pass → commit
- **Frequent Commits:** Commit after each passing test/task
- **Performance:** Use `useNativeDriver: true` for all animations
- **Cross-platform:** Test on both iOS and Android
- **Design Reference:** See `/docs/plans/2026-02-08-gamified-onboarding-redesign.md` for full specs
