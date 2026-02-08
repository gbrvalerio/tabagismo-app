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
