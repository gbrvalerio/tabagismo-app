# Gamified Onboarding with Coin System

**Date:** 2026-02-08
**Status:** Approved
**Branch:** feat/onboarding

## Overview

Transform the onboarding experience into a gamified flow where users earn coins for answering questions. This establishes the foundation for an app-wide gamification system while making onboarding more engaging.

## Goals

- Make onboarding more engaging and game-like
- Establish coin system as foundation for future app-wide gamification
- Provide immediate visual feedback for user progress
- Track coin awards to prevent duplicates

## User Experience

### Current State

- Progress bar with animated fill
- Small dots below bar (gray → colored when completed)
- "Voltar" button in header
- Questions with various input types

### New State

**Header Layout:**
```
[← Voltar]                    [🪙 12]
[○ ○ ○ ⦿ ● ● ● ● ● ●]
```

- Single row: "Voltar" button (left), coin counter (right)
- Coin trail below: outlined coins (not answered), filled golden coins (earned)
- Current question highlighted with pulse effect

**Interaction Flow:**

1. User answers question for first time
2. Coin bursts from answer area
3. Flies in arc to header counter (~800ms)
4. Counter pulses and increments
5. Trail coin flips from outlined to filled
6. Haptic feedback

**Updating Existing Answers:**
- Silent update, no animation
- No additional coin awarded
- Prevents coin farming

## Architecture

### Database Schema Changes

**Users Table:**
```typescript
coins: integer().default(0).notNull()
```

**Onboarding Answers Table:**
```typescript
coinAwarded: boolean().default(false).notNull()
```

### Repository Layer

**New Hooks:**

`useUserCoins()` - Fetch current coin balance
```typescript
export function useUserCoins() {
  return useQuery({
    queryKey: ['users', 'coins'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return user.coins;
    },
  });
}
```

`useIncrementCoins(amount)` - Update balance
```typescript
export function useIncrementCoins() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      await db.update(users)
        .set({ coins: sql`coins + ${amount}` })
        .where(eq(users.id, currentUserId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'coins'] });
    },
  });
}
```

**Modified Hook:**

Update `useSaveAnswer()` to handle `coinAwarded` flag:
```typescript
mutationFn: async ({ questionKey, answer, isFirstTime }) => {
  await db.insert(onboardingAnswers)
    .values({
      questionKey,
      answer,
      coinAwarded: isFirstTime, // Only true for new answers
    })
    .onConflictDoUpdate({
      target: onboardingAnswers.questionKey,
      set: { answer }, // Don't update coinAwarded
    });
}
```

### Coin Award Logic

In `OnboardingContainer.handleAnswer()`:

```typescript
const handleAnswer = async (questionKey: string, value: unknown) => {
  // Check if answer already exists
  const existingAnswer = existingAnswers?.find(a => a.questionKey === questionKey);
  const isFirstTime = !existingAnswer;

  // Save answer
  await saveAnswerMutation.mutateAsync({
    questionKey,
    answer: JSON.stringify(value),
    isFirstTime,
  });

  // Award coin only for new answers
  if (isFirstTime) {
    await incrementCoinsMutation.mutateAsync(1);
    setShowCoinAnimation(true);
  }

  // Update cache...
};
```

## Component Design

### New Components

**1. CoinCounter**

Location: `/components/onboarding/CoinCounter.tsx`

```typescript
interface CoinCounterProps {
  // No props - reads from useUserCoins()
}

export function CoinCounter() {
  const { data: coins = 0 } = useUserCoins();
  const scale = useSharedValue(1);

  // Animate when coins change
  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
  }, [coins]);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <CoinIcon size={20} />
      <Text style={styles.count}>{coins}</Text>
    </Animated.View>
  );
}
```

**2. CoinTrail**

Location: `/components/onboarding/CoinTrail.tsx`

```typescript
interface CoinTrailProps {
  currentStep: number;
  totalSteps: number;
  answeredQuestions: string[]; // Question keys with coinAwarded=true
}

export function CoinTrail({ currentStep, totalSteps, answeredQuestions }: CoinTrailProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isAnswered = index < answeredQuestions.length;
        const isCurrent = index === currentStep - 1;

        return (
          <CoinIcon
            key={index}
            variant={isAnswered ? 'filled' : 'outlined'}
            highlighted={isCurrent}
          />
        );
      })}
    </View>
  );
}
```

**3. CoinBurstAnimation**

Location: `/components/onboarding/CoinBurstAnimation.tsx`

```typescript
interface CoinBurstAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function CoinBurstAnimation({ isVisible, onComplete }: CoinBurstAnimationProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Arc from center-bottom to top-right
      translateY.value = withTiming(-400, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      translateX.value = withTiming(150, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      rotate.value = withTiming(720, { duration: 800 }); // 2 full rotations
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(600, withTiming(0, { duration: 200 }))
      );

      // Call onComplete after animation
      setTimeout(onComplete, 800);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.coin, animatedStyle]}>
      <CoinIcon size={32} variant="filled" />
      <SparkleParticles /> {/* Optional particle effect */}
    </Animated.View>
  );
}
```

**4. CoinIcon**

Location: `/components/onboarding/CoinIcon.tsx`

```typescript
interface CoinIconProps {
  size: number;
  variant: 'outlined' | 'filled';
  highlighted?: boolean;
}

export function CoinIcon({ size, variant, highlighted }: CoinIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (highlighted) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.2),
          withSpring(1)
        ),
        -1, // Infinite repeat
        true
      );
    }
  }, [highlighted]);

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      {variant === 'outlined' ? (
        <View style={[styles.outline, { borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.filled, { borderRadius: size / 2 }]} />
      )}
    </Animated.View>
  );
}
```

### Modified Components

**OnboardingContainer.tsx:**

Changes:
- Replace `<ProgressBar />` with `<CoinTrail />`
- Add `<CoinCounter />` to header row
- Add `<CoinBurstAnimation />` portal/overlay
- Update `handleAnswer()` with coin award logic
- Track `showCoinAnimation` state

## Visual Design

### Colors

**Outlined Coin (Not Earned):**
- Border: `colors.neutral.gray[300]`
- Background: transparent
- Border width: 2px

**Filled Coin (Earned):**
- Background: `colors.primary.base` (golden)
- Shadow: `shadows.sm`
- Optional: gradient from `colors.primary.light` to `colors.primary.dark`

**Flying Coin:**
- Size: 32px
- Background: `colors.primary.base`
- Shadow: `shadows.lg`
- Glow effect (optional)

**Counter:**
- Icon size: 20px
- Font: `typography.fontSize.lg`, `typography.fontWeight.bold`
- Color: `colors.text.primary`

### Spacing

- Header row: `justifyContent: 'space-between'`
- Coin trail: `spacing.sm` between coins
- Header padding: `spacing.md`

## Error Handling

### Coin Increment Failure

**Problem:** Answer saves but coin increment fails

**Solution:**
- Use TanStack Query optimistic updates
- Show animation immediately
- If mutation fails, rollback UI
- Show toast: "Erro ao salvar moedas, tente novamente"
- Auto-retry (3 attempts via TanStack Query)

### Offline Mode

**Current:** App doesn't handle offline (local-first with SQLite)

**Behavior:**
- Answer saves to local SQLite (always works)
- Coin increment updates local SQLite
- Animation plays normally
- No network dependency

### App Force-Close

**Behavior:**
- On return, load existing answers from DB
- Coins already awarded are persisted
- `coinAwarded` flags prevent duplicates
- User continues from last position

### Dependent Question Deletion

**Problem:** Parent question changes, dependent answers deleted

**Solution:**
- Delete dependent answers (existing behavior)
- This also deletes `coinAwarded` flags
- User re-answers, re-earns coins
- Makes sense: re-answering = re-earning

## Migration Strategy

### For Existing Users

Users who completed onboarding before this update:

```typescript
// Migration: 0003_add_coins.ts
export async function up(db: Database) {
  // 1. Add columns
  await db.execAsync(`
    ALTER TABLE users ADD COLUMN coins INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE onboarding_answers ADD COLUMN coin_awarded INTEGER NOT NULL DEFAULT 0;
  `);

  // 2. Mark existing answers as already awarded
  await db.execAsync(`
    UPDATE onboarding_answers SET coin_awarded = 1;
  `);

  // 3. Set user coin balance = count of existing answers
  await db.execAsync(`
    UPDATE users
    SET coins = (
      SELECT COUNT(*)
      FROM onboarding_answers
      WHERE onboarding_answers.user_id = users.id
    );
  `);
}
```

This prevents:
- Duplicate coin awards for old answers
- Unfair advantage for new users
- Confusion about existing progress

## Testing Strategy

### Repository Tests

**`users.repository.test.ts`:**
- ✅ `useUserCoins()` returns correct balance
- ✅ `useIncrementCoins()` updates balance
- ✅ Multiple increments accumulate correctly
- ✅ Optimistic updates work

**`onboarding-answers.repository.test.ts`:**
- ✅ New answer sets `coinAwarded: true`
- ✅ Update preserves `coinAwarded` flag
- ✅ Query returns `coinAwarded` status

### Component Tests

**`CoinCounter.test.tsx`:**
- ✅ Renders coin count
- ✅ Animates on count change
- ✅ Handles zero state

**`CoinTrail.test.tsx`:**
- ✅ Renders correct number of coins
- ✅ Shows outlined for unanswered
- ✅ Shows filled for answered
- ✅ Highlights current question

**`CoinBurstAnimation.test.tsx`:**
- ✅ Triggers when visible
- ✅ Calls onComplete after animation
- ✅ Doesn't render when not visible

**`CoinIcon.test.tsx`:**
- ✅ Renders outlined variant
- ✅ Renders filled variant
- ✅ Pulses when highlighted

**`OnboardingContainer.test.tsx` (updates):**
- ✅ Awards coin on first answer
- ✅ No coin on answer update
- ✅ Shows animation for new answer
- ✅ No animation for update
- ✅ Counter updates correctly
- ✅ Handles increment failure gracefully

### Integration Tests

**Full Flow:**
1. Start onboarding → coins = 0
2. Answer Q1 → coins = 1, animation plays
3. Go back, change Q1 → coins = 1, no animation
4. Answer Q2 → coins = 2, animation plays
5. Complete onboarding → coins = total questions

### Coverage Requirements

Per CLAUDE.md:
- 90% coverage required
- TDD approach during implementation
- Test real scenarios and edge cases
- Red-green-refactor cycle

## Implementation Checklist

### Database Layer
- [ ] Add `coins` field to users schema
- [ ] Add `coinAwarded` field to onboarding_answers schema
- [ ] Generate migration
- [ ] Write migration for existing users
- [ ] Test migration on sample data

### Repository Layer
- [ ] Implement `useUserCoins()` hook
- [ ] Implement `useIncrementCoins()` mutation
- [ ] Update `useSaveAnswer()` to handle `coinAwarded`
- [ ] Write repository tests
- [ ] Achieve 90% coverage

### Components
- [ ] Create `CoinIcon` component + tests
- [ ] Create `CoinCounter` component + tests
- [ ] Create `CoinTrail` component + tests
- [ ] Create `CoinBurstAnimation` component + tests
- [ ] Update `OnboardingContainer` layout
- [ ] Update `OnboardingContainer` logic
- [ ] Write component tests
- [ ] Achieve 90% coverage

### Integration
- [ ] Wire up coin award logic in `handleAnswer()`
- [ ] Test first-time answer flow
- [ ] Test answer update flow
- [ ] Test error handling
- [ ] Test edge cases
- [ ] Manual QA on device

### Polish
- [ ] Tune animation timings
- [ ] Add haptic feedback
- [ ] Test on iOS and Android
- [ ] Verify accessibility
- [ ] Update CLAUDE.md files

## Future Enhancements

Not in scope for this design, but potential future work:

- **Coin Shop:** Spend coins on themes, avatars, perks
- **Daily Rewards:** Earn coins for daily check-ins
- **Achievements:** Bonus coins for milestones
- **Leaderboards:** Compare coin totals (if social features added)
- **Transaction History:** Track how coins were earned/spent
- **Animated Coin Icon:** Rotating 3D coin in header

## Success Metrics

How we'll know this is working:

- **Engagement:** Onboarding completion rate increases
- **Speed:** Users complete onboarding faster (motivated by coins)
- **Polish:** No bugs, smooth animations, 60fps
- **Foundation:** Coin system easily extensible for future features
- **Testing:** 90%+ coverage, all tests passing

## References

- Design tokens: `/lib/theme/tokens.ts`
- Existing animations: `/lib/theme/animations.ts`
- Onboarding flow logic: `/lib/onboarding-flow.ts`
- TanStack Query: `/lib/query-client.ts`
- Database guide: `/db/CLAUDE.md`
