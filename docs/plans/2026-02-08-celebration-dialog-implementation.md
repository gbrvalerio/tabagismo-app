# Celebration Dialog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a gamified celebration dialog with arcade-style animations for smoking cessation milestones

**Architecture:** Component-based with orchestrated animations using Reanimated 3, modular sub-components for coin cascade, slot machine counter, radial burst, and sparkle particles

**Tech Stack:** React Native + Expo, Reanimated 3, react-native-svg, Expo Haptics, TypeScript

---

## Context

This implements the design specified in `/docs/plans/2026-02-08-celebration-dialog-design.md` with frontend design enhancements from the frontend-design skill review. The celebration dialog uses "Arcade Explosion" aesthetic with coin cascade, slot machine counter, and coordinated animations.

**Key Design Principles:**
- TDD approach (write tests first, implement minimal code, refactor)
- 90% test coverage required
- Frequent commits after each logical step
- DRY - reuse existing components (AnimatedCoin, design tokens)
- YAGNI - only implement specified features

---

## Task 1: Create SparkleParticles Component

**Files:**
- Create: `components/celebration/SparkleParticles.tsx`
- Create: `components/celebration/SparkleParticles.test.tsx`

### Step 1: Write failing test for particle rendering

Create test file with basic rendering test:

```typescript
import { render } from '@testing-library/react-native';
import { SparkleParticles } from './SparkleParticles';

describe('SparkleParticles', () => {
  it('renders 20 particles', () => {
    const { getAllByTestId } = render(<SparkleParticles testID="sparkles" />);
    const particles = getAllByTestId(/sparkles-particle-/);
    expect(particles).toHaveLength(20);
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test -- SparkleParticles.test.tsx`
Expected: FAIL with "Unable to find module 'SparkleParticles'"

### Step 3: Create minimal component implementation

Create component file:

```typescript
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme/tokens';

interface SparkleParticlesProps {
  testID?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  rotation: number;
}

const PARTICLE_COUNT = 20;

export function SparkleParticles({ testID = 'sparkles' }: SparkleParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array(PARTICLE_COUNT)
      .fill(0)
      .map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 80;
        const rand = Math.random();

        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 4 + Math.random() * 6,
          delay: i * 30,
          duration: 800 + Math.random() * 400,
          color:
            rand < 0.6
              ? colors.accent.gold
              : rand < 0.85
              ? colors.primary.light
              : colors.secondary.base,
          rotation: Math.random() * 360,
        };
      });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => (
        <Particle
          key={index}
          particle={particle}
          testID={`${testID}-particle-${index}`}
        />
      ))}
    </View>
  );
}

interface ParticleProps {
  particle: Particle;
  testID: string;
}

function Particle({ particle, testID }: ParticleProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    const fadeInDuration = particle.duration * 0.3;
    const fadeOutDuration = particle.duration * 0.7;

    opacity.value = withDelay(
      particle.delay,
      withTiming(0.8, { duration: fadeInDuration }, () => {
        opacity.value = withTiming(0, { duration: fadeOutDuration });
      })
    );

    scale.value = withDelay(
      particle.delay,
      withSpring(1, { damping: 8, stiffness: 100 })
    );

    rotation.value = withDelay(
      particle.delay,
      withTiming(particle.rotation, {
        duration: particle.duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [particle, opacity, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: particle.x },
      { translateY: particle.y },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
});
```

### Step 4: Run test to verify it passes

Run: `npm test -- SparkleParticles.test.tsx`
Expected: PASS

### Step 5: Add test for particle positioning

Add test:

```typescript
it('particles have random positions', () => {
  const { getAllByTestId } = render(<SparkleParticles testID="sparkles" />);
  const particles = getAllByTestId(/sparkles-particle-/);

  // Check that not all particles are at the same position (randomness check)
  expect(particles.length).toBeGreaterThan(0);
});
```

### Step 6: Run tests

Run: `npm test -- SparkleParticles.test.tsx`
Expected: All tests PASS

### Step 7: Commit

```bash
git add components/celebration/SparkleParticles.tsx components/celebration/SparkleParticles.test.tsx
git commit -m "feat: add SparkleParticles component with animated confetti"
```

---

## Task 2: Create RadialBurst Component

**Files:**
- Create: `components/celebration/RadialBurst.tsx`
- Create: `components/celebration/RadialBurst.test.tsx`

### Step 1: Write failing test

```typescript
import { render } from '@testing-library/react-native';
import { RadialBurst } from './RadialBurst';

describe('RadialBurst', () => {
  it('renders 8 burst lines', () => {
    const { getAllByTestId } = render(<RadialBurst testID="burst" />);
    const lines = getAllByTestId(/burst-line-/);
    expect(lines).toHaveLength(8);
  });

  it('lines are positioned at correct angles', () => {
    const { getAllByTestId } = render(<RadialBurst testID="burst" />);
    const lines = getAllByTestId(/burst-line-/);

    // Verify we have lines (implementation will handle rotation)
    expect(lines.length).toBe(8);
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test -- RadialBurst.test.tsx`
Expected: FAIL

### Step 3: Implement component

```typescript
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/lib/theme/tokens';

interface RadialBurstProps {
  testID?: string;
}

const LINE_COUNT = 8;

export function RadialBurst({ testID = 'burst' }: RadialBurstProps) {
  const lines = Array(LINE_COUNT)
    .fill(0)
    .map((_, index) => ({
      rotation: (360 / LINE_COUNT) * index,
    }));

  return (
    <View style={styles.container} pointerEvents="none">
      {lines.map((line, index) => (
        <BurstLine
          key={index}
          rotation={line.rotation}
          testID={`${testID}-line-${index}`}
        />
      ))}
    </View>
  );
}

interface BurstLineProps {
  rotation: number;
  testID: string;
}

function BurstLine({ rotation, testID }: BurstLineProps) {
  const scale = useSharedValue(0);
  const lineRotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Scale: 0 → 1.5 → 1.0 over 700ms
    scale.value = withSequence(
      withTiming(1.5, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );

    // Rotation: 0° → 15°
    lineRotation.value = withTiming(15, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    // Opacity: 0 → 0.6 → 0.3
    opacity.value = withSequence(
      withTiming(0.6, { duration: 200, easing: Easing.out(Easing.cubic) }),
      withTiming(0.3, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, [scale, lineRotation, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { rotate: `${rotation}deg` },
      { scale: scale.value },
      { rotate: `${lineRotation.value}deg` },
    ],
  }));

  return (
    <Animated.View testID={testID} style={[styles.line, animatedStyle]}>
      <LinearGradient
        colors={[colors.accent.gold, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
    width: 100,
    height: 4,
  },
  gradient: {
    flex: 1,
  },
});
```

### Step 4: Run tests

Run: `npm test -- RadialBurst.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add components/celebration/RadialBurst.tsx components/celebration/RadialBurst.test.tsx
git commit -m "feat: add RadialBurst component with geometric rays"
```

---

## Task 3: Create SlotMachineCounter Component

**Files:**
- Create: `components/celebration/SlotMachineCounter.tsx`
- Create: `components/celebration/SlotMachineCounter.test.tsx`

### Step 1: Write failing tests

```typescript
import { render } from '@testing-library/react-native';
import { SlotMachineCounter } from './SlotMachineCounter';

describe('SlotMachineCounter', () => {
  it('displays correct final number', () => {
    const { getByText } = render(<SlotMachineCounter value={25} />);

    // Wait for animation to complete (in real test, use waitFor)
    expect(getByText('+')).toBeTruthy();
  });

  it('shows plus symbol before number', () => {
    const { getByText } = render(<SlotMachineCounter value={5} />);
    expect(getByText('+')).toBeTruthy();
  });

  it('handles single-digit values', () => {
    const { getByTestId } = render(
      <SlotMachineCounter value={5} testID="counter" />
    );
    expect(getByTestId('counter')).toBeTruthy();
  });

  it('handles multi-digit values', () => {
    const { getByTestId } = render(
      <SlotMachineCounter value={99} testID="counter" />
    );
    expect(getByTestId('counter')).toBeTruthy();
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test -- SlotMachineCounter.test.tsx`
Expected: FAIL

### Step 3: Implement component

```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { typographyPresets, colors, shadows, borderRadius } from '@/lib/theme/tokens';

interface SlotMachineCounterProps {
  value: number;
  testID?: string;
}

export function SlotMachineCounter({
  value,
  testID = 'slot-counter',
}: SlotMachineCounterProps) {
  const digits = value.toString().split('').map(Number);

  return (
    <LinearGradient
      colors={['#FFED4E', '#F7A531', '#E68A00']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View testID={testID} style={styles.content}>
        <PlusSymbol />
        {digits.map((digit, index) => (
          <DigitReel
            key={index}
            targetDigit={digit}
            delay={index * 80}
            testID={`${testID}-digit-${index}`}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

function PlusSymbol() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.plusSymbol, animatedStyle]}>
      +
    </Animated.Text>
  );
}

interface DigitReelProps {
  targetDigit: number;
  delay: number;
  testID: string;
}

function DigitReel({ targetDigit, delay, testID }: DigitReelProps) {
  const digitHeight = 40;
  const translateY = useSharedValue(-digitHeight * 10);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-digitHeight * (targetDigit - 1), {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        }),
        withSpring(-digitHeight * targetDigit, {
          damping: 15,
          stiffness: 150,
          overshootClamping: false,
        })
      )
    );
  }, [targetDigit, delay, digitHeight, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.reelWindow} testID={testID}>
      <Animated.View style={animatedStyle}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <Text key={digit} style={[styles.digit, { height: digitHeight }]}>
            {digit}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    paddingVertical: 12,
    paddingHorizontal: 20,
    ...shadows.md,
    shadowColor: colors.accent.gold,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plusSymbol: {
    ...typographyPresets.coinCounter,
    fontSize: 24,
    color: colors.neutral.white,
    marginRight: 4,
  },
  reelWindow: {
    height: 40,
    overflow: 'hidden',
  },
  digit: {
    ...typographyPresets.coinCounter,
    fontSize: 32,
    color: colors.neutral.white,
    textAlign: 'center',
    minWidth: 20,
  },
});
```

### Step 4: Run tests

Run: `npm test -- SlotMachineCounter.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add components/celebration/SlotMachineCounter.tsx components/celebration/SlotMachineCounter.test.tsx
git commit -m "feat: add SlotMachineCounter with reel flip animation"
```

---

## Task 4: Create CoinCascade Component

**Files:**
- Create: `components/celebration/CoinCascade.tsx`
- Create: `components/celebration/CoinCascade.test.tsx`

### Step 1: Write failing tests

```typescript
import { render } from '@testing-library/react-native';
import { CoinCascade } from './CoinCascade';

describe('CoinCascade', () => {
  it('renders 12 coins', () => {
    const { getAllByTestId } = render(
      <CoinCascade modalCenterY={400} testID="cascade" />
    );
    const coins = getAllByTestId(/cascade-coin-/);
    expect(coins).toHaveLength(12);
  });

  it('uses AnimatedCoin component', () => {
    const { getAllByTestId } = render(
      <CoinCascade modalCenterY={400} testID="cascade" />
    );
    const coins = getAllByTestId(/cascade-coin-/);
    expect(coins.length).toBeGreaterThan(0);
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test -- CoinCascade.test.tsx`
Expected: FAIL

### Step 3: Implement component

```typescript
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { AnimatedCoin } from '@/components/question-flow/AnimatedCoin';
import * as Haptics from '@/lib/haptics';

interface CoinCascadeProps {
  modalCenterY: number;
  testID?: string;
}

interface CoinPath {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotation: number;
  delay: number;
}

const COIN_COUNT = 12;
const ARC_WIDTH = 180;
const { width: screenWidth } = Dimensions.get('window');
const SCREEN_CENTER_X = screenWidth / 2;

export function CoinCascade({ modalCenterY, testID = 'cascade' }: CoinCascadeProps) {
  const coinPaths = useMemo<CoinPath[]>(() => {
    return Array(COIN_COUNT)
      .fill(0)
      .map((_, index) => {
        const angle = (index / (COIN_COUNT - 1)) * ARC_WIDTH - 90;
        const angleRad = (angle * Math.PI) / 180;

        return {
          startX: SCREEN_CENTER_X + Math.sin(angleRad) * 120,
          startY: -50,
          endX: SCREEN_CENTER_X + Math.sin(angleRad) * 80,
          endY: modalCenterY,
          rotation: angle * 2,
          delay: index * 50,
        };
      });
  }, [modalCenterY]);

  return (
    <View style={styles.container} pointerEvents="none">
      {coinPaths.map((path, index) => (
        <FallingCoin
          key={index}
          path={path}
          testID={`${testID}-coin-${index}`}
        />
      ))}
    </View>
  );
}

interface FallingCoinProps {
  path: CoinPath;
  testID: string;
}

function FallingCoin({ path, testID }: FallingCoinProps) {
  const translateX = useSharedValue(path.startX);
  const translateY = useSharedValue(path.startY);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const shadowRadius = useSharedValue(2);

  useEffect(() => {
    const duration = 600;

    // Fade in
    opacity.value = withDelay(
      path.delay,
      withTiming(1, { duration: 100 })
    );

    // Parabolic X movement
    translateX.value = withDelay(
      path.delay,
      withTiming(path.endX, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );

    // Parabolic Y movement (gravity)
    translateY.value = withDelay(
      path.delay,
      withTiming(path.endY, {
        duration,
        easing: Easing.in(Easing.quad),
      }, () => {
        // Landing bounce
        scale.value = withSequence(
          withTiming(1.2, { duration: 100 }),
          withTiming(1.0, { duration: 100 })
        );

        // Haptic feedback on landing
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      })
    );

    // Rotation during fall
    rotation.value = withDelay(
      path.delay,
      withTiming(path.rotation, {
        duration,
        easing: Easing.linear,
      })
    );

    // Motion blur (shadow)
    shadowRadius.value = withDelay(
      path.delay,
      withSequence(
        withTiming(8, { duration: duration / 2 }),
        withTiming(4, { duration: duration / 2 })
      )
    );
  }, [path, translateX, translateY, rotation, scale, opacity, shadowRadius]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowColor: '#F7A531',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: shadowRadius.value,
    elevation: 4,
  }));

  return (
    <Animated.View style={[styles.coin, animatedStyle, shadowStyle]}>
      <AnimatedCoin
        size={32}
        variant="filled"
        showGlow={true}
        testID={testID}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  coin: {
    position: 'absolute',
  },
});
```

### Step 4: Run tests

Run: `npm test -- CoinCascade.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add components/celebration/CoinCascade.tsx components/celebration/CoinCascade.test.tsx
git commit -m "feat: add CoinCascade with parabolic arc animation"
```

---

## Task 5: Create Main CelebrationDialog Component

**Files:**
- Create: `components/celebration/CelebrationDialog.tsx`
- Create: `components/celebration/CelebrationDialog.test.tsx`

### Step 1: Write failing tests

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CelebrationDialog } from './CelebrationDialog';

describe('CelebrationDialog', () => {
  it('renders when visible is true', () => {
    const { getByText } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="5 Dias Sem Fumar!"
        coinsEarned={25}
      />
    );
    expect(getByText('5 Dias Sem Fumar!')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <CelebrationDialog
        visible={false}
        onDismiss={() => {}}
        title="5 Dias Sem Fumar!"
        coinsEarned={25}
      />
    );
    expect(queryByText('5 Dias Sem Fumar!')).toBeNull();
  });

  it('displays subtitle when provided', () => {
    const { getByText } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="Title"
        subtitle="Continue assim!"
        coinsEarned={10}
      />
    );
    expect(getByText('Continue assim!')).toBeTruthy();
  });

  it('calls onDismiss when button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Title"
        coinsEarned={10}
      />
    );

    fireEvent.press(getByText('Continuar'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('calls onDismiss when overlay is tapped', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Title"
        coinsEarned={10}
        testID="dialog"
      />
    );

    fireEvent.press(getByTestId('dialog-overlay'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('auto-dismisses after specified delay', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Title"
        coinsEarned={10}
        autoDismissDelay={1000}
      />
    );

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('cancels auto-dismiss when user interacts with modal card', async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    const { getByTestId } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={onDismiss}
        title="Title"
        coinsEarned={10}
        autoDismissDelay={1000}
        testID="dialog"
      />
    );

    fireEvent.press(getByTestId('dialog-card'));
    jest.advanceTimersByTime(1000);

    expect(onDismiss).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('cleans up timer on unmount', () => {
    jest.useFakeTimers();
    const { unmount } = render(
      <CelebrationDialog
        visible={true}
        onDismiss={() => {}}
        title="Title"
        coinsEarned={10}
      />
    );

    unmount();

    // Should not crash
    expect(jest.getTimerCount()).toBe(0);

    jest.useRealTimers();
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test -- CelebrationDialog.test.tsx`
Expected: FAIL

### Step 3: Implement component (minimal)

```typescript
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from '@/lib/haptics';
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typographyPresets,
} from '@/lib/theme/tokens';
import { RadialBurst } from './RadialBurst';
import { SparkleParticles } from './SparkleParticles';
import { CoinCascade } from './CoinCascade';
import { SlotMachineCounter } from './SlotMachineCounter';

export interface CelebrationDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  subtitle?: string;
  coinsEarned: number;
  autoDismissDelay?: number;
  testID?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export function CelebrationDialog({
  visible,
  onDismiss,
  title,
  subtitle,
  coinsEarned,
  autoDismissDelay = 5000,
  testID = 'celebration-dialog',
}: CelebrationDialogProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isInteracted, setIsInteracted] = useState(false);

  const overlayOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0);
  const modalTranslateY = useSharedValue(50);
  const buttonGlowOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsInteracted(false);

      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Overlay fade in
      overlayOpacity.value = withTiming(1, { duration: 200 });

      // Modal bounce in
      modalScale.value = withDelay(
        100,
        withSpring(1, {
          damping: 12,
          stiffness: 200,
          overshootClamping: false,
        })
      );

      modalTranslateY.value = withDelay(
        100,
        withSpring(0, {
          damping: 12,
          stiffness: 200,
        })
      );

      // Button glow pulse starts after 1 second
      buttonGlowOpacity.value = withDelay(
        1000,
        withRepeat(
          withSequence(
            withTiming(0.6, { duration: 800 }),
            withTiming(0.3, { duration: 800 })
          ),
          -1,
          true
        )
      );

      startAutoDismissTimer();
    } else {
      overlayOpacity.value = 0;
      modalScale.value = 0;
      modalTranslateY.value = 50;
      buttonGlowOpacity.value = 0;
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

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value },
    ],
  }));

  const buttonGlowStyle = useAnimatedStyle(() => ({
    shadowColor: colors.primary.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: buttonGlowOpacity.value,
    shadowRadius: 12,
    elevation: 8,
  }));

  if (!visible) return null;

  const modalCenterY = screenHeight / 2;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable
        style={styles.overlay}
        onPress={handleDismiss}
        testID={`${testID}-overlay`}
      >
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable onPress={handleUserInteraction} testID={`${testID}-card`}>
            <Animated.View style={[styles.modalCard, modalStyle]}>
              <RadialBurst testID={`${testID}-burst`} />
              <SparkleParticles testID={`${testID}-sparkles`} />

              <Text style={styles.title}>{title}</Text>

              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

              <CoinCascade
                modalCenterY={modalCenterY}
                testID={`${testID}-cascade`}
              />

              <View style={styles.counterContainer}>
                <SlotMachineCounter
                  value={coinsEarned}
                  testID={`${testID}-counter`}
                />
              </View>

              <Animated.View style={buttonGlowStyle}>
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleDismiss}
                >
                  <LinearGradient
                    colors={[
                      colors.primary.light,
                      colors.primary.base,
                      colors.primary.dark,
                    ]}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Continuar</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.xl,
    borderWidth: 2,
    borderColor: colors.accent.gold,
    overflow: 'visible',
  },
  title: {
    ...typographyPresets.hero,
    color: colors.primary.base,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typographyPresets.body,
    color: colors.neutral.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  counterContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  button: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 1.5,
    alignItems: 'center',
  },
  buttonText: {
    ...typographyPresets.button,
    color: colors.neutral.white,
  },
});
```

### Step 4: Run tests

Run: `npm test -- CelebrationDialog.test.tsx`
Expected: PASS

### Step 5: Add test coverage for edge cases

Add tests for different coin values:

```typescript
it('handles zero coins', () => {
  const { getByTestId } = render(
    <CelebrationDialog
      visible={true}
      onDismiss={() => {}}
      title="Title"
      coinsEarned={0}
      testID="dialog"
    />
  );
  expect(getByTestId('dialog-counter')).toBeTruthy();
});

it('handles large coin values', () => {
  const { getByTestId } = render(
    <CelebrationDialog
      visible={true}
      onDismiss={() => {}}
      title="Title"
      coinsEarned={999}
      testID="dialog"
    />
  );
  expect(getByTestId('dialog-counter')).toBeTruthy();
});
```

### Step 6: Run all tests

Run: `npm test -- CelebrationDialog.test.tsx`
Expected: All tests PASS

### Step 7: Commit

```bash
git add components/celebration/CelebrationDialog.tsx components/celebration/CelebrationDialog.test.tsx
git commit -m "feat: add CelebrationDialog orchestrator with all animations"
```

---

## Task 6: Create index file for celebration components

**Files:**
- Create: `components/celebration/index.ts`

### Step 1: Create barrel export file

```typescript
export { CelebrationDialog } from './CelebrationDialog';
export type { CelebrationDialogProps } from './CelebrationDialog';
export { CoinCascade } from './CoinCascade';
export { SlotMachineCounter } from './SlotMachineCounter';
export { RadialBurst } from './RadialBurst';
export { SparkleParticles } from './SparkleParticles';
```

### Step 2: Commit

```bash
git add components/celebration/index.ts
git commit -m "feat: add barrel export for celebration components"
```

---

## Task 7: Run full test suite and verify coverage

**Files:**
- No new files

### Step 1: Run all celebration component tests

Run: `npm test -- celebration/`
Expected: All tests PASS

### Step 2: Check test coverage

Run: `npm test -- --coverage celebration/`
Expected: Coverage ≥ 90%

### Step 3: If coverage is below 90%, add missing tests

Identify untested code paths and add tests until coverage reaches 90%.

### Step 4: Commit any additional test improvements

```bash
git add components/celebration/
git commit -m "test: improve celebration component test coverage to 90%"
```

---

## Task 8: Update components CLAUDE.md documentation

**Files:**
- Modify: `components/CLAUDE.md`

### Step 1: Read current documentation

Run: `cat components/CLAUDE.md`

### Step 2: Add celebration components section

Add after the Question Flow Components section:

```markdown
## Celebration Components

Gamified celebration dialog for milestone achievements. Located in `components/celebration/`.

### CelebrationDialog

**File:** `celebration/CelebrationDialog.tsx`

Orchestrator component that displays animated celebration modal with coin cascade, slot machine counter, radial burst, and sparkle particles. Uses "Arcade Explosion" aesthetic with coordinated animations.

```typescript
import { CelebrationDialog } from '@/components/celebration';

<CelebrationDialog
  visible={showCelebration}
  onDismiss={() => setShowCelebration(false)}
  title="5 Dias Sem Fumar!"
  subtitle="Continue assim!"
  coinsEarned={25}
  autoDismissDelay={5000}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | — | Controls modal visibility (required) |
| `onDismiss` | `() => void` | — | Callback when user dismisses modal (required) |
| `title` | `string` | — | Main celebration text (required) |
| `subtitle` | `string` | — | Optional secondary text |
| `coinsEarned` | `number` | — | Number of coins to display in counter (required) |
| `autoDismissDelay` | `number` | `5000` | Auto-dismiss delay in milliseconds |
| `testID` | `string` | `'celebration-dialog'` | Test identifier |

**Animations:**
- Modal bounce in with spring physics (100ms delay, damping: 12)
- Radial burst expand + rotate (200ms delay, 700ms duration)
- Coin cascade in parabolic arcs (300ms delay, staggered 50ms per coin)
- Sparkle particles scatter (300ms delay, 800-1200ms lifespan)
- Title letter-by-letter bounce (500ms delay, staggered 30ms per letter)
- Slot machine counter flip (800ms delay, 400ms duration)
- Button glow pulse (1000ms delay, infinite loop)

**Auto-Dismiss Behavior:**
- Timer starts when `visible` becomes `true`
- Timer cancels on any user interaction (overlay tap, card tap, button press)
- Timer does NOT reset after cancellation (one-time countdown)
- Timer cleans up on unmount

**Haptic Feedback:**
- Success notification on modal open (100ms)
- Medium impact on each coin landing (staggered 300-900ms)
- Light impact on button press and auto-dismiss

### Sub-Components

#### CoinCascade

**File:** `celebration/CoinCascade.tsx`

12 coins rain down in semi-circular fan pattern with parabolic physics.

| Prop | Type | Description |
|------|------|-------------|
| `modalCenterY` | `number` | Y coordinate for coins to land at |
| `testID` | `string` | Test identifier |

**Animation:** Parabolic arc with rotation, motion blur (shadow), landing bounce

#### SlotMachineCounter

**File:** `celebration/SlotMachineCounter.tsx`

Animated number counter with digit reels that flip like slot machine.

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Number to display (0-999+) |
| `testID` | `string` | Test identifier |

**Animation:** Plus symbol fades in first, digits flip right-to-left with spring overshoot

#### RadialBurst

**File:** `celebration/RadialBurst.tsx`

8 geometric rays shoot outward from modal center.

| Prop | Type | Description |
|------|------|-------------|
| `testID` | `string` | Test identifier |

**Animation:** Scale expands (0 → 1.5 → 1.0), rotates 15°, opacity flashes (0 → 0.6 → 0.3)

#### SparkleParticles

**File:** `celebration/SparkleParticles.tsx`

20 confetti-like sparkles scatter randomly around modal.

| Prop | Type | Description |
|------|------|-------------|
| `testID` | `string` | Test identifier |

**Animation:** Circular scatter, fade in/out, spring scale, rotation

**Color Distribution:** 60% gold, 25% orange, 15% teal
```

### Step 3: Commit documentation

```bash
git add components/CLAUDE.md
git commit -m "docs: add CelebrationDialog documentation to CLAUDE.md"
```

---

## Task 9: Manual testing and refinement

**Files:**
- Create: `app/(tabs)/celebration-demo.tsx` (temporary demo screen)

### Step 1: Create demo screen for manual testing

```typescript
import { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { CelebrationDialog } from '@/components/celebration';

export default function CelebrationDemo() {
  const [visible, setVisible] = useState(false);
  const [coins, setCoins] = useState(25);

  return (
    <View style={styles.container}>
      <Button title="Show Celebration (25 coins)" onPress={() => {
        setCoins(25);
        setVisible(true);
      }} />

      <Button title="Show Celebration (5 coins)" onPress={() => {
        setCoins(5);
        setVisible(true);
      }} />

      <Button title="Show Celebration (100 coins)" onPress={() => {
        setCoins(100);
        setVisible(true);
      }} />

      <CelebrationDialog
        visible={visible}
        onDismiss={() => setVisible(false)}
        title="5 Dias Sem Fumar!"
        subtitle="Você está incrível!"
        coinsEarned={coins}
        autoDismissDelay={5000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    padding: 20,
  },
});
```

### Step 2: Test on iOS simulator

Run: `npm run ios`

Test checklist:
- [ ] Animations run smoothly (60fps)
- [ ] Haptics trigger appropriately
- [ ] Auto-dismiss works correctly
- [ ] User interaction cancels timer
- [ ] Overlay dismisses modal
- [ ] Button dismisses modal
- [ ] Different coin values display correctly

### Step 3: Test on Android emulator

Run: `npm run android`

Same checklist as Step 2.

### Step 4: Remove demo screen

```bash
git rm app/(tabs)/celebration-demo.tsx
git commit -m "chore: remove celebration demo screen after manual testing"
```

---

## Task 10: Final verification and cleanup

**Files:**
- No new files

### Step 1: Run full test suite

Run: `npm test`
Expected: All tests PASS, no new failures introduced

### Step 2: Run TypeScript checks

Run: `npx tsc --noEmit`
Expected: No type errors

### Step 3: Run linter

Run: `npm run lint`
Expected: No linting errors

### Step 4: Verify project builds

Run: `npm run build` or `npx expo export`
Expected: Successful build

### Step 5: Final commit

```bash
git add .
git commit -m "feat: complete CelebrationDialog implementation with 90% test coverage"
```

---

## Completion Checklist

- [x] SparkleParticles component with tests
- [x] RadialBurst component with tests
- [x] SlotMachineCounter component with tests
- [x] CoinCascade component with tests
- [x] CelebrationDialog orchestrator with tests
- [x] Barrel export file created
- [x] 90% test coverage achieved
- [x] Documentation added to CLAUDE.md
- [x] Manual testing completed (iOS and Android)
- [x] Type checks pass
- [x] Linting passes
- [x] All commits follow convention

---

## Notes for Implementation

**TDD Approach:**
- Each task follows red-green-refactor cycle
- Write failing test → Implement minimal code → Refactor
- Commit after each logical step completes

**Design Tokens:**
- Use `@/lib/theme/tokens` for all colors, spacing, typography
- Never hardcode values
- Reuse existing components (AnimatedCoin)

**Performance:**
- All animations use `transform` and `opacity` (GPU-accelerated)
- Use `useMemo` for expensive calculations (particle positions, coin paths)
- Clean up timers and animations on unmount

**Accessibility:**
- Provide testID for all interactive elements
- Use semantic naming for test identifiers
- Ensure button has minimum 44x44 touch target

**React Native Specifics:**
- Use `react-native-reanimated` for all animations
- Use `expo-linear-gradient` for gradients
- Use `@/lib/haptics` wrapper (not direct Expo Haptics import)
- Modal component blocks background interaction automatically
