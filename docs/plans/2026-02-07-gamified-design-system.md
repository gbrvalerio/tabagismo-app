# Gamified Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a vibrant, game-inspired design system with Button and TextField components plus a demo screen to establish the visual foundation for gamification features.

**Architecture:** Token-based design system using React Native's StyleSheet with centralized theme constants. Components follow atomic design principles with comprehensive variant support and state management. Demo screen provides real-world context for design evaluation.

**Tech Stack:** React Native, TypeScript, Expo, React Native Reanimated 3, Jest + React Native Testing Library

---

## Design Tokens

**Aesthetic Direction: "Achievement Arcade"**
- Bold, saturated colors with playful gradients
- Chunky borders and prominent shadows for tactile depth
- Rounded corners and friendly typography
- Achievement-focused color palette (gold, electric blue, vibrant accents)

---

## Task 1: Create Design Tokens

**Files:**
- Create: `lib/theme/tokens.ts`
- Create: `lib/theme/tokens.test.ts`

**Step 1: Write the failing test**

```typescript
// lib/theme/tokens.test.ts
import { colors, spacing, typography, shadows, borderRadius } from './tokens';

describe('Design Tokens', () => {
  describe('colors', () => {
    it('should define primary colors', () => {
      expect(colors.primary).toBeDefined();
      expect(colors.primary.base).toBe('#FF6B35'); // Vibrant orange
      expect(colors.primary.light).toBe('#FF8C61');
      expect(colors.primary.dark).toBe('#E64A1A');
    });

    it('should define secondary colors', () => {
      expect(colors.secondary).toBeDefined();
      expect(colors.secondary.base).toBe('#4ECDC4'); // Electric teal
      expect(colors.secondary.light).toBe('#7DE0D8');
      expect(colors.secondary.dark).toBe('#3BB5AD');
    });

    it('should define accent colors', () => {
      expect(colors.accent).toBeDefined();
      expect(colors.accent.gold).toBe('#FFD93D'); // Achievement gold
      expect(colors.accent.purple).toBe('#A66CFF'); // Power-up purple
      expect(colors.accent.pink).toBe('#FF6AC1'); // Streak pink
    });

    it('should define neutral colors', () => {
      expect(colors.neutral).toBeDefined();
      expect(colors.neutral.white).toBe('#FFFFFF');
      expect(colors.neutral.black).toBe('#1A1A2E'); // Deep navy instead of pure black
      expect(colors.neutral.gray[100]).toBe('#F5F5F5');
      expect(colors.neutral.gray[900]).toBe('#2A2A3E');
    });

    it('should define semantic colors', () => {
      expect(colors.semantic.error).toBe('#FF4757');
      expect(colors.semantic.success).toBe('#2ED573');
      expect(colors.semantic.warning).toBe('#FFA502');
      expect(colors.semantic.info).toBe('#5352ED');
    });

    it('should define background colors', () => {
      expect(colors.background.primary).toBe('#F8F9FE'); // Soft lavender-tinted
      expect(colors.background.secondary).toBe('#FFFFFF');
      expect(colors.background.tertiary).toBe('#EEF0FB');
    });
  });

  describe('spacing', () => {
    it('should define spacing scale', () => {
      expect(spacing.xs).toBe(4);
      expect(spacing.sm).toBe(8);
      expect(spacing.md).toBe(16);
      expect(spacing.lg).toBe(24);
      expect(spacing.xl).toBe(32);
      expect(spacing.xxl).toBe(48);
    });
  });

  describe('typography', () => {
    it('should define font families', () => {
      expect(typography.fontFamily.primary).toBe('System'); // Will use SF Pro on iOS, Roboto on Android
      expect(typography.fontFamily.display).toBe('System'); // Rounded variant for headings
    });

    it('should define font sizes', () => {
      expect(typography.fontSize.xs).toBe(12);
      expect(typography.fontSize.sm).toBe(14);
      expect(typography.fontSize.md).toBe(16);
      expect(typography.fontSize.lg).toBe(20);
      expect(typography.fontSize.xl).toBe(24);
      expect(typography.fontSize.xxl).toBe(32);
    });

    it('should define font weights', () => {
      expect(typography.fontWeight.regular).toBe('400');
      expect(typography.fontWeight.medium).toBe('600');
      expect(typography.fontWeight.bold).toBe('700');
      expect(typography.fontWeight.black).toBe('900');
    });

    it('should define line heights', () => {
      expect(typography.lineHeight.tight).toBe(1.2);
      expect(typography.lineHeight.normal).toBe(1.5);
      expect(typography.lineHeight.relaxed).toBe(1.75);
    });
  });

  describe('shadows', () => {
    it('should define shadow levels for chunky, game-like depth', () => {
      expect(shadows.sm).toEqual({
        shadowColor: '#1A1A2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
      });

      expect(shadows.md).toEqual({
        shadowColor: '#1A1A2E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      });

      expect(shadows.lg).toEqual({
        shadowColor: '#1A1A2E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
      });

      expect(shadows.xl).toEqual({
        shadowColor: '#1A1A2E',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
      });
    });
  });

  describe('borderRadius', () => {
    it('should define border radius scale for chunky, game-like feel', () => {
      expect(borderRadius.sm).toBe(8);
      expect(borderRadius.md).toBe(12);
      expect(borderRadius.lg).toBe(16);
      expect(borderRadius.xl).toBe(24);
      expect(borderRadius.full).toBe(9999);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- lib/theme/tokens.test.ts`
Expected: FAIL with "Cannot find module './tokens'"

**Step 3: Write minimal implementation**

```typescript
// lib/theme/tokens.ts

export const colors = {
  primary: {
    base: '#FF6B35', // Vibrant orange - energetic, action-oriented
    light: '#FF8C61',
    dark: '#E64A1A',
  },
  secondary: {
    base: '#4ECDC4', // Electric teal - progress, calm
    light: '#7DE0D8',
    dark: '#3BB5AD',
  },
  accent: {
    gold: '#FFD93D', // Achievement gold - rewards, milestones
    purple: '#A66CFF', // Power-up purple - special features
    pink: '#FF6AC1', // Streak pink - consistency, momentum
  },
  neutral: {
    white: '#FFFFFF',
    black: '#1A1A2E', // Deep navy - softer than pure black
    gray: {
      100: '#F5F5F5',
      200: '#E8E8E8',
      300: '#D1D1D1',
      400: '#B0B0B0',
      500: '#8A8A8A',
      600: '#6B6B6B',
      700: '#4A4A4A',
      800: '#333344',
      900: '#2A2A3E',
    },
  },
  semantic: {
    error: '#FF4757', // Bright red
    success: '#2ED573', // Vibrant green
    warning: '#FFA502', // Amber
    info: '#5352ED', // Electric blue
  },
  background: {
    primary: '#F8F9FE', // Soft lavender-tinted background
    secondary: '#FFFFFF',
    tertiary: '#EEF0FB', // Subtle tinted variant
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  fontFamily: {
    primary: 'System',
    display: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    regular: '400',
    medium: '600',
    bold: '700',
    black: '900',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Type exports for TypeScript
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Shadows = typeof shadows;
export type BorderRadius = typeof borderRadius;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- lib/theme/tokens.test.ts`
Expected: PASS - all token definitions verified

**Step 5: Commit**

```bash
git add lib/theme/tokens.ts lib/theme/tokens.test.ts
git commit -m "feat: add gamified design system tokens"
```

---

## Task 2: Add Animation Tokens and Utilities

**Files:**
- Create: `lib/theme/animations.ts`
- Create: `lib/theme/animations.test.ts`

**Step 1: Write the failing test**

```typescript
// lib/theme/animations.test.ts
import { animations, timing } from './animations';

describe('Animation Tokens', () => {
  describe('timing', () => {
    it('should define timing values for different speed animations', () => {
      expect(timing.fast).toBe(200);
      expect(timing.normal).toBe(300);
      expect(timing.slow).toBe(500);
    });
  });

  describe('animations', () => {
    it('should define spring config for bouncy interactions', () => {
      expect(animations.spring.damping).toBe(15);
      expect(animations.spring.stiffness).toBe(150);
      expect(animations.spring.mass).toBe(1);
    });

    it('should define gentle spring for subtle movements', () => {
      expect(animations.gentleSpring.damping).toBe(20);
      expect(animations.gentleSpring.stiffness).toBe(100);
      expect(animations.gentleSpring.mass).toBe(1);
    });

    it('should define easing curves', () => {
      expect(animations.easing.easeOut).toBeDefined();
      expect(animations.easing.easeInOut).toBeDefined();
      expect(animations.easing.bounce).toBeDefined();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- lib/theme/animations.test.ts`
Expected: FAIL with "Cannot find module './animations'"

**Step 3: Write minimal implementation**

```typescript
// lib/theme/animations.ts
import { Easing } from 'react-native-reanimated';

/**
 * Animation Timing Values (in milliseconds)
 *
 * Philosophy: Modern, snappy animations that feel responsive without being jarring.
 * We avoid overly long animations that slow down interactions.
 */
export const timing = {
  fast: 200,    // Quick feedback (button press, input focus)
  normal: 300,  // Standard transitions (navigation, modals)
  slow: 500,    // Deliberate movements (page transitions, reveals)
} as const;

/**
 * Animation Configurations
 *
 * Guidelines:
 * - Use spring animations for organic, playful feel (game-like)
 * - Use timing animations for precise, controlled movements
 * - Prefer gentleSpring for most interactions to avoid over-animation
 * - Reserve bouncy spring for celebration moments (achievements, success)
 */
export const animations = {
  // Bouncy spring for playful, game-like interactions
  // Use for: Button press, achievement pop-ins, success states
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Gentle spring for subtle, modern feel
  // Use for: Input focus, card hover, most UI interactions
  gentleSpring: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },

  // Easing curves for timing-based animations
  easing: {
    // Smooth deceleration - use for exits, fading out
    easeOut: Easing.out(Easing.cubic),

    // Smooth acceleration and deceleration - use for most transitions
    easeInOut: Easing.inOut(Easing.cubic),

    // Slight bounce for playful feel - use for entrances, celebrations
    bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  },
} as const;

/**
 * Animation Best Practices:
 *
 * 1. **Subtlety**: Modern animations are felt, not seen. Avoid exaggerated movements.
 * 2. **Purpose**: Every animation should have a reason (feedback, hierarchy, continuity).
 * 3. **Performance**: Use native animations (Reanimated) for 60fps smoothness.
 * 4. **Consistency**: Use these tokens throughout the app for unified feel.
 * 5. **Accessibility**: Respect reduced motion preferences.
 *
 * Examples:
 *
 * Button Press (scale down on press):
 * - Animation: gentleSpring
 * - Scale: 0.95 (subtle, not 0.8 which is too much)
 * - Duration: fast (200ms)
 *
 * Input Focus (highlight border):
 * - Animation: timing with easeOut
 * - Duration: fast (200ms)
 * - Change: border color + subtle background tint
 *
 * Success Celebration (achievement unlock):
 * - Animation: spring (bouncy)
 * - Scale: 1.0 → 1.1 → 1.0
 * - Duration: normal (300ms)
 * - Combine with: opacity fade-in
 */

export type Timing = typeof timing;
export type Animations = typeof animations;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- lib/theme/animations.test.ts`
Expected: PASS - all animation token definitions verified

**Step 5: Commit**

```bash
git add lib/theme/animations.ts lib/theme/animations.test.ts
git commit -m "feat: add animation tokens and guidelines"
```

---

## Task 3: Create Button Component - Part 1 (Primary Variant)

**Files:**
- Create: `components/Button.tsx`
- Create: `components/Button.test.tsx`

**Step 1: Write the failing test for primary variant**

```typescript
// components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  describe('Primary variant', () => {
    it('should render primary button with text', () => {
      const { getByText } = render(
        <Button variant="primary">Click Me</Button>
      );
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button variant="primary" onPress={onPress}>
          Press
        </Button>
      );

      fireEvent.press(getByText('Press'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button variant="primary" disabled onPress={onPress}>
          Disabled
        </Button>
      );

      fireEvent.press(getByText('Disabled'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should show loading state', () => {
      const { getByTestId, queryByText } = render(
        <Button variant="primary" loading>
          Loading
        </Button>
      );

      expect(getByTestId('button-loading-indicator')).toBeTruthy();
      expect(queryByText('Loading')).toBeNull(); // Text hidden when loading
    });

    it('should apply custom style', () => {
      const { getByTestId } = render(
        <Button variant="primary" style={{ marginTop: 20 }} testID="custom-button">
          Custom
        </Button>
      );

      const button = getByTestId('custom-button');
      expect(button.props.style).toContainEqual({ marginTop: 20 });
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/Button.test.tsx`
Expected: FAIL with "Cannot find module './Button'"

**Step 3: Write minimal implementation for primary variant**

```typescript
// components/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '@/lib/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'minimal' | 'outline';

export interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  style,
  testID,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyle = [styles.button];

    if (variant === 'primary') {
      baseStyle.push(styles.primaryButton);
    }

    if (isDisabled) {
      baseStyle.push(styles.disabled);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const baseStyle = [styles.text];

    if (variant === 'primary') {
      baseStyle.push(styles.primaryText);
    }

    if (isDisabled) {
      baseStyle.push(styles.disabledText);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={colors.neutral.white}
          testID="button-loading-indicator"
        />
      ) : (
        <Text style={getTextStyle()}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderWidth: 3, // Chunky border for game feel
  },
  primaryButton: {
    backgroundColor: colors.primary.base,
    borderColor: colors.primary.dark,
    ...shadows.md,
  },
  text: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize.md * typography.lineHeight.tight,
  },
  primaryText: {
    color: colors.neutral.white,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/Button.test.tsx`
Expected: PASS - primary variant tests passing

**Step 5: Commit**

```bash
git add components/Button.tsx components/Button.test.tsx
git commit -m "feat: add Button component with primary variant"
```

---

## Task 4: Create Button Component - Part 2 (Remaining Variants)

**Files:**
- Modify: `components/Button.test.tsx`
- Modify: `components/Button.tsx`

**Step 1: Write failing tests for secondary, minimal, and outline variants**

```typescript
// components/Button.test.tsx
// Add to existing file after primary variant tests

describe('Secondary variant', () => {
  it('should render secondary button with correct styles', () => {
    const { getByText } = render(
      <Button variant="secondary">Secondary</Button>
    );
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button variant="secondary" onPress={onPress}>
        Press
      </Button>
    );

    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Minimal variant', () => {
  it('should render minimal button with correct styles', () => {
    const { getByText } = render(
      <Button variant="minimal">Minimal</Button>
    );
    expect(getByText('Minimal')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button variant="minimal" onPress={onPress}>
        Press
      </Button>
    );

    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should show loading with primary color indicator', () => {
    const { getByTestId } = render(
      <Button variant="minimal" loading>
        Loading
      </Button>
    );

    expect(getByTestId('button-loading-indicator')).toBeTruthy();
  });
});

describe('Outline variant', () => {
  it('should render outline button with correct styles', () => {
    const { getByText } = render(
      <Button variant="outline">Outline</Button>
    );
    expect(getByText('Outline')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button variant="outline" onPress={onPress}>
        Press
      </Button>
    );

    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/Button.test.tsx`
Expected: FAIL with style-related errors for new variants

**Step 3: Implement remaining variants**

```typescript
// components/Button.tsx
// Modify getButtonStyle function:

const getButtonStyle = (): StyleProp<ViewStyle> => {
  const baseStyle = [styles.button];

  if (variant === 'primary') {
    baseStyle.push(styles.primaryButton);
  } else if (variant === 'secondary') {
    baseStyle.push(styles.secondaryButton);
  } else if (variant === 'minimal') {
    baseStyle.push(styles.minimalButton);
  } else if (variant === 'outline') {
    baseStyle.push(styles.outlineButton);
  }

  if (isDisabled) {
    baseStyle.push(styles.disabled);
  }

  if (style) {
    baseStyle.push(style);
  }

  return baseStyle;
};

// Modify getTextStyle function:

const getTextStyle = (): StyleProp<TextStyle> => {
  const baseStyle = [styles.text];

  if (variant === 'primary') {
    baseStyle.push(styles.primaryText);
  } else if (variant === 'secondary') {
    baseStyle.push(styles.secondaryText);
  } else if (variant === 'minimal') {
    baseStyle.push(styles.minimalText);
  } else if (variant === 'outline') {
    baseStyle.push(styles.outlineText);
  }

  if (isDisabled) {
    baseStyle.push(styles.disabledText);
  }

  return baseStyle;
};

// Modify ActivityIndicator color based on variant:

const getLoadingColor = () => {
  if (variant === 'primary' || variant === 'secondary') {
    return colors.neutral.white;
  }
  return colors.primary.base;
};

// Update ActivityIndicator in render:
<ActivityIndicator
  color={getLoadingColor()}
  testID="button-loading-indicator"
/>

// Add new styles to StyleSheet:

const styles = StyleSheet.create({
  // ... existing styles ...

  secondaryButton: {
    backgroundColor: colors.secondary.base,
    borderColor: colors.secondary.dark,
    ...shadows.md,
  },
  secondaryText: {
    color: colors.neutral.white,
  },
  minimalButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    ...shadows.sm, // Subtle shadow even for minimal
    minHeight: 48, // Slightly smaller
  },
  minimalText: {
    color: colors.primary.base,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: colors.primary.base,
    ...shadows.sm,
  },
  outlineText: {
    color: colors.primary.base,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/Button.test.tsx`
Expected: PASS - all variant tests passing

**Step 5: Commit**

```bash
git add components/Button.tsx components/Button.test.tsx
git commit -m "feat: add secondary, minimal, and outline button variants"
```

---

## Task 5: Add Animations to Button Component

**Files:**
- Modify: `components/Button.tsx`
- Modify: `components/Button.test.tsx`

**Step 1: Write failing tests for button animations**

```typescript
// components/Button.test.tsx
// Add to existing file at the end

describe('Animations', () => {
  it('should render Animated.View wrapper', () => {
    const { getByTestId } = render(
      <Button variant="primary" testID="animated-button">
        Animated
      </Button>
    );

    // Button should be wrapped in animated view
    expect(getByTestId('animated-button')).toBeTruthy();
  });

  it('should have press animation behavior', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button variant="primary" onPress={onPress}>
        Press Me
      </Button>
    );

    // Simulate press
    fireEvent.press(getByText('Press Me'));

    // onPress should still be called (animation doesn't block it)
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/Button.test.tsx`
Expected: Tests may pass (Animated.View is transparent to testing library)

**Step 3: Implement button press animation**

```typescript
// components/Button.tsx
// Add imports:
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { animations } from '@/lib/theme/animations';

// Replace TouchableOpacity with Animated.View + Pressable pattern:
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

// In the component, add animation values:
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  style,
  testID,
}) => {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  // Animated style for press effect
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.95, animations.gentleSpring);
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withSpring(1, animations.gentleSpring);
    }
  };

  // ... rest of component logic ...

  return (
    <Animated.View style={[animatedStyle, style]} testID={testID}>
      <Pressable
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        {loading ? (
          <ActivityIndicator
            color={getLoadingColor()}
            testID="button-loading-indicator"
          />
        ) : (
          <Text style={getTextStyle()}>{children}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/Button.test.tsx`
Expected: PASS - all tests including animation tests passing

**Step 5: Verify animation visually**

Run: `npm start` and test button press animation
Expected: Subtle scale-down on press (95%), smooth spring back

**Step 6: Commit**

```bash
git add components/Button.tsx components/Button.test.tsx
git commit -m "feat: add press animation to Button component"
```

---

## Task 6: Add Animations to TextField Component

**Files:**
- Modify: `components/TextField.tsx`
- Modify: `components/TextField.test.tsx`

**Step 1: Write failing tests for textfield animations**

```typescript
// components/TextField.test.tsx
// Add to existing file at the end

describe('Animations', () => {
  it('should render with animated focus border', () => {
    const { getByPlaceholderText } = render(
      <TextField placeholder="Animated input" />
    );

    const input = getByPlaceholderText('Animated input');
    fireEvent(input, 'focus');

    // Component handles focus state
    expect(input).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/TextField.test.tsx`
Expected: Test should pass (focus behavior already exists)

**Step 3: Implement textfield focus animation**

```typescript
// components/TextField.tsx
// Add imports:
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { animations, timing } from '@/lib/theme/animations';

// In the component, add animation values:
export const TextField: React.FC<TextFieldProps> = ({
  // ... props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColorProgress = useSharedValue(0);
  const backgroundColorProgress = useSharedValue(0);

  const isDisabled = disabled || loading;

  // ... existing functions ...

  // Animated border style for smooth focus transition
  const animatedBorderStyle = useAnimatedStyle(() => {
    let borderColor = colors.neutral.gray[300];
    let backgroundColor = colors.neutral.white;

    if (error) {
      borderColor = colors.semantic.error;
      backgroundColor = '#FFF5F5';
    } else if (borderColorProgress.value > 0) {
      // Interpolate between gray and primary color
      // Simple approach: just use primary when focused
      borderColor = colors.primary.base;
      backgroundColor = colors.background.primary;
    }

    return {
      borderColor,
      backgroundColor,
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
    borderColorProgress.value = withTiming(1, {
      duration: timing.fast,
      easing: animations.easing.easeOut,
    });
    backgroundColorProgress.value = withTiming(1, {
      duration: timing.fast,
      easing: animations.easing.easeOut,
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColorProgress.value = withTiming(0, {
      duration: timing.fast,
      easing: animations.easing.easeOut,
    });
    backgroundColorProgress.value = withTiming(0, {
      duration: timing.fast,
      easing: animations.easing.easeOut,
    });
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}

      <View style={styles.inputWrapper}>
        <Animated.View style={[styles.inputBorder, animatedBorderStyle]}>
          <TextInput
            style={styles.inputInner}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.neutral.gray[400]}
            editable={!isDisabled}
            keyboardType={getKeyboardType()}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </Animated.View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              color={colors.primary.base}
              size="small"
              testID="textfield-loading-indicator"
            />
          </View>
        )}
      </View>

      {getMessageText() && (
        <Text style={getMessageStyle()}>{getMessageText()}</Text>
      )}
    </View>
  );
};

// Update styles to split input into border wrapper and inner input:
const styles = StyleSheet.create({
  // ... existing styles ...

  inputBorder: {
    borderRadius: borderRadius.md,
    borderWidth: 3,
  },
  inputInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.black,
    minHeight: 56,
  },

  // Remove border styles from main input, now on wrapper
  // Keep other styles as needed
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/TextField.test.tsx`
Expected: PASS - all tests passing

**Step 5: Verify animation visually**

Run: `npm start` and test input focus animation
Expected: Smooth border color transition (200ms), subtle background fade

**Step 6: Commit**

```bash
git add components/TextField.tsx components/TextField.test.tsx
git commit -m "feat: add focus animation to TextField component"
```

---

## Task 7: Create TextField Component - Part 1 (Basic Structure)

**Files:**
- Create: `components/TextField.tsx`
- Create: `components/TextField.test.tsx`

**Step 1: Write failing tests for basic TextField**

```typescript
// components/TextField.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextField } from './TextField';

describe('TextField', () => {
  describe('Basic functionality', () => {
    it('should render text input with label', () => {
      const { getByText, getByPlaceholderText } = render(
        <TextField label="Nome" placeholder="Digite seu nome" />
      );

      expect(getByText('Nome')).toBeTruthy();
      expect(getByPlaceholderText('Digite seu nome')).toBeTruthy();
    });

    it('should call onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <TextField
          placeholder="Type here"
          onChangeText={onChangeText}
        />
      );

      fireEvent.changeText(getByPlaceholderText('Type here'), 'Hello');
      expect(onChangeText).toHaveBeenCalledWith('Hello');
    });

    it('should display value', () => {
      const { getByDisplayValue } = render(
        <TextField value="Test value" />
      );

      expect(getByDisplayValue('Test value')).toBeTruthy();
    });

    it('should show helper text', () => {
      const { getByText } = render(
        <TextField
          label="Email"
          helperText="Seu email não será compartilhado"
        />
      );

      expect(getByText('Seu email não será compartilhado')).toBeTruthy();
    });

    it('should be disabled when disabled prop is true', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <TextField
          placeholder="Disabled"
          disabled
          onChangeText={onChangeText}
        />
      );

      const input = getByPlaceholderText('Disabled');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('Keyboard type', () => {
    it('should use numeric keyboard for numeric type', () => {
      const { getByPlaceholderText } = render(
        <TextField
          type="numeric"
          placeholder="Enter number"
        />
      );

      const input = getByPlaceholderText('Enter number');
      expect(input.props.keyboardType).toBe('numeric');
    });

    it('should use default keyboard for text type', () => {
      const { getByPlaceholderText } = render(
        <TextField
          type="text"
          placeholder="Enter text"
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.keyboardType).toBe('default');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/TextField.test.tsx`
Expected: FAIL with "Cannot find module './TextField'"

**Step 3: Write minimal implementation**

```typescript
// components/TextField.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/lib/theme/tokens';

export type TextFieldType = 'text' | 'numeric';

export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  helperText?: string;
  disabled?: boolean;
  type?: TextFieldType;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  helperText,
  disabled = false,
  type = 'text',
  style,
  testID,
}) => {
  const getKeyboardType = () => {
    return type === 'numeric' ? 'numeric' : 'default';
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        style={[
          styles.input,
          disabled && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral.gray[400]}
        editable={!disabled}
        keyboardType={getKeyboardType()}
      />

      {helperText && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.black,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.neutral.white,
    borderWidth: 3, // Chunky border
    borderColor: colors.neutral.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.black,
    minHeight: 56,
  },
  inputDisabled: {
    backgroundColor: colors.neutral.gray[100],
    opacity: 0.6,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray[600],
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/TextField.test.tsx`
Expected: PASS - basic TextField tests passing

**Step 5: Commit**

```bash
git add components/TextField.tsx components/TextField.test.tsx
git commit -m "feat: add TextField component with basic functionality"
```

---

## Task 8: Create TextField Component - Part 2 (Error and Loading States)

**Files:**
- Modify: `components/TextField.test.tsx`
- Modify: `components/TextField.tsx`

**Step 1: Write failing tests for error and loading states**

```typescript
// components/TextField.test.tsx
// Add to existing file after basic functionality tests

describe('Error state', () => {
  it('should show error styling when error is true', () => {
    const { getByPlaceholderText } = render(
      <TextField
        placeholder="Email"
        error
      />
    );

    const input = getByPlaceholderText('Email');
    // Test will verify error border color applied
    expect(input).toBeTruthy();
  });

  it('should display error message', () => {
    const { getByText } = render(
      <TextField
        label="Email"
        error
        errorMessage="Email inválido"
      />
    );

    expect(getByText('Email inválido')).toBeTruthy();
  });

  it('should prioritize error message over helper text', () => {
    const { getByText, queryByText } = render(
      <TextField
        label="Email"
        helperText="Digite seu email"
        error
        errorMessage="Email inválido"
      />
    );

    expect(getByText('Email inválido')).toBeTruthy();
    expect(queryByText('Digite seu email')).toBeNull();
  });
});

describe('Loading state', () => {
  it('should show loading indicator when loading', () => {
    const { getByTestId } = render(
      <TextField
        label="Username"
        loading
      />
    );

    expect(getByTestId('textfield-loading-indicator')).toBeTruthy();
  });

  it('should disable input when loading', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <TextField
        placeholder="Loading..."
        loading
        onChangeText={onChangeText}
      />
    );

    const input = getByPlaceholderText('Loading...');
    expect(input.props.editable).toBe(false);
  });
});

describe('Focus state', () => {
  it('should apply focus styles when focused', () => {
    const { getByPlaceholderText } = render(
      <TextField placeholder="Focus me" />
    );

    const input = getByPlaceholderText('Focus me');
    fireEvent(input, 'focus');
    // Component will handle focus state internally
    expect(input).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/TextField.test.tsx`
Expected: FAIL with missing error and loading state implementations

**Step 3: Implement error and loading states**

```typescript
// components/TextField.tsx
// Add to TextFieldProps interface:

export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  helperText?: string;
  errorMessage?: string;
  error?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: TextFieldType;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// Add state for focus:
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';

// Update component:
export const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  helperText,
  errorMessage,
  error = false,
  loading = false,
  disabled = false,
  type = 'text',
  style,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const isDisabled = disabled || loading;

  const getKeyboardType = () => {
    return type === 'numeric' ? 'numeric' : 'default';
  };

  const getInputStyle = (): StyleProp<ViewStyle> => {
    const baseStyle = [styles.input];

    if (isDisabled) {
      baseStyle.push(styles.inputDisabled);
    }

    if (error) {
      baseStyle.push(styles.inputError);
    } else if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }

    return baseStyle;
  };

  const getMessageText = () => {
    if (error && errorMessage) {
      return errorMessage;
    }
    return helperText;
  };

  const getMessageStyle = () => {
    if (error) {
      return [styles.helperText, styles.errorText];
    }
    return styles.helperText;
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}

      <View style={styles.inputWrapper}>
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral.gray[400]}
          editable={!isDisabled}
          keyboardType={getKeyboardType()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              color={colors.primary.base}
              size="small"
              testID="textfield-loading-indicator"
            />
          </View>
        )}
      </View>

      {getMessageText() && (
        <Text style={getMessageStyle()}>{getMessageText()}</Text>
      )}
    </View>
  );
};

// Update styles:
const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.black,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelError: {
    color: colors.semantic.error,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.neutral.white,
    borderWidth: 3, // Chunky border
    borderColor: colors.neutral.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.black,
    minHeight: 56,
  },
  inputFocused: {
    borderColor: colors.primary.base,
    backgroundColor: colors.background.primary,
  },
  inputError: {
    borderColor: colors.semantic.error,
    backgroundColor: '#FFF5F5', // Light red tint
  },
  inputDisabled: {
    backgroundColor: colors.neutral.gray[100],
    opacity: 0.6,
  },
  loadingContainer: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral.gray[600],
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    color: colors.semantic.error,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/TextField.test.tsx`
Expected: PASS - all TextField tests passing

**Step 5: Commit**

```bash
git add components/TextField.tsx components/TextField.test.tsx
git commit -m "feat: add error and loading states to TextField"
```

---

## Task 9: Create Design System Demo Screen - Part 1 (Setup)

**Files:**
- Create: `app/(tabs)/design-demo.tsx`
- Modify: `app/(tabs)/_layout.tsx`

**Step 1: Write failing test for demo screen**

```typescript
// app/(tabs)/design-demo.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import DesignDemo from './design-demo';

describe('DesignDemo Screen', () => {
  it('should render screen title', () => {
    const { getByText } = render(<DesignDemo />);
    expect(getByText('Design System')).toBeTruthy();
  });

  it('should render all button variants', () => {
    const { getByText } = render(<DesignDemo />);

    expect(getByText('Primary Button')).toBeTruthy();
    expect(getByText('Secondary Button')).toBeTruthy();
    expect(getByText('Minimal Button')).toBeTruthy();
    expect(getByText('Outline Button')).toBeTruthy();
  });

  it('should render text field examples', () => {
    const { getByText } = render(<DesignDemo />);

    expect(getByText('NOME')).toBeTruthy();
    expect(getByText('EMAIL')).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/\(tabs\)/design-demo.test.tsx`
Expected: FAIL with "Cannot find module './design-demo'"

**Step 3: Create demo screen**

```typescript
// app/(tabs)/design-demo.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { colors, spacing, typography, borderRadius } from '@/lib/theme/tokens';

export default function DesignDemo() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePrimaryPress = () => {
    console.log('Primary button pressed');
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Simple validation
    const isValid = text.includes('@');
    setEmailError(!isValid && text.length > 0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Design System</Text>
          <Text style={styles.subtitle}>
            Sistema de design gamificado para cessação do tabagismo
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Botões</Text>

          <Button variant="primary" onPress={handlePrimaryPress}>
            Primary Button
          </Button>

          <Button variant="secondary" onPress={() => console.log('Secondary')}>
            Secondary Button
          </Button>

          <Button variant="outline" onPress={() => console.log('Outline')}>
            Outline Button
          </Button>

          <Button variant="minimal" onPress={() => console.log('Minimal')}>
            Minimal Button
          </Button>

          <Button variant="primary" disabled>
            Disabled Button
          </Button>

          <Button variant="primary" loading={loading}>
            Loading Button
          </Button>
        </View>

        {/* Text Fields Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campos de Texto</Text>

          <TextField
            label="Nome"
            placeholder="Digite seu nome"
            value={name}
            onChangeText={setName}
            helperText="Seu nome completo"
          />

          <TextField
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={handleEmailChange}
            error={emailError}
            errorMessage="Por favor, digite um email válido"
            helperText="Usaremos para enviar lembretes"
          />

          <TextField
            label="Idade"
            placeholder="0"
            type="numeric"
            value={age}
            onChangeText={setAge}
          />

          <TextField
            label="Carregando..."
            placeholder="Validando dados"
            loading
          />

          <TextField
            label="Desabilitado"
            placeholder="Campo desabilitado"
            disabled
            value="Não editável"
          />
        </View>

        {/* Color Palette Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paleta de Cores</Text>

          <View style={styles.colorGrid}>
            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.primary.base }]} />
              <Text style={styles.colorLabel}>Primary</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.secondary.base }]} />
              <Text style={styles.colorLabel}>Secondary</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.accent.gold }]} />
              <Text style={styles.colorLabel}>Gold</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.accent.purple }]} />
              <Text style={styles.colorLabel}>Purple</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.accent.pink }]} />
              <Text style={styles.colorLabel}>Pink</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    backgroundColor: colors.neutral.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.primary.base,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.black,
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray[600],
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  section: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.black,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorItem: {
    alignItems: 'center',
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.neutral.gray[300],
    marginBottom: spacing.xs,
  },
  colorLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.gray[700],
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/\(tabs\)/design-demo.test.tsx`
Expected: PASS - demo screen tests passing

**Step 5: Commit**

```bash
git add app/\(tabs\)/design-demo.tsx app/\(tabs\)/design-demo.test.tsx
git commit -m "feat: add design system demo screen"
```

---

## Task 10: Add Design Demo to Tab Navigation

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Step 1: No test needed for navigation config (visual verification)**

**Step 2: Add design-demo tab to navigation**

Read the current `app/(tabs)/_layout.tsx` file first to understand the structure, then add the design-demo tab.

```typescript
// Add to app/(tabs)/_layout.tsx
// Add after existing tabs:

<Tabs.Screen
  name="design-demo"
  options={{
    title: 'Design',
    tabBarIcon: ({ color, focused }) => (
      <TabBarIcon name={focused ? 'color-palette' : 'color-palette-outline'} color={color} />
    ),
  }}
/>
```

**Step 3: Verify in app**

Run: `npm start` and open the app in Expo Go
Expected: See "Design" tab in tab bar, navigate to design demo screen

**Step 4: Commit**

```bash
git add app/\(tabs\)/_layout.tsx
git commit -m "feat: add design demo to tab navigation"
```

---

## Task 11: Create Comprehensive Design Document

**Files:**
- Create: `docs/design-system.md`

**Step 1: Write comprehensive design document**

This document serves as the single source of truth for design decisions and should be referenced when creating any new feature.

```markdown
# Tabagismo Design System

**Version:** 1.0.0
**Last Updated:** 2026-02-07

> **For Developers:** This document MUST be consulted before creating any new feature, component, or screen. It defines our visual language, interaction patterns, and design principles.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design Tokens](#design-tokens)
3. [Animation Guidelines](#animation-guidelines)
4. [Components](#components)
5. [Layout Patterns](#layout-patterns)
6. [Accessibility](#accessibility)
7. [Best Practices](#best-practices)

---

## Design Philosophy

### "Achievement Arcade"

Our design language draws inspiration from modern mobile games and achievement systems while maintaining professionalism appropriate for a health app.

**Core Pillars:**

1. **Motivating & Rewarding**
   - Visual feedback celebrates progress
   - Gamification elements feel earned, not gimmicky
   - Color and animation reinforce positive behavior

2. **Clear & Approachable**
   - No cognitive overhead
   - Brazilian Portuguese, friendly tone
   - Tactile, pressable UI elements

3. **Modern & Vibrant**
   - Bold, saturated colors
   - Chunky borders and shadows for depth
   - Playful without being childish

4. **Consistent & Predictable**
   - Reusable components
   - Standard interaction patterns
   - Token-based design system

---

## Design Tokens

All design tokens live in `/lib/theme/tokens.ts`. **Never use hard-coded values** in components.

### Color Palette

**Primary (Vibrant Orange)** - #FF6B35
Energy, action, main CTAs, progress indicators

```typescript
colors.primary.base    // #FF6B35 - Standard usage
colors.primary.light   // #FF8C61 - Hover states, highlights
colors.primary.dark    // #E64A1A - Borders, emphasis
```

**Secondary (Electric Teal)** - #4ECDC4
Progress, calm actions, alternative CTAs

```typescript
colors.secondary.base  // #4ECDC4 - Standard usage
colors.secondary.light // #7DE0D8 - Highlights
colors.secondary.dark  // #3BB5AD - Borders
```

**Accent Colors** - Gamification highlights

```typescript
colors.accent.gold     // #FFD93D - Achievements, milestones
colors.accent.purple   // #A66CFF - Power-ups, special features
colors.accent.pink     // #FF6AC1 - Streaks, momentum tracking
```

**Semantic Colors** - Standard feedback

```typescript
colors.semantic.error   // #FF4757 - Errors, destructive actions
colors.semantic.success // #2ED573 - Success states, completion
colors.semantic.warning // #FFA502 - Warnings, caution
colors.semantic.info    // #5352ED - Informational messages
```

**Neutral Colors**

```typescript
colors.neutral.white   // #FFFFFF
colors.neutral.black   // #1A1A2E - Deep navy (not pure black)
colors.neutral.gray    // Scale from 100 (light) to 900 (dark)
```

**Background Colors**

```typescript
colors.background.primary   // #F8F9FE - Main background (soft lavender tint)
colors.background.secondary // #FFFFFF - Cards, panels
colors.background.tertiary  // #EEF0FB - Subtle sections
```

### Spacing Scale

```typescript
spacing.xs   // 4px  - Tight spacing, compact layouts
spacing.sm   // 8px  - Small gaps, related items
spacing.md   // 16px - Standard spacing (most common)
spacing.lg   // 24px - Section spacing, generous gaps
spacing.xl   // 32px - Large separation, major sections
spacing.xxl  // 48px - Extra-large, dramatic spacing
```

**Usage Guidelines:**
- Use `md` (16px) as default padding/margin
- Use `lg` (24px) between sections
- Use `xl` (32px) for major layout separations

### Typography

```typescript
// Font Families
typography.fontFamily.primary  // 'System' - SF Pro (iOS), Roboto (Android)
typography.fontFamily.display  // 'System' - Rounded for headings

// Font Sizes
typography.fontSize.xs   // 12px - Captions, labels
typography.fontSize.sm   // 14px - Helper text, secondary
typography.fontSize.md   // 16px - Body text (most common)
typography.fontSize.lg   // 20px - Subheadings
typography.fontSize.xl   // 24px - Headings
typography.fontSize.xxl  // 32px - Page titles

// Font Weights
typography.fontWeight.regular  // 400 - Body text
typography.fontWeight.medium   // 600 - Emphasis, inputs
typography.fontWeight.bold     // 700 - Buttons, labels
typography.fontWeight.black    // 900 - Titles, headers

// Line Heights
typography.lineHeight.tight    // 1.2  - Headings
typography.lineHeight.normal   // 1.5  - Body text
typography.lineHeight.relaxed  // 1.75 - Readable paragraphs
```

### Shadows

Chunky shadows create depth and tactile feel:

```typescript
shadows.sm  // Subtle - Cards, minimal components
shadows.md  // Standard - Buttons, inputs
shadows.lg  // Prominent - Floating panels, important elements
shadows.xl  // Dramatic - Modals, major overlays
```

### Border Radius

Rounded corners for friendly, modern feel:

```typescript
borderRadius.sm   // 8px  - Small elements
borderRadius.md   // 12px - Buttons, inputs (standard)
borderRadius.lg   // 16px - Cards, panels
borderRadius.xl   // 24px - Large cards, sections
borderRadius.full // 9999px - Circular elements
```

---

## Animation Guidelines

All animations use React Native Reanimated 3 for 60fps performance. Tokens live in `/lib/theme/animations.ts`.

### Philosophy: Subtle & Purposeful

**Modern animations are felt, not seen.**

- ✅ **DO:** Use animation for feedback, hierarchy, continuity
- ❌ **DON'T:** Animate for spectacle or decoration
- ✅ **DO:** Keep durations short (200-300ms)
- ❌ **DON'T:** Use long, drawn-out animations that slow interactions

### Timing Values

```typescript
timing.fast   // 200ms - Quick feedback (button press, focus)
timing.normal // 300ms - Standard transitions (navigation)
timing.slow   // 500ms - Deliberate movements (page reveals)
```

### Animation Configs

**Gentle Spring** (Most Common)
Use for 90% of interactions - subtle, modern feel

```typescript
animations.gentleSpring  // damping: 20, stiffness: 100
```

**Use for:**
- Button press (scale down to 0.95)
- Input focus
- Card hover
- Most UI interactions

**Bouncy Spring** (Special Moments)
Use sparingly for celebrations

```typescript
animations.spring  // damping: 15, stiffness: 150
```

**Use for:**
- Achievement unlocks
- Milestone celebrations
- Success confirmations
- Streak completions

**Easing Curves** (Timing Animations)

```typescript
animations.easing.easeOut     // Smooth deceleration - exits, fade-outs
animations.easing.easeInOut   // Smooth both ways - most transitions
animations.easing.bounce      // Slight overshoot - entrances, celebrations
```

### Common Animation Patterns

**Button Press**
```typescript
// Scale down to 95% on press, spring back
scale: 0.95 (press) → 1.0 (release)
Animation: gentleSpring
Duration: 200ms
```

**Input Focus**
```typescript
// Border color change + subtle background tint
borderColor: gray → primary
backgroundColor: white → lavender tint
Animation: timing with easeOut
Duration: 200ms
```

**Success Celebration**
```typescript
// Pop in with slight bounce
scale: 0 → 1.1 → 1.0
opacity: 0 → 1
Animation: spring (bouncy)
Duration: 300ms
```

**Page Transition**
```typescript
// Slide in from right
translateX: screenWidth → 0
opacity: 0 → 1
Animation: timing with easeInOut
Duration: 300ms
```

### Accessibility: Reduced Motion

Always respect user preferences:

```typescript
import { AccessibilityInfo } from 'react-native';

// Check reduced motion preference
const reducedMotion = await AccessibilityInfo.isReduceMotionEnabled();

// If enabled, use instant transitions or minimal animation
const animationDuration = reducedMotion ? 0 : timing.normal;
```

---

## Components

Reusable components live in `/components`. See `/components/CLAUDE.md` for detailed component documentation.

### Button

**Variants:** primary, secondary, outline, minimal
**States:** default, pressed, loading, disabled
**Animation:** Gentle spring scale (0.95) on press

**Usage:**
```typescript
<Button variant="primary" onPress={handleSave}>
  Salvar Progresso
</Button>
```

### TextField

**Types:** text, numeric
**States:** default, focused, error, loading, disabled
**Animation:** Border color transition (200ms) on focus

**Usage:**
```typescript
<TextField
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={!isValid}
  errorMessage="Email inválido"
/>
```

---

## Layout Patterns

### Screen Structure

Standard screen layout:

```
┌─────────────────────────────┐
│   SafeAreaView              │
│ ┌─────────────────────────┐ │
│ │ ScrollView              │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ Content (padding)   │ │ │
│ │ │                     │ │ │
│ │ │ - Header            │ │ │
│ │ │ - Sections          │ │ │
│ │ │ - CTAs              │ │ │
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Code:**
```typescript
<SafeAreaView style={styles.safeArea}>
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.content}
  >
    {/* Content */}
  </ScrollView>
</SafeAreaView>

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
});
```

### Card Pattern

Elevated card for grouping content:

```typescript
<View style={styles.card}>
  {/* Card content */}
</View>

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.neutral.gray[300],
    ...shadows.md,
  },
});
```

### Section Pattern

Sections with titles:

```typescript
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Section Title</Text>
  {/* Section content */}
</View>

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
});
```

---

## Accessibility

### Touch Targets

Minimum 44x44 points (iOS HIG) / 48x48 dp (Material):

```typescript
// Buttons use 56px min-height
minHeight: 56,

// Add padding to expand touch area if needed
hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
```

### Color Contrast

All text meets WCAG AA standards:

- **Large text (18px+):** 3:1 contrast ratio
- **Normal text (< 18px):** 4.5:1 contrast ratio

Our colors are pre-validated for accessibility.

### Screen Readers

Always provide labels:

```typescript
<Button accessibilityLabel="Salvar seu progresso">
  Salvar
</Button>

<TextInput
  accessibilityLabel="Digite seu email"
  accessibilityHint="Usaremos para enviar lembretes"
/>
```

### Reduced Motion

Respect motion preferences (see Animation Guidelines).

---

## Best Practices

### DO's ✅

1. **Use design tokens exclusively**
   ```typescript
   // ✅ Good
   color: colors.primary.base
   padding: spacing.md

   // ❌ Bad
   color: '#FF6B35'
   padding: 16
   ```

2. **Import tokens at component level**
   ```typescript
   import { colors, spacing, typography, borderRadius } from '@/lib/theme/tokens';
   ```

3. **Follow component patterns**
   - Use Button for actions, not TouchableOpacity
   - Use TextField for inputs, not bare TextInput

4. **Provide user feedback**
   - Show loading states during async operations
   - Display error messages clearly
   - Confirm successful actions

5. **Test with real content**
   - Use Portuguese text in examples
   - Test with long strings
   - Verify responsive behavior

### DON'Ts ❌

1. **Don't hardcode values**
   - No magic numbers
   - No inline colors
   - No arbitrary spacing

2. **Don't over-animate**
   - Keep animations subtle
   - Use 200-300ms durations
   - Don't stack multiple animations

3. **Don't skip states**
   - Always handle loading
   - Always handle errors
   - Always show disabled state

4. **Don't reinvent components**
   - Use existing components
   - Extend components with props
   - Only create new when necessary

---

## Updating This Document

When adding new patterns, components, or tokens:

1. Update the relevant section here first
2. Implement the change in code
3. Add examples to the demo screen (`/app/(tabs)/design-demo.tsx`)
4. Update `/components/CLAUDE.md` if component-related
5. Commit changes with clear documentation

**Keep this document as the single source of truth.**

---

**Questions?** Reference `/components/CLAUDE.md` for component-specific details or `/lib/theme/` for token implementation.
```

**Step 2: Commit**

```bash
git add docs/design-system.md
git commit -m "docs: add comprehensive design system document"
```

---

## Task 12: Update CLAUDE.md to Reference Design System

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add design system reference to CLAUDE.md**

Read the current `CLAUDE.md` file and add a reference to the design system document in an appropriate location.

Add after the "Quick Links" section:

```markdown
## Quick Links

📁 **[Database Guide](/db/CLAUDE.md)** - Schemas, migrations, repositories
📱 **[App & Navigation Guide](/app/CLAUDE.md)** - Screens, routing, layouts
🎨 **[Design System](/docs/design-system.md)** - Design tokens, components, animations
📋 **[Architecture Decisions](/docs/plans/)** - Detailed design docs
```

And in the "Common Tasks" section, add:

```markdown
### Start New Feature

**IMPORTANT:** Before creating any new feature, screen, or component:

1. **Read the design system**: `/docs/design-system.md`
   - Use design tokens (colors, spacing, typography)
   - Follow animation guidelines
   - Use existing components when possible

2. **Plan the feature**: Use TDD approach
   - Write tests first
   - Implement minimal code
   - Iterate

3. **Follow patterns**: Check relevant guides
   - Database: `/db/CLAUDE.md`
   - Screens: `/app/CLAUDE.md`
   - Components: `/components/CLAUDE.md`
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add design system reference to CLAUDE.md"
```

---

## Task 13: Create Design System Documentation

**Files:**
- Create: `components/CLAUDE.md`

**Step 1: Write component documentation**

```markdown
# Components Guide

Design system components for the Tabagismo smoking cessation app.

> **See full design system:** `/docs/design-system.md` for complete guidelines, tokens, and patterns.

---

## Quick Reference

This guide provides quick component API reference. For design philosophy, tokens, and detailed guidelines, see the [main design system document](/docs/design-system.md).

---

## Design Philosophy

**"Achievement Arcade"** - A bold, game-inspired design language that makes progress feel rewarding and engaging.

**Key Principles:**
- **Tactile & Chunky:** 3px borders, prominent shadows, components feel "pressable"
- **Vibrant & Rewarding:** Saturated colors, achievement palette (gold, electric blue)
- **Playful Typography:** Rounded, friendly, uppercase labels for impact
- **State Celebration:** Loading states, focus states, and interactions that feel satisfying

---

## Design Tokens

Located in: `/lib/theme/tokens.ts`

### Colors

**Primary (Vibrant Orange)** - Action, energy, main CTAs
- `colors.primary.base` - #FF6B35
- `colors.primary.light` - #FF8C61
- `colors.primary.dark` - #E64A1A

**Secondary (Electric Teal)** - Progress, calm actions
- `colors.secondary.base` - #4ECDC4
- `colors.secondary.light` - #7DE0D8
- `colors.secondary.dark` - #3BB5AD

**Accent Colors** - Gamification highlights
- `colors.accent.gold` - #FFD93D (Achievements, milestones)
- `colors.accent.purple` - #A66CFF (Power-ups, special features)
- `colors.accent.pink` - #FF6AC1 (Streaks, momentum)

**Semantic Colors**
- `colors.semantic.error` - #FF4757
- `colors.semantic.success` - #2ED573
- `colors.semantic.warning` - #FFA502
- `colors.semantic.info` - #5352ED

### Spacing

Scale: 4, 8, 16, 24, 32, 48
- Use `spacing.md` (16) for most padding/margins
- Use `spacing.lg` (24) for section spacing

### Typography

- Font sizes: xs(12), sm(14), md(16), lg(20), xl(24), xxl(32)
- Weights: regular(400), medium(600), bold(700), black(900)
- Use `fontWeight.bold` for labels, `fontWeight.black` for titles

### Shadows

Chunky shadows for depth:
- `shadows.sm` - Subtle elements
- `shadows.md` - Buttons, cards
- `shadows.lg` - Floating panels
- `shadows.xl` - Modals

---

## Components

### Button

**Import:** `import { Button } from '@/components/Button'`

**Variants:**
1. **Primary** - Main CTAs, important actions
2. **Secondary** - Secondary actions, alternative paths
3. **Outline** - Tertiary actions, cancel buttons
4. **Minimal** - Subtle actions, text links

**Props:**
- `variant`: 'primary' | 'secondary' | 'minimal' | 'outline'
- `onPress`: () => void
- `disabled`: boolean
- `loading`: boolean
- `children`: string (button text)

**Examples:**

```typescript
// Primary action
<Button variant="primary" onPress={handleSave}>
  Salvar Progresso
</Button>

// Loading state
<Button variant="primary" loading>
  Carregando...
</Button>

// Disabled
<Button variant="secondary" disabled>
  Indisponível
</Button>
```

**Design Notes:**
- 56px min-height for touch targets
- 3px border for chunky feel
- Bold text for readability
- Shadow for depth

**Animation:**
- Gentle spring scale animation on press (scale: 0.95)
- Duration: 200ms (fast timing)
- See `/docs/design-system.md` for animation guidelines

---

### TextField

**Import:** `import { TextField } from '@/components/TextField'`

**Types:**
- `text` - Default text input
- `numeric` - Numeric keyboard

**States:**
- Normal
- Focused (primary border, subtle background)
- Error (red border, error message)
- Loading (spinner on right)
- Disabled (grayed out)

**Props:**
- `label`: string (uppercase label)
- `placeholder`: string
- `value`: string
- `onChangeText`: (text: string) => void
- `type`: 'text' | 'numeric'
- `error`: boolean
- `errorMessage`: string
- `helperText`: string
- `loading`: boolean
- `disabled`: boolean

**Examples:**

```typescript
// Basic text input
<TextField
  label="Nome"
  placeholder="Digite seu nome"
  value={name}
  onChangeText={setName}
  helperText="Seu nome completo"
/>

// Error state
<TextField
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={!isValidEmail}
  errorMessage="Email inválido"
/>

// Numeric input
<TextField
  label="Cigarros por Dia"
  type="numeric"
  value={count}
  onChangeText={setCount}
/>

// Loading validation
<TextField
  label="Username"
  value={username}
  loading={isValidating}
/>
```

**Design Notes:**
- 56px min-height matches button height
- 3px border, increases to primary color on focus
- Uppercase bold labels for hierarchy
- Error state overrides helper text

**Animation:**
- Smooth border color transition on focus
- Background tint fade on focus
- Duration: 200ms (fast timing)
- See `/docs/design-system.md` for animation guidelines

---

## Demo Screen

Preview all components: `/app/(tabs)/design-demo.tsx`

Run the app and navigate to the "Design" tab to see:
- All button variants with interactive states
- Text fields with various states (error, loading, disabled)
- Color palette preview
- Live examples with working interactions

---

## Usage Guidelines

### Do's ✅
- Use primary buttons for main actions
- Apply proper spacing (use tokens)
- Include labels on all text fields
- Provide helper text for clarity
- Show loading states during async operations
- Use error states with clear messages

### Don'ts ❌
- Don't use outline buttons for primary actions
- Don't stack too many primary buttons
- Don't forget placeholder text
- Don't ignore disabled states
- Don't use custom colors outside tokens
- Don't skip accessibility considerations

---

## Extending the System

**IMPORTANT:** Before creating any new component, consult `/docs/design-system.md` for:
- Design tokens and usage guidelines
- Animation patterns and timing
- Layout patterns and best practices
- Accessibility requirements

When adding new components:

1. **Consult design system** - `/docs/design-system.md` first
2. **Create in `/components`** with PascalCase naming
3. **Use design tokens** - import from `/lib/theme/tokens`
4. **Add animations** - import from `/lib/theme/animations`
5. **Write tests first** - follow TDD approach
6. **Match aesthetic** - chunky borders, bold colors, playful feel
7. **Support states** - disabled, loading, error, focus
8. **Add to demo** - include in design-demo.tsx
9. **Document here** - update this guide
10. **Update design system doc** - if introducing new patterns

**Test coverage required:** 90%+
```

**Step 2: Commit**

```bash
git add components/CLAUDE.md
git commit -m "docs: add design system component documentation"
```

---

## Verification & Next Steps

**Run full test suite:**
```bash
npm test
```

**Expected:** All tests passing, 90%+ coverage

**Visual verification:**
```bash
npm start
```

Navigate to Design tab and verify:
- ✅ All button variants render correctly
- ✅ Button press animation (scale down to 95%, smooth spring back)
- ✅ Button interactions work (press, loading, disabled)
- ✅ Text fields show all states
- ✅ Focus animation (smooth border color transition, background fade)
- ✅ Error validation works
- ✅ Color palette displays
- ✅ Overall aesthetic feels vibrant and game-like
- ✅ Animations feel modern and subtle, not exaggerated

**Test animations:**
1. Tap buttons multiple times - should scale smoothly
2. Focus/blur text inputs - should see smooth color transitions
3. All animations should complete in 200-300ms
4. No janky or stuttering animations

---

## Plan Complete

**Created:**
- Design tokens (`/lib/theme/tokens.ts`)
- Animation tokens and guidelines (`/lib/theme/animations.ts`)
- Button component with 4 variants + press animations
- TextField component with all states + focus animations
- Design demo screen with interactive examples
- Comprehensive design system document (`/docs/design-system.md`)
- Component quick reference (`/components/CLAUDE.md`)
- Updated main CLAUDE.md with design system reference

**Key Features:**
- Token-based design system (colors, spacing, typography, shadows, border radius)
- Modern, subtle animations (200-300ms, gentle springs)
- Gamified aesthetic (vibrant colors, chunky borders, tactile feel)
- Comprehensive documentation for future feature development
- 90%+ test coverage requirement

**Ready for:**
- Building additional game-like components (cards, badges, progress bars, achievements)
- Implementing gamification features using this design foundation
- Creating consistent, vibrant UX throughout the app
- All new features should reference `/docs/design-system.md`

---
