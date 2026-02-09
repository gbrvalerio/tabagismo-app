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
    poppins: {
      regular: 'Poppins_400Regular',
      medium: 'Poppins_500Medium',
      semibold: 'Poppins_600SemiBold',
      bold: 'Poppins_700Bold',
    },
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

export const typographyPresets = {
  hero: {
    fontFamily: typography.fontFamily.poppins.bold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  subhead: {
    fontFamily: typography.fontFamily.poppins.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    fontFamily: typography.fontFamily.poppins.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    fontFamily: typography.fontFamily.poppins.semibold,
    fontSize: 18,
    lineHeight: 24,
  },
  coinCounter: {
    fontFamily: typography.fontFamily.poppins.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  small: {
    fontFamily: typography.fontFamily.poppins.regular,
    fontSize: 14,
    lineHeight: 20,
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
export type TypographyPresets = typeof typographyPresets;
export type Shadows = typeof shadows;
export type BorderRadius = typeof borderRadius;
