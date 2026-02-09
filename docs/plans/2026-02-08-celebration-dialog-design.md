# Celebration Dialog - Design Document

**Date:** 2026-02-08
**Status:** Design Complete - Ready for Implementation
**Component:** CelebrationDialog

---

## Overview

A gamified celebration dialog component for the Tabagismo smoking cessation app. Displays achievement notifications with animated coin rewards, designed to feel rewarding and motivating when users hit milestones (e.g., "5 days smoke-free", coin rewards, achievements).

**Aesthetic Direction:** "Arcade Explosion" - Retro arcade meets modern mobile game. Kinetic energy with exaggerated bounce physics, geometric rays, coin cascade, and slot machine counter.

---

## Component API

### CelebrationDialog

```typescript
interface CelebrationDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;              // e.g., "5 Dias Sem Fumar!"
  subtitle?: string;          // e.g., "Você está incrível!"
  coinsEarned: number;        // Number to animate (e.g., 25)
  autoDismissDelay?: number;  // Default: 5000ms
  testID?: string;
}
```

**Usage Example:**
```typescript
<CelebrationDialog
  visible={showCelebration}
  onDismiss={() => setShowCelebration(false)}
  title="5 Dias Sem Fumar!"
  subtitle="Continue assim!"
  coinsEarned={25}
  autoDismissDelay={5000}
/>
```

**Design Decisions:**
- **Controlled component** - Parent manages `visible` state
- **Auto-dismiss timer** resets if user interacts with modal (tap overlay or button)
- **Haptic feedback** triggers at key moments (modal open, coins land, button press)
- **Modal blocks background** interaction during display

---

## File Structure

```
/components/
  /celebration/
    CelebrationDialog.tsx          # Main orchestrator component
    CelebrationDialog.test.tsx     # Component tests
    CoinCascade.tsx                # Coin rain animation (12 coins in fan pattern)
    SlotMachineCounter.tsx         # Animated number counter with digit reels
    RadialBurst.tsx                # Background geometric ray burst
    SparkleParticles.tsx           # Confetti-like sparkle scatter
```

**Component Hierarchy:**
```
CelebrationDialog
├── Modal (React Native Modal, transparent)
│   ├── Overlay (Pressable with backdrop, tap to dismiss)
│   └── Content Container
│       ├── Animated Modal Card
│       │   ├── RadialBurst (positioned behind card)
│       │   ├── SparkleParticles (scattered around card)
│       │   ├── Title (letter-by-letter spring animation)
│       │   ├── Subtitle (fade in)
│       │   ├── CoinCascade (12 coins in parabolic arcs)
│       │   ├── SlotMachineCounter (digit reel flip animation)
│       │   └── Button (pulsing glow CTA)
```

---

## Animation Timeline

Master orchestration (all timings in milliseconds):

| Time | Animation | Duration | Easing | Haptic |
|------|-----------|----------|--------|--------|
| 0ms | Overlay fade in | 200ms | Linear | None |
| 100ms | Modal card bounce in | 300ms | Spring (damping: 12) | Success notification |
| 200ms | Radial burst expand + rotate | 500ms | Out cubic | None |
| 300ms | Coin cascade begins (staggered 50ms each) | 600ms per coin | Parabolic (in quad) | Impact on each land |
| 300ms | Sparkle particles scatter | 800-1200ms | Out cubic + spring | None |
| 500ms | Title letters bounce in (staggered 30ms) | 200ms per letter | Spring (damping: 10) | None |
| 800ms | Slot machine counter flip | 400ms | Out cubic + spring | Selection on lock |
| 1000ms | Button glow pulse starts | Infinite loop | Sequence (800ms in/out) | None |

**Total animation sequence:** ~1200ms from open to fully settled

---

## Detailed Component Designs

### 1. CoinCascade Component

**Purpose:** 12 coins rain down from top in a semi-circular fan pattern, converging at modal center.

**Physics:**

```typescript
const COIN_COUNT = 12;
const ARC_WIDTH = 180; // degrees
const SCREEN_CENTER_X = screenWidth / 2;

// Generate parabolic arc path for each coin
const generateCoinPath = (index: number) => {
  const angle = (index / (COIN_COUNT - 1)) * ARC_WIDTH - 90; // -90° to +90°
  const angleRad = (angle * Math.PI) / 180;

  return {
    startX: SCREEN_CENTER_X + Math.sin(angleRad) * 120, // Fan width: 240px
    startY: -50,                                         // Off-screen top
    endX: SCREEN_CENTER_X + Math.sin(angleRad) * 80,   // Converges to 160px width
    endY: modalCenterY,                                 // Lands at modal center
    rotation: angle * 2,                                // 2x rotation during fall
    delay: index * 50,                                  // Staggered 50ms per coin
  };
};
```

**Animation Properties:**
- **translateX/Y:** Parabolic curve using `Easing.out(Easing.quad)` for X, `Easing.in(Easing.quad)` for Y (gravity acceleration)
- **rotation:** Linear rotation (`Easing.linear`) - spins during descent
- **Landing bounce:** `withSequence(scale 1.0 → 1.2 → 1.0)` on touchdown
- **Motion blur:** `shadowRadius` increases from 2 → 8 during movement, settles at 4
- **Opacity:** Fade in over first 100ms

**Visual Style:**
- Uses existing `AnimatedCoin` component (size: 32px)
- Variant: `filled` with `showGlow: true`
- Gold shadow glow (`#F7A531`) with dynamic radius

**Haptics:**
- Medium impact feedback on each coin landing (staggered with animation)

---

### 2. SlotMachineCounter Component

**Purpose:** Animated number counter that flips like a slot machine reel, displaying coins earned.

**Structure:**
```typescript
<CounterContainer>
  <PlusSymbol>+</PlusSymbol>  {/* Animates in first */}
  <DigitReel targetDigit={2} delay={0} />
  <DigitReel targetDigit={5} delay={80} />
</CounterContainer>
```

**Digit Reel Animation:**

Each digit is a vertical strip containing [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]:

```typescript
const DigitReel = ({ targetDigit, delay }: Props) => {
  const digitHeight = 40;
  const translateY = useSharedValue(-digitHeight * 10); // Start off-screen

  useEffect(() => {
    // Scroll rapidly through numbers, overshoot target, then snap back
    translateY.value = withDelay(
      delay,
      withSequence(
        // Fast scroll to near target
        withTiming(-digitHeight * (targetDigit - 1), {
          duration: 300,
          easing: Easing.out(Easing.cubic)
        }),
        // Spring snap to exact target with overshoot
        withSpring(-digitHeight * targetDigit, {
          damping: 15,
          stiffness: 150,
          overshootClamping: false,
        })
      )
    );
  }, [targetDigit, delay]);
};
```

**Visual Style:**
- **Container:** Gold gradient pill (LinearGradient `#F7A531` → `#F39119`) matching `CoinCounter` style
- **Reel window:** Fixed height (40px) with overflow hidden
- **Gradient masks:** Top/bottom edges have subtle gradient overlay for depth
- **Typography:** Poppins Bold, 32px, white color
- **Padding:** 12px vertical, 20px horizontal
- **Shadow:** Medium gold glow

**Animation Staging:**
- Plus symbol fades in first (300ms)
- Digits animate right-to-left (staggered 80ms delay per digit)
- Haptic "selection" feedback when final digit locks in

---

### 3. RadialBurst Component

**Purpose:** Geometric rays shoot outward from behind the modal card, creating impact energy.

**Structure:**

8 lines arranged in a radial pattern (360° / 8 = 45° spacing):

```typescript
const LINE_COUNT = 8;
const lines = Array(LINE_COUNT).fill(0).map((_, index) => {
  const angle = (360 / LINE_COUNT) * index; // 0°, 45°, 90°, 135°, ...
  return { rotation: angle };
});
```

**Animation Properties:**
- **Scale:** `0 → 1.5 → 1.0` over 700ms (expands then settles)
- **Rotation:** `0° → 15°` over 700ms for dynamic motion
- **Opacity:** `0 → 0.6 → 0.3` (bright flash then subtle ambient)

**Visual Style:**
- **Line dimensions:** 4px wide × 100px long
- **Gradient:** LinearGradient from center outward (`colors.accent.gold` → transparent)
- **Position:** Absolutely positioned behind modal card (`zIndex: -1`)
- **Transform origin:** Center of modal card

---

### 4. SparkleParticles Component

**Purpose:** Small confetti-like sparkles scatter randomly around the modal for celebratory atmosphere.

**Particle Generation:**

```typescript
const PARTICLE_COUNT = 20;

// Random circular distribution around modal center
const particles = Array(PARTICLE_COUNT).fill(0).map((_, i) => {
  const angle = Math.random() * Math.PI * 2;        // Random angle
  const distance = 100 + Math.random() * 80;        // 100-180px from center

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 4 + Math.random() * 6,                    // 4-10px diameter
    delay: i * 30,                                  // 30ms stagger
    duration: 800 + Math.random() * 400,            // 800-1200ms lifespan
    color: getRandomColor(),                        // Weighted color selection
  };
});

// Weighted color distribution
const getRandomColor = () => {
  const rand = Math.random();
  if (rand < 0.6) return colors.accent.gold;        // 60%
  if (rand < 0.9) return colors.primary.light;      // 30%
  return colors.secondary.light;                    // 10%
};
```

**Animation Properties:**
- **Opacity:** Fade in (30% of duration) then fade out (70% of duration)
- **Scale:** Spring from 0 → 1 (damping: 8, stiffness: 100)
- **Distribution bias:** Weighted towards top angles (confetti falls from above)

**Visual Style:**
- **Shape:** Small circles (perfect circles, not squares)
- **Shadow:** Soft glow (`shadowRadius: 3`, `shadowOpacity: 0.6`)
- **Colors:** Gold (dominant), orange, teal (accent)

---

### 5. Modal Card & Layout

**Container Styling:**

```typescript
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.85)', // colors.neutral.black with 85% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,              // 24px
    paddingVertical: spacing.xxl,               // 48px
    paddingHorizontal: spacing.xl,              // 32px
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.xl,                              // Deep shadow for depth

    // Gold border for definition
    borderWidth: 2,
    borderColor: colors.accent.gold,

    // Prevent clipping issues
    overflow: 'visible',                        // Allow particles/burst to overflow
  },

  title: {
    ...typographyPresets.hero,                  // Poppins Bold 30px
    color: colors.primary.base,                 // Vibrant orange
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typographyPresets.body,                  // Poppins Regular 16px
    color: colors.neutral.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
```

**Modal Card Entrance:**

```typescript
// Bounce in from center with elastic overshoot
const modalScale = useSharedValue(0);
const modalTranslateY = useSharedValue(50);

useEffect(() => {
  if (visible) {
    modalScale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
      overshootClamping: false,
    });

    modalTranslateY.value = withSpring(0, {
      damping: 12,
      stiffness: 200,
    });
  }
}, [visible]);
```

---

### 6. Button Component

**Visual Style:**

```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary.base,       // Vibrant orange
    paddingVertical: spacing.md,                // 16px
    paddingHorizontal: spacing.xl * 1.5,        // 48px - wide button
    borderRadius: borderRadius.lg,              // 16px
    marginTop: spacing.lg,                      // 24px spacing from counter
    ...shadows.md,
  },

  buttonText: {
    ...typographyPresets.button,                // Poppins SemiBold 18px
    color: colors.neutral.white,
  },
});
```

**Pulsing Glow Animation:**

```typescript
const buttonGlowOpacity = useSharedValue(0);

useEffect(() => {
  // Start pulsing after 1 second (when all other animations settle)
  buttonGlowOpacity.value = withDelay(
    1000,
    withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,  // Infinite loop
      true // Reverse
    )
  );
}, []);

const buttonGlowStyle = useAnimatedStyle(() => ({
  shadowColor: colors.primary.base,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: buttonGlowOpacity.value,
  shadowRadius: 12,
  elevation: 8,
}));
```

**Interaction:**
- **Press:** Haptic light impact + scale down to 0.95 (100ms)
- **Release:** Scale back to 1.0 (150ms spring)
- **Action:** Clears auto-dismiss timer + calls `onDismiss()`

---

## Auto-Dismiss Logic

### Timer Behavior

**Rules:**
1. Timer starts when `visible` prop becomes `true`
2. Default delay: 5000ms (5 seconds)
3. Timer clears on any user interaction:
   - Tap on overlay (dismisses modal)
   - Tap on button (dismisses modal)
   - Tap anywhere on modal card (stops timer but doesn't dismiss)
4. Timer does NOT reset after clearing (one-time countdown)
5. Timer cleans up on component unmount

**Implementation:**

```typescript
const CelebrationDialog = ({
  visible,
  onDismiss,
  autoDismissDelay = 5000,
  ...props
}: Props) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isInteracted, setIsInteracted] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsInteracted(false);
      startAutoDismissTimer();
    } else {
      clearAutoDismissTimer();
    }

    return () => clearAutoDismissTimer();
  }, [visible]);

  const startAutoDismissTimer = () => {
    clearAutoDismissTimer();
    timerRef.current = setTimeout(() => {
      if (!isInteracted) {
        handleDismiss();
      }
    }, autoDismissDelay);
  };

  const clearAutoDismissTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  const handleUserInteraction = () => {
    setIsInteracted(true);
    clearAutoDismissTimer();
  };
};
```

---

## Haptic Feedback Schedule

| Event | Haptic Type | Intensity | Timing |
|-------|-------------|-----------|--------|
| Modal opens | Success notification | Heavy | On mount (100ms) |
| Each coin lands | Impact | Medium | Staggered (300-900ms) |
| Counter locks in | Selection | Light | 1200ms |
| Button press | Impact | Light | On press |
| Auto-dismiss | Impact | Light | On timer complete |

**Haptics Library:** Uses existing `@/lib/haptics` wrapper around Expo Haptics

---

## Performance Considerations

### Optimization Strategies

1. **GPU Acceleration:**
   - All animations use `transform` and `opacity` (GPU-accelerated properties)
   - Avoid animating `width`, `height`, `top`, `left` (CPU-bound layout recalc)

2. **Worklet Functions:**
   - Animation logic runs on UI thread via Reanimated worklets
   - Prevents JS thread blocking during animations

3. **Memoization:**
   - Particle positions calculated once with `useMemo()`
   - Coin paths generated once on mount
   - Static style objects moved outside render

4. **Conditional Rendering:**
   - Sub-components only mount when `visible={true}`
   - Clean up animations on unmount to prevent memory leaks

5. **Shadow Performance:**
   - Shadows pre-computed in static styles where possible
   - Animated shadows use low elevation values (<12)
   - Consider `shadowColor` opacity reduction on Android

---

## Testing Strategy

### Unit Tests

**CelebrationDialog.test.tsx:**
- ✅ Renders when `visible={true}`, hidden when `visible={false}`
- ✅ Displays correct title and subtitle text
- ✅ Shows coin count in SlotMachineCounter
- ✅ Calls `onDismiss` when button pressed
- ✅ Calls `onDismiss` when overlay tapped
- ✅ Auto-dismisses after specified delay
- ✅ Cancels auto-dismiss when user interacts
- ✅ Cleans up timer on unmount

**CoinCascade.test.tsx:**
- ✅ Renders 12 coins
- ✅ Coins start off-screen (negative Y)
- ✅ Coins animate to center position
- ✅ Staggered delays are applied correctly

**SlotMachineCounter.test.tsx:**
- ✅ Displays correct final number
- ✅ Animates digit reels independently
- ✅ Shows plus symbol before number
- ✅ Handles single-digit and multi-digit values

**RadialBurst.test.tsx:**
- ✅ Renders 8 burst lines
- ✅ Lines positioned at correct angles
- ✅ Animates scale and opacity

**SparkleParticles.test.tsx:**
- ✅ Renders 20 particles
- ✅ Particles have random positions
- ✅ Particles animate opacity and scale

### Integration Tests

- ✅ Full animation sequence completes without crashes
- ✅ Haptics trigger at correct moments
- ✅ Component works with different coin values (0, 1, 99, 999+)
- ✅ Component works with long titles (text wrapping)
- ✅ Auto-dismiss timer accuracy (within 50ms tolerance)

### Manual Testing Checklist

- [ ] Animations feel smooth (60fps on iOS, 30-60fps on Android)
- [ ] No layout shift or jank during animation
- [ ] Haptics feel appropriate (not too aggressive)
- [ ] Text is readable on both light and dark backgrounds
- [ ] Button is easy to tap (44x44 minimum touch target)
- [ ] Modal blocks background scroll
- [ ] Works correctly on different screen sizes (iPhone SE to iPad)
- [ ] Auto-dismiss timing feels right (not too fast/slow)

---

## Design Rationale

### Why "Arcade Explosion"?

**Chosen over alternatives:**
1. ❌ **"Soft Celebration"** - Too gentle for milestone achievements (better for passive notifications)
2. ❌ **"Impact Flash"** - Too aggressive/jarring (might stress users trying to quit smoking)

**Why it works:**
- **Energy level matches achievement moment** - Users deserve big celebration for quitting milestones
- **Clear visual hierarchy** - Coin cascade naturally draws eye to the reward
- **Feels unique** - Staggered cascade + slot machine counter is unexpected and memorable
- **Performance-friendly** - Mostly transforms and opacity (GPU-accelerated)
- **Fits existing style** - Builds on current coin flip animation pattern in `AnimatedCoin`

### Animation Philosophy

**Design Principles:**
1. **Orchestration over chaos** - All elements enter in a choreographed sequence
2. **Weight and physics** - Coins feel heavy, letters bounce with spring
3. **Anticipation & surprise** - Modal bounces in, coins overshoot, counter spins
4. **Reward escalation** - Animations build to the coin count reveal as climax
5. **Respectful timing** - Auto-dismiss gives enough time to appreciate the moment

**Inspiration Sources:**
- Retro arcade game "coin insert" animations
- Mobile game reward screens (Clash Royale, Candy Crush)
- iOS notification celebration patterns
- Duolingo streak animations

---

## Future Enhancements (Out of Scope)

**Potential additions for v2:**
- Sound effects (coin clink, slot machine whir)
- Confetti emoji particles (🎉 🎊 ⭐)
- Trophy/badge icon display for specific achievements
- Variable coin cascade patterns (more coins = bigger fan)
- Dark mode support with adjusted colors
- Customizable button text ("Continuar" vs "Legal!" vs custom)
- Multiple celebration types (gold/silver/bronze variants)

---

## Design Sign-Off

**Approved for implementation:** ✅

**Next Steps:**
1. Create git worktree for isolated implementation
2. Write detailed implementation plan with tasks
3. Implement components with TDD approach (90% coverage required)
4. Update `/components/CLAUDE.md` with CelebrationDialog documentation
