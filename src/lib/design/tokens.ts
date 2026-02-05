/**
 * Design System Tokens
 * Foundation for cohesive, professional UI
 */

export const typography = {
    display: {
        size: '28px',
        weight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
    },
    heading: {
        size: '18px',
        weight: 500,
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
    },
    sectionHeader: {
        size: '13px',
        weight: 600,
        lineHeight: 1.3,
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
    },
    body: {
        size: '15px',
        weight: 400,
        lineHeight: 1.5,
    },
    bodySecondary: {
        size: '13px',
        weight: 400,
        lineHeight: 1.4,
    },
    micro: {
        size: '11px',
        weight: 400,
        lineHeight: 1.3,
    },
} as const;

export const colors = {
    // Backgrounds
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceHover: '#F8F9FA',

    // Text
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',

    // Accent colors
    accent: '#3B82F6',
    accentHover: '#2563EB',
    accentLight: '#DBEAFE',

    // Status colors
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',

    // Borders
    border: '#E2E8F0',
    borderHover: '#CBD5E1',

    // Quadrants
    q1: '#EF4444', // Urgent & Important (Red)
    q2: '#3B82F6', // Not Urgent & Important (Blue)
    q3: '#F59E0B', // Urgent & Not Important (Amber)
    q4: '#64748B', // Not Urgent & Not Important (Slate)
} as const;

export const spacing = {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
} as const;

export const radius = {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
} as const;

export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

export const transitions = {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

// Helper function to apply typography
export function applyTypography(style: keyof typeof typography) {
    const t = typography[style];
    const styles: Record<string, any> = {
        fontSize: t.size,
        fontWeight: t.weight,
        lineHeight: t.lineHeight,
    };

    if ('letterSpacing' in t) {
        styles.letterSpacing = t.letterSpacing;
    }

    if ('textTransform' in t) {
        styles.textTransform = t.textTransform;
    }

    return styles;
}
