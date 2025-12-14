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
 * - user_id: uuid (foreign key to auth.users)
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

export const updateUserProfile = async (updates: { full_name?: string; bio?: string }) => {
  return await supabase.auth.updateUser({
    data: updates
  });
};

export const insertMediaItem = async (item: {
  type: string;
  src: string;
  description: string;
  category: string;
  tags: string[];
  user_id?: string;
}) => {
  return await supabase.from('media').insert([item]);
};