
// Re-export the client instance from the base file
export { supabase } from './client';

// Re-export services
export * from './modules/auth';
export * from './modules/media';
export * from './modules/social';
export * from './modules/economy';
