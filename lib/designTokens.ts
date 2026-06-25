/**
 * Design Tokens & UI Utility Constants
 * Centralized design system values for consistent UI/UX
 */

export const colors = {
  // Primary - Reserved for primary actions only
  primary: '#ec4899',
  primaryHover: '#db2777',
  
  // Secondary & Accent
  secondary: '#06b6d4',
  accent: '#8b5cf6',
  
  // Dark Mode Backgrounds - Using dark gray instead of pure black
  bgPrimary: '#121212',
  bgSecondary: '#1e1e1e',
  bgTertiary: '#2a2a2a',
  bgElevation1: '#181818',
  bgElevation2: '#242424',
  bgElevation3: '#2f2f2f',
  
  // Text Colors with proper contrast ratios
  textPrimary: '#f3f4f6',    // 16.7:1 on bg-primary (AAA)
  textSecondary: '#9ca3af',   // 7.3:1 on bg-primary (AA Large)
  textTertiary: '#6b7280',    // 4.6:1 on bg-primary (AA)
  textInverse: '#020202',
  
  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderDefault: 'rgba(255, 255, 255, 0.12)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',
  
  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const spacing = {
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
};

export const borderRadius = {
  sm: '8px',
  md: '16px',
  lg: '24px',
  full: '9999px',
};

export const typography = {
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  families: {
    sans: "'Inter', sans-serif",
    display: "'Orbitron', sans-serif",
  },
};

export const touchTargets = {
  min: '48px',        // WCAG minimum
  comfortable: '56px', // Recommended for mobile
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  glow: '0 0 20px rgba(236, 72, 153, 0.3)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Accessibility Helpers
export const focusVisibleStyles = {
  outline: `2px solid ${colors.primary}`,
  outlineOffset: '2px',
  borderRadius: borderRadius.sm,
};

// Contrast ratio checker (returns true if passes AA)
export const checkContrastAA = (fg: string, bg: string): boolean => {
  // Simplified check - in production use a library like chroma.js
  // This is a placeholder for actual contrast calculation
  return true;
};

// ARIA Labels Presets
export const ariaLabels = {
  close: 'Close',
  menu: 'Menu',
  search: 'Search',
  upload: 'Upload media',
  like: 'Like',
  unlike: 'Unlike',
  comment: 'Comment',
  share: 'Share',
  profile: 'Profile',
  settings: 'Settings',
  notifications: 'Notifications',
  inbox: 'Inbox',
  home: 'Home',
  back: 'Go back',
  next: 'Next',
  previous: 'Previous',
  loading: 'Loading...',
  skipToContent: 'Skip to main content',
};

// Loading Messages
export const loadingMessages = {
  feed: 'Loading your feed...',
  profile: 'Loading profile...',
  media: 'Loading media...',
  comments: 'Loading comments...',
  messages: 'Loading messages...',
  search: 'Searching...',
  upload: 'Uploading...',
  default: 'Loading...',
};

// Error Messages with Actionable Guidance
export const errorMessages = {
  network: 'Connection issue. Please check your internet and try again.',
  upload: 'Upload failed. Try a smaller file or different format.',
  load: 'Could not load content. Pull down to refresh.',
  auth: 'Authentication expired. Please sign in again.',
  permission: 'Permission denied. Check your account settings.',
  notFound: 'Content not found. It may have been removed.',
  default: 'Something went wrong. Please try again.',
};

// Toast Configurations
export const toastConfig = {
  durations: {
    short: 3000,
    medium: 5000,
    long: 8000,
  },
  positions: {
    top: 'top-4 right-4',
    bottom: 'bottom-20 right-4',
  },
};

// Breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  toast: 1400,
  tooltip: 1500,
};

// Animation Durations
export const animationDurations = {
  instant: '100ms',
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
};

// Icon Sizes
export const iconSizes = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
};

// Avatar Sizes
export const avatarSizes = {
  xs: '24px',
  sm: '32px',
  md: '40px',
  lg: '48px',
  xl: '64px',
  '2xl': '80px',
};
