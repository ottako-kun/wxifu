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
 * - author: text (optional, denormalized username)
 * - author_avatar: text (optional, denormalized avatar url)
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

export const updateUserProfile = async (updates: { full_name?: string; bio?: string; avatar_url?: string }) => {
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
  author?: string;
  author_avatar?: string;
}) => {
  // Attempt 1: Try inserting with all fields
  const { data, error } = await supabase.from('media').insert([item]).select();

  if (error) {
    // Check if the error is due to missing columns (common if schema isn't updated)
    const isColumnMissing = error.message.includes('column') || error.code === 'PGRST204';
    
    if (isColumnMissing) {
       console.warn("Database schema mismatch detected. Attempting fallback insert...");

       // Fallback 1: Remove 'author' fields if they don't exist
       if (error.message.includes('author')) {
           const { author, author_avatar, ...restWithoutAuthor } = item;
           console.warn("Retrying upload without 'author' fields...");
           
           // Recursive retry without author fields
           // We'll call a simplified insert directly here to avoid infinite loops if it still fails differently
           const retry1 = await supabase.from('media').insert([restWithoutAuthor]).select();
           
           // If that failed due to something else (like user_id missing on table?), handle that
           if (retry1.error && retry1.error.message.includes('user_id')) {
               const { user_id, ...restNoUser } = restWithoutAuthor;
               return await supabase.from('media').insert([restNoUser]).select();
           }
           return retry1;
       }

       // Fallback 2: If 'user_id' is missing
       if (error.message.includes('user_id')) {
           const { user_id, ...rest } = item;
           console.warn("Retrying upload without 'user_id'...");
           const retry1 = await supabase.from('media').insert([rest]).select();
           
           // Fallback 2b: If 'tags' is ALSO missing
           if (retry1.error && retry1.error.message.includes('tags')) {
               console.warn("Retrying upload without 'tags'...");
               const { tags, ...rest2 } = rest;
               return await supabase.from('media').insert([rest2]).select();
           }
           return retry1;
       }

       // Fallback 3: If 'tags' is missing (but user_id was fine)
       if (error.message.includes('tags')) {
           console.warn("Retrying upload without 'tags'...");
           const { tags, ...rest } = item;
           return await supabase.from('media').insert([rest]).select();
       }
    }
  }

  return { data, error };
};