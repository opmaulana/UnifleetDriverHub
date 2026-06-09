export const theme = {
  colors: {
    primary: '#E53935', // ASAS Red
    secondary: '#FFFFFF', // Light mode backgrounds
    tertiary: '#1D1D1F', // Dark mode base
    background: '#F5F5F7', // Neutral background
    surface: '#FFFFFF',
    text: '#1D1D1F',
    textSecondary: '#6E6E73',
    border: '#D2D2D7',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#007AFF',
    white: '#FFFFFF',
    black: '#000000',
    card: '#FFFFFF',
    cardElevated: '#F5F5F7',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 999,
  },
  typography: {
    h1: {
      fontSize: 34,
      fontWeight: '700' as const,
      lineHeight: 41,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    bodyLg: {
      fontSize: 20,
      fontWeight: '500' as const,
      lineHeight: 26,
    },
    bodyMd: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    labelLg: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    labelSm: {
      fontSize: 13,
      fontWeight: '500' as const,
      lineHeight: 18,
    },
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 4,
    },
  }
};

export type Theme = typeof theme;
