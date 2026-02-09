# Onboarding Animations Improvement

## Problem

The original onboarding animations were clunky and lacked flow:
- Cards animated on mount with rotation, but transitions between questions felt abrupt
- No visual continuity when navigating between questions
- Missing contextual hints to guide user progression
- Animation felt "all at once" rather than choreographed

## Solution

### 1. Smooth Question-to-Question Transitions

**Before:** Card would just appear with same mount animation each time
**After:** Smooth cross-fade and slide transition keyed to `questionKey`

**Implementation in `QuestionCard.tsx`:**
- Added `questionKey` prop to trigger re-animation on question change
- Replaced clunky rotation with clean horizontal slide (`translateX: 50 → 0`)
- Staggered entrance: opacity → slide → subtle scale
- Uses gentleSpring for organic feel without being bouncy

```typescript
useEffect(() => {
  translateX.value = 50;
  opacity.value = 0;
  scale.value = 0.96;

  opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
  translateX.value = withSpring(0, { damping: 18, stiffness: 120 });
  scale.value = withDelay(50, withSpring(1, { damping: 15, stiffness: 140 }));
}, [questionKey]); // Re-triggers when question changes
```

### 2. Idle Engagement Animations

**Feature:** After 3 seconds of idle time on an answered question, the Next/Finish button animates to encourage progression

**Implementation in `OnboardingContainer.tsx`:**
- Horizontal shake animation (gentle wiggle: 6px → -6px → 4px → -4px → 0)
- Subtle pulse (scale: 1.0 → 1.05 → 1.0)
- Timer automatically resets on navigation (next/back)
- Only triggers when question is answered

```typescript
useEffect(() => {
  if (idleTimerRef.current) {
    clearTimeout(idleTimerRef.current);
  }

  buttonShake.value = 0;
  buttonScale.value = 1;

  if (isAnswered) {
    idleTimerRef.current = setTimeout(() => {
      // Shake + pulse animations
      buttonShake.value = withSequence(/* ... */);
      buttonScale.value = withSequence(/* ... */);
    }, 3000);
  }

  return () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  };
}, [isAnswered, currentIndex]);
```

### 3. Animation Architecture

**Design Tokens Used:**
- `timing.fast` (200ms) - Quick opacity transitions
- `animations.gentleSpring` - Smooth, modern feel for slides
- Custom spring configs for subtle scale effects

**Animation Principles Applied:**
1. **Subtlety** - Felt, not seen. No exaggerated movements
2. **Choreography** - Staggered timing creates flow (opacity → slide → scale)
3. **Purpose** - Every animation serves UX (transitions = continuity, shake = guidance)
4. **Performance** - Native Reanimated for 60fps smoothness

## Key Changes

### Files Modified

1. **`QuestionCard.tsx`**
   - Added `questionKey: string` prop
   - Replaced rotation animation with horizontal slide
   - Simplified to 3 animated values: `translateX`, `opacity`, `scale`
   - Animation re-triggers when `questionKey` changes

2. **`OnboardingContainer.tsx`**
   - Added idle timer logic with cleanup
   - Added button shake/pulse animations
   - Wrapped buttons in `Animated.View` for smooth animations
   - Passed `questionKey` to `QuestionCard` component

3. **`QuestionCard.test.tsx`**
   - Updated all tests to include `questionKey` prop
   - Added test for re-animation on `questionKey` change

4. **`OnboardingContainer.test.tsx`**
   - Added new test suite: "Idle Animations"
   - 4 new tests covering idle timer behavior, reset on navigation, and conditional triggering

## Testing

All tests pass (79 total):
- ✅ Question card re-animates when `questionKey` changes
- ✅ Idle animation triggers after 3 seconds when answered
- ✅ Idle timer resets on next/back navigation
- ✅ Idle animation doesn't trigger when unanswered
- ✅ All existing onboarding flow tests remain passing

## User Experience Impact

### Before
- Jarring question changes
- No indication that next step is available
- Rotation felt gimmicky

### After
- Smooth, fluid transitions between questions
- Helpful nudge when user pauses on answered question
- Professional, polished feel
- Encourages forward momentum through the flow

## Animation Timing Details

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Card fade in | 200ms | Ease out cubic | Question change |
| Card slide in | ~400ms | Gentle spring (damping: 18) | Question change |
| Card scale | ~450ms | Spring (damping: 15) | Question change (delayed 50ms) |
| Button shake | 500ms total | Ease in/out | 3s after answer |
| Button pulse | ~600ms | Spring (damping: 8) | 3s after answer |

## Future Enhancements

Potential additions (not currently implemented):
- Exit animation for current card before next enters
- Progress bar animation on question change
- Celebration animation on completion
- Swipe gestures for navigation with animation follow
