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

// Updated: This now updates the Public Profiles table as well as auth metadata
export const updateUserProfile = async (updates: { full_name?: string; bio?: string; avatar_url?: string }) => {
  // 1. Update Auth User Metadata (for session consistency)
  const authUpdate = await supabase.auth.updateUser({
    data: updates
  });
  
  if (authUpdate.error) return authUpdate;

  // 2. Update Public Profiles Table (for other users to see)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
      const { error } = await supabase
          .from('profiles')
          .upsert({
              id: user.id,
              name: updates.full_name,
              avatar: updates.avatar_url,
              bio: updates.bio,
              updated_at: new Date().toISOString()
          });
      
      if (error) {
          console.error("Failed to update public profile:", error);
          // Return this error so the UI knows something went wrong, 
          // even if auth update succeeded
          return { data: authUpdate.data, error };
      }
  }

  return authUpdate;
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

// --- MEDIA MANAGEMENT ---

export const deleteMediaItem = async (id: string) => {
  return await supabase.from('media').delete().eq('id', id);
};

export const updateMediaItem = async (id: string, updates: { description?: string; category?: string; tags?: string[] }) => {
  return await supabase.from('media').update(updates).eq('id', id);
};

// --- COMMENT FEATURES ---

export const getComments = async (mediaId: string) => {
  return await supabase
    .from('comments')
    .select('*')
    .eq('media_id', mediaId)
    .order('created_at', { ascending: true });
};

export const addComment = async (comment: {
  media_id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_avatar?: string;
}) => {
  return await supabase.from('comments').insert([comment]).select().single();
};

export const deleteComment = async (commentId: string) => {
  return await supabase.from('comments').delete().eq('id', commentId);
};

export const updateComment = async (commentId: string, content: string) => {
  return await supabase.from('comments').update({ content, updated_at: new Date().toISOString() }).eq('id', commentId);
};


// --- SOCIAL & MESSAGING FEATURES ---

export const getFollowStatus = async (currentUserId: string, targetUserId: string) => {
    // Check if I follow them
    const { data: iFollow } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single();
    
    // Check if they follow me
    const { data: theyFollow } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', targetUserId)
        .eq('following_id', currentUserId)
        .single();

    return {
        isFollowing: !!iFollow,
        isFollowedBy: !!theyFollow,
        isMutual: !!iFollow && !!theyFollow
    };
};

export const followUser = async (currentUserId: string, targetUserId: string) => {
    return await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: targetUserId
    });
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
    return await supabase.from('follows').delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
};

export const getMessages = async (user1: string, user2: string) => {
    return await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
        .order('created_at', { ascending: true });
};

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
    return await supabase.from('messages').insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content
    });
};

export const deleteMessage = async (msgId: string) => {
  return await supabase.from('messages').delete().eq('id', msgId);
};

export const updateMessage = async (msgId: string, content: string) => {
  return await supabase.from('messages').update({ content }).eq('id', msgId);
};

// Helper to fetch list of people the current user has chatted with
export const getInboxUsers = async (currentUserId: string) => {
    // 1. Get all messages where user is sender or receiver
    const { data: messages, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, created_at, content, is_read')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

    if (error || !messages) return [];

    // 2. Extract unique other user IDs
    const userMap = new Map();
    
    messages.forEach(msg => {
        const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        if (!userMap.has(otherId)) {
            userMap.set(otherId, {
                userId: otherId,
                lastMessage: msg.content,
                timestamp: msg.created_at,
                isRead: msg.is_read || (msg.sender_id === currentUserId) // Sent messages count as read
            });
        }
    });

    const uniqueUserIds = Array.from(userMap.keys());
    if (uniqueUserIds.length === 0) return [];

    // 3. Fetch profile details for these users (Requires 'profiles' view or accessing auth.users safely)
    // We try to use the 'profiles' view if it exists, otherwise fall back to placeholders
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .in('id', uniqueUserIds);

    // Merge profile data with message data
    return Array.from(userMap.values()).map(convo => {
        const profile = profiles?.find((p: any) => p.id === convo.userId);
        return {
            ...convo,
            name: profile?.name || 'Unknown User',
            avatar: profile?.avatar || null
        };
    });
};