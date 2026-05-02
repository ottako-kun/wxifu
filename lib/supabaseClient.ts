/**
 * WXIFU API BRIDGE
 * This file acts as a compatibility layer, re-exporting GAS-backed modules
 * to maintain existing component imports without massive refactoring.
 */

// Re-export the GAS client instance
export { supabase } from './client';

// Re-export GAS-refactored services
export * from './modules/auth';
export * from './modules/media';
export * from './modules/social';