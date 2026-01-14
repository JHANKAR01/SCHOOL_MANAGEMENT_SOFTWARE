// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEBULA DESIGN SYSTEM - Shared Theme Tokens
// Used by: Login, SuperAdmin Dashboard, and future Nebula-themed components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NEBULA_DARK = {
    // Primary Gradient: Electric Indigo → Violet
    primary: '#4F46E5',
    primaryEnd: '#7C3AED',
    primaryHover: '#4338CA',

    // Accent: Neon Teal (Success/Safe)
    accent: '#2DD4BF',
    accentHover: '#14B8A6',

    // Warning: Amber (Modify Mode)
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    warningBorder: 'rgba(245, 158, 11, 0.4)',

    // Error/Danger
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.15)',
    errorBorder: 'rgba(239, 68, 68, 0.3)',
    errorText: '#FCA5A5',

    // Backgrounds
    bgDeep: '#020617',           // Deep slate-950
    bgGradientEnd: '#2E1065',    // Violet-950
    bgCard: 'rgba(30, 41, 59, 0.6)',       // Glass card
    bgCardSolid: 'rgba(15, 23, 42, 0.95)', // Solid fallback for mobile
    bgInput: 'rgba(255, 255, 255, 0.05)',
    bgInputHover: 'rgba(255, 255, 255, 0.08)',

    // Borders
    borderGlass: 'rgba(255, 255, 255, 0.1)',
    borderGlassHover: 'rgba(255, 255, 255, 0.2)',
    borderFocus: '#4F46E5',

    // Text
    textPrimary: '#F8FAFC',   // slate-50
    textSecondary: '#94A3B8', // slate-400
    textMuted: '#64748B',     // slate-500
    textDisabled: '#475569',  // slate-600

    // Status Dots
    statusHealthy: '#22C55E',
    statusWarning: '#F59E0B',
    statusCritical: '#EF4444',
    statusOffline: '#6B7280',

    // Orbs (background decoration)
    orbPrimary: 'rgba(79, 70, 229, 0.25)',
    orbViolet: 'rgba(124, 58, 237, 0.2)',
    orbAccent: 'rgba(45, 212, 191, 0.15)',
};

export const NEBULA_LIGHT = {
    // Primary (same hue, adjusted for light mode)
    primary: '#4F46E5',
    primaryEnd: '#7C3AED',
    primaryHover: '#4338CA',

    // Accent
    accent: '#0D9488',
    accentHover: '#0F766E',

    // Warning
    warning: '#D97706',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    warningBorder: 'rgba(245, 158, 11, 0.3)',

    // Error
    error: '#DC2626',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    errorBorder: 'rgba(239, 68, 68, 0.2)',
    errorText: '#B91C1C',

    // Backgrounds (Frost aesthetic)
    bgDeep: '#F0F9FF',           // sky-50
    bgGradientEnd: '#DBEAFE',    // blue-100
    bgCard: 'rgba(255, 255, 255, 0.8)',
    bgCardSolid: 'rgba(255, 255, 255, 0.95)',
    bgInput: 'rgba(0, 0, 0, 0.03)',
    bgInputHover: 'rgba(0, 0, 0, 0.05)',

    // Borders
    borderGlass: 'rgba(0, 0, 0, 0.08)',
    borderGlassHover: 'rgba(0, 0, 0, 0.12)',
    borderFocus: '#4F46E5',

    // Text
    textPrimary: '#0F172A',   // slate-900
    textSecondary: '#475569', // slate-600
    textMuted: '#64748B',     // slate-500
    textDisabled: '#94A3B8',  // slate-400

    // Status Dots
    statusHealthy: '#16A34A',
    statusWarning: '#D97706',
    statusCritical: '#DC2626',
    statusOffline: '#9CA3AF',

    // Orbs
    orbPrimary: 'rgba(79, 70, 229, 0.08)',
    orbViolet: 'rgba(124, 58, 237, 0.06)',
    orbAccent: 'rgba(45, 212, 191, 0.08)',
};

export type NebulaTheme = typeof NEBULA_DARK;

// Utility to get current theme
export const getNebulaTheme = (isDark: boolean): NebulaTheme =>
    isDark ? NEBULA_DARK : NEBULA_LIGHT;

// CSS class helpers for Tailwind
export const NEBULA_CLASSES = {
    // Glass card
    glassCard: 'backdrop-blur-xl border rounded-2xl',
    glassCardDark: 'bg-slate-900/60 border-white/10',
    glassCardLight: 'bg-white/80 border-black/5',

    // Solid card (mobile performance)
    solidCard: 'border rounded-2xl',
    solidCardDark: 'bg-slate-900/95 border-white/10',
    solidCardLight: 'bg-white/95 border-black/5',

    // Inputs
    inputBase: 'w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none',
    inputDark: 'bg-white/5 border-white/10 text-slate-50 placeholder:text-slate-500 focus:border-indigo-500',
    inputLight: 'bg-black/3 border-black/10 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500',

    // Buttons
    buttonPrimary: 'px-4 py-2 rounded-lg font-medium transition-all',
    buttonDanger: 'bg-red-600 hover:bg-red-700 text-white',
    buttonGhost: 'bg-transparent hover:bg-white/10 text-slate-300',
};
