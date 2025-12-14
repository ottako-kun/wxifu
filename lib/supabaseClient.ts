import { createClient } from '@supabase/supabase-js';

// Configuration provided by user
const SUPABASE_URL = 'https://jjzdzzejtxkbhygfaeqv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3ck9WMf7c1WyTiiUjTMnHg_8G-oQwpw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Expected Database Schema for table 'media':
 * 
 * - id: uuid or text (primary key)
 * - created_at: timestamp
 * - type: text ('PHOTO' or 'VIDEO')
 * - src: text (The Google Drive link or direct URL)
 * - description: text (optional)
 * - category: text (optional)
 * - tags: text[] (array of strings, optional)
 * - video_src: text (optional, for direct video file links if different from src)
 */

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) {
    console.error('Error signing in with Google:', error.message);
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
  }
};
