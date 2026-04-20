// Design System Foundation - Design Tokens
// Comprehensive design token system for Garlaws platform

export const designTokens = {
  // Color System
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#f0f9f0',
      100: '#e0f2e0',
      200: '#c2e5c2',
      300: '#94d194',
      400: '#66b966',
      500: '#2d7d2d', // Main olive
      600: '#256825',
      700: '#1d521d',
      800: '#153c15',
      900: '#0c260c',
    },
    secondary: {
      50: '#fdf9f0',
      100: '#fbf2e0',
      200: '#f7e5c2',
      300: '#f2d194',
      400: '#edc566',
      500: '#e6b83a', // Main gold
      600: '#d4a62d',
      700: '#b89322',
      800: '#9c7a1a',
      900: '#806110',
    },
    accent: {
      50: '#f0f9f9',
      100: '#e0f2f3',
      200: '#c2e5e7',
      300: '#94d8db',
      400: '#66cbcf',
      500: '#45a29e', // Main slate
      600: '#3a8b87',
      700: '#2e716d',
      800: '#235754',
      900: '#173d3a',
    },

    // Neutral Colors
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },

    // Semantic Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
      display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
      base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }],
      lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
      xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
      '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
      '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  // Spacing System (4px grid)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem',    // 256px
  },

  // Border Radius System
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  },

  // Shadow System
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },

  // Animation System
  animations: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    keyframes: {
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
      ping: {
        '75%, 100%': {
          transform: 'scale(2)',
          opacity: '0',
        },
      },
      pulse: {
        '50%': {
          opacity: '0.5',
        },
      },
      bounce: {
        '0%, 100%': {
          transform: 'translateY(-25%)',
          animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
        },
        '50%': {
          transform: 'translateY(0)',
          animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
        },
      },
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index scale
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
  },
};

// Utility functions for design tokens
export const getColor = (color: string, shade: number = 500) => {
  const [category, name] = color.split('.');
  if (category && name) {
    const categoryColors = designTokens.colors[category as keyof typeof designTokens.colors];
    if (categoryColors && typeof categoryColors === 'object') {
      return (categoryColors as any)[shade];
    }
  }
  const directColor = designTokens.colors[color as keyof typeof designTokens.colors];
  if (directColor && typeof directColor === 'object') {
    return (directColor as any)[shade];
  }
  return undefined;
};

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[size];
};

export const getTypography = (size: keyof typeof designTokens.typography.fontSize) => {
  return designTokens.typography.fontSize[size];
};

export const getShadow = (size: keyof typeof designTokens.shadows) => {
  return designTokens.shadows[size];
};

export const getBorderRadius = (size: keyof typeof designTokens.borderRadius) => {
  return designTokens.borderRadius[size];
};

// Theme configurations
export const themes = {
  light: {
    background: designTokens.colors.neutral[50],
    foreground: designTokens.colors.neutral[900],
    primary: designTokens.colors.primary[500],
    secondary: designTokens.colors.secondary[500],
    accent: designTokens.colors.accent[500],
    muted: designTokens.colors.neutral[100],
    border: designTokens.colors.neutral[200],
    ring: designTokens.colors.primary[500],
  },
  dark: {
    background: designTokens.colors.neutral[900],
    foreground: designTokens.colors.neutral[50],
    primary: designTokens.colors.primary[400],
    secondary: designTokens.colors.secondary[400],
    accent: designTokens.colors.accent[400],
    muted: designTokens.colors.neutral[800],
    border: designTokens.colors.neutral[700],
    ring: designTokens.colors.primary[400],
  },
  garlaws: {
    background: '#0b0c10',
    foreground: '#f4f4f4',
    primary: '#2d3b2d',
    secondary: '#c5a059',
    accent: '#45a29e',
    muted: '#1f2833',
    border: '#2d3b2d',
    ring: '#c5a059',
  },
};