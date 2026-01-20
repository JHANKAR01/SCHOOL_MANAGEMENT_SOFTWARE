
/**
 * Sovereign Enterprise Design System
 * A centralized theme engine for High-Scale School ERPs.
 */

// Global Layout Constants
export const LAYOUT = {
  SIDEBAR_WIDTH: 'w-72', // Expanded for better typography
  HEADER_HEIGHT: 'h-16',
  MAX_WIDTH: 'max-w-7xl',
};

// Glassmorphism & Surface Styles
export const SURFACES = {
  // The "Glass" Effect (High-End)
  glass: "bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl",
  
  // The "Solid" Effect (Lite Mode / Accessibility)
  solid: "bg-white border border-gray-200 shadow-sm",
  
  // Panel Backgrounds
  panel: "bg-gray-50/50",
};

// Typography Hierarchy
export const TYPOGRAPHY = {
  h1: "text-2xl font-bold tracking-tight text-gray-900",
  h2: "text-lg font-semibold tracking-tight text-gray-800",
  h3: "text-sm font-bold uppercase tracking-wider text-gray-500",
  body: "text-sm text-gray-600 leading-relaxed",
  mono: "font-mono text-xs text-gray-500",
};

// Interactive Elements
export const INTERACTIVE = {
  button: {
    base: "flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1",
    primary: "text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100/50",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  },
  input: "block w-full rounded-lg border-gray-300 bg-white/50 focus:bg-white transition-colors shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5",
};

// Status Indicators
export const STATUS = {
  success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border border-amber-200",
  error: "bg-rose-100 text-rose-800 border border-rose-200",
  neutral: "bg-slate-100 text-slate-700 border border-slate-200",
};

/**
 * Returns the correct class string based on Low Data Mode
 */
export const getSurface = (isLowData: boolean) => {
  return isLowData ? SURFACES.solid : SURFACES.glass;
};
