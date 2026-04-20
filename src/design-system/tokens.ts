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

    // Enhanced Color Variations with Alpha/Opacity
    primaryAlpha: {
      5: 'rgba(45, 125, 45, 0.05)',
      10: 'rgba(45, 125, 45, 0.1)',
      15: 'rgba(45, 125, 45, 0.15)',
      20: 'rgba(45, 125, 45, 0.2)',
      25: 'rgba(45, 125, 45, 0.25)',
      30: 'rgba(45, 125, 45, 0.3)',
      40: 'rgba(45, 125, 45, 0.4)',
      50: 'rgba(45, 125, 45, 0.5)',
      60: 'rgba(45, 125, 45, 0.6)',
      70: 'rgba(45, 125, 45, 0.7)',
      80: 'rgba(45, 125, 45, 0.8)',
      90: 'rgba(45, 125, 45, 0.9)',
    },
    secondaryAlpha: {
      5: 'rgba(230, 184, 58, 0.05)',
      10: 'rgba(230, 184, 58, 0.1)',
      15: 'rgba(230, 184, 58, 0.15)',
      20: 'rgba(230, 184, 58, 0.2)',
      25: 'rgba(230, 184, 58, 0.25)',
      30: 'rgba(230, 184, 58, 0.3)',
      40: 'rgba(230, 184, 58, 0.4)',
      50: 'rgba(230, 184, 58, 0.5)',
      60: 'rgba(230, 184, 58, 0.6)',
      70: 'rgba(230, 184, 58, 0.7)',
      80: 'rgba(230, 184, 58, 0.8)',
      90: 'rgba(230, 184, 58, 0.9)',
    },
    accentAlpha: {
      5: 'rgba(69, 162, 158, 0.05)',
      10: 'rgba(69, 162, 158, 0.1)',
      15: 'rgba(69, 162, 158, 0.15)',
      20: 'rgba(69, 162, 158, 0.2)',
      25: 'rgba(69, 162, 158, 0.25)',
      30: 'rgba(69, 162, 158, 0.3)',
      40: 'rgba(69, 162, 158, 0.4)',
      50: 'rgba(69, 162, 158, 0.5)',
      60: 'rgba(69, 162, 158, 0.6)',
      70: 'rgba(69, 162, 158, 0.7)',
      80: 'rgba(69, 162, 158, 0.8)',
      90: 'rgba(69, 162, 158, 0.9)',
    },

    // Gradient Definitions
    gradients: {
      primary: 'linear-gradient(135deg, #2d7d2d 0%, #45a29e 100%)',
      secondary: 'linear-gradient(135deg, #e6b83a 0%, #c5a059 100%)',
      accent: 'linear-gradient(135deg, #45a29e 0%, #2d7d2d 100%)',
      gold: 'linear-gradient(135deg, #c5a059 0%, #e6c77a 50%, #c5a059 100%)',
      olive: 'linear-gradient(135deg, #2d7d2d 0%, #256825 50%, #2d7d2d 100%)',
      slate: 'linear-gradient(135deg, #45a29e 0%, #3a8b87 50%, #45a29e 100%)',
      surface: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)',
    },

    // Enhanced Neutral Colors
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
      950: '#0a0a0a',
    },

    // Enhanced Semantic Colors with Alpha Support
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
      950: '#052e16',
    },
    successAlpha: {
      5: 'rgba(34, 197, 94, 0.05)',
      10: 'rgba(34, 197, 94, 0.1)',
      20: 'rgba(34, 197, 94, 0.2)',
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
      950: '#451a03',
    },
    warningAlpha: {
      5: 'rgba(245, 158, 11, 0.05)',
      10: 'rgba(245, 158, 11, 0.1)',
      20: 'rgba(245, 158, 11, 0.2)',
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
      950: '#450a0a',
    },
    errorAlpha: {
      5: 'rgba(239, 68, 68, 0.05)',
      10: 'rgba(239, 68, 68, 0.1)',
      20: 'rgba(239, 68, 68, 0.2)',
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
      950: '#172554',
    },
    infoAlpha: {
      5: 'rgba(59, 130, 246, 0.05)',
      10: 'rgba(59, 130, 246, 0.1)',
      20: 'rgba(59, 130, 246, 0.2)',
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

  // Enhanced Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      display: ['Cal Sans', 'Inter Display', 'Inter', 'system-ui', 'sans-serif'],
      serif: ['Crimson Text', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    },

    // Comprehensive Font Size Scale
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
      'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0em' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
      '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
      '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
      '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
      '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.045em' }],
      '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
    },

    // Enhanced Font Weight Scale
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

    // Typography Scale with Semantic Names
    text: {
      caption: {
        fontSize: '0.75rem',
        lineHeight: '1rem',
        fontWeight: '400',
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
      },
      body: {
        xs: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: '400' },
        sm: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: '400' },
        base: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '400' },
        lg: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: '400' },
      },
      heading: {
        h1: { fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: '700', letterSpacing: '-0.025em' },
        h2: { fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: '600', letterSpacing: '-0.02em' },
        h3: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: '600', letterSpacing: '-0.015em' },
        h4: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.01em' },
        h5: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.005em' },
        h6: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '600', letterSpacing: '0em' },
      },
      display: {
        d1: { fontSize: '4.5rem', lineHeight: '1', fontWeight: '700', letterSpacing: '-0.04em' },
        d2: { fontSize: '3.75rem', lineHeight: '1', fontWeight: '700', letterSpacing: '-0.035em' },
        d3: { fontSize: '3rem', lineHeight: '1', fontWeight: '700', letterSpacing: '-0.03em' },
        d4: { fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: '700', letterSpacing: '-0.025em' },
      },
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

// Enhanced Theme configurations
export const themes = {
  light: {
    // Base colors
    background: designTokens.colors.neutral[50],
    foreground: designTokens.colors.neutral[900],
    surface: designTokens.colors.neutral[100],
    surfaceHover: designTokens.colors.neutral[200],

    // Brand colors
    primary: designTokens.colors.primary[500],
    primaryHover: designTokens.colors.primary[600],
    primaryAlpha: designTokens.colors.primaryAlpha[10],
    secondary: designTokens.colors.secondary[500],
    secondaryHover: designTokens.colors.secondary[600],
    accent: designTokens.colors.accent[500],
    accentHover: designTokens.colors.accent[600],

    // Semantic colors
    success: designTokens.colors.success[500],
    warning: designTokens.colors.warning[500],
    error: designTokens.colors.error[500],
    info: designTokens.colors.info[500],

    // Neutral variations
    muted: designTokens.colors.neutral[100],
    mutedForeground: designTokens.colors.neutral[600],
    border: designTokens.colors.neutral[200],
    borderHover: designTokens.colors.neutral[300],
    ring: designTokens.colors.primary[500],

    // Gradients
    gradientPrimary: designTokens.colors.gradients.primary,
    gradientSecondary: designTokens.colors.gradients.secondary,
    gradientSurface: designTokens.colors.gradients.surface,

    // Shadows
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    shadowHover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },

  dark: {
    // Base colors
    background: designTokens.colors.neutral[950],
    foreground: designTokens.colors.neutral[50],
    surface: designTokens.colors.neutral[900],
    surfaceHover: designTokens.colors.neutral[800],

    // Brand colors
    primary: designTokens.colors.primary[400],
    primaryHover: designTokens.colors.primary[300],
    primaryAlpha: designTokens.colors.primaryAlpha[20],
    secondary: designTokens.colors.secondary[400],
    secondaryHover: designTokens.colors.secondary[300],
    accent: designTokens.colors.accent[400],
    accentHover: designTokens.colors.accent[300],

    // Semantic colors
    success: designTokens.colors.success[400],
    warning: designTokens.colors.warning[400],
    error: designTokens.colors.error[400],
    info: designTokens.colors.info[400],

    // Neutral variations
    muted: designTokens.colors.neutral[800],
    mutedForeground: designTokens.colors.neutral[400],
    border: designTokens.colors.neutral[700],
    borderHover: designTokens.colors.neutral[600],
    ring: designTokens.colors.primary[400],

    // Gradients
    gradientPrimary: designTokens.colors.gradients.primary,
    gradientSecondary: designTokens.colors.gradients.secondary,
    gradientSurface: designTokens.colors.gradients.glass,

    // Shadows
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
    shadowHover: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
  },

  garlaws: {
    // Base colors
    background: '#0b0c10',
    foreground: '#f4f4f4',
    surface: '#1f2833',
    surfaceHover: '#2d3b2d',

    // Brand colors
    primary: '#2d7d2d',
    primaryHover: '#256825',
    primaryAlpha: designTokens.colors.primaryAlpha[20],
    secondary: '#c5a059',
    secondaryHover: '#b89322',
    accent: '#45a29e',
    accentHover: '#3a8b87',

    // Semantic colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Neutral variations
    muted: '#1f2833',
    mutedForeground: '#a1a1aa',
    border: '#2d3b2d',
    borderHover: '#45a29e',
    ring: '#c5a059',

    // Gradients
    gradientPrimary: designTokens.colors.gradients.primary,
    gradientSecondary: designTokens.colors.gradients.gold,
    gradientSurface: designTokens.colors.gradients.surface,

    // Shadows
    shadow: '0 4px 6px -1px rgba(45, 59, 45, 0.1), 0 2px 4px -2px rgba(45, 59, 45, 0.1)',
    shadowHover: '0 10px 15px -3px rgba(197, 160, 89, 0.1), 0 4px 6px -4px rgba(197, 160, 89, 0.1)',
  },

  // Professional theme variants
  'garlaws-professional': {
    ...themes.garlaws,
    background: '#ffffff',
    foreground: '#0b0c10',
    surface: '#f8fafc',
    surfaceHover: '#f1f5f9',
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    muted: '#f8fafc',
    mutedForeground: '#64748b',
  },

  'garlaws-enterprise': {
    ...themes.garlaws,
    primary: '#1e40af',
    secondary: '#7c3aed',
    accent: '#059669',
    gradientPrimary: 'linear-gradient(135deg, #1e40af 0%, #059669 100%)',
    gradientSecondary: 'linear-gradient(135deg, #7c3aed 0%, #c5a059 100%)',
  },
};