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
