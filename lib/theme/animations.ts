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
