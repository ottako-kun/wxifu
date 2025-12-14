
import { supabase } from '../client';

export const insertMediaItem = async (item: {
  type: string;
  src: string;
  description: string;
  category: string;
  tags: string[];
  user_id?: string;
  author?: string;
  author_avatar?: string;
  is_premium?: boolean;
  price?: number;
}) => {
  const { data, error } = await supabase.from('media').insert([item]).select();

  if (error) {
    const isColumnMissing = error.message.includes('column') || error.code === 'PGRST204';
    
    if (isColumnMissing) {
       console.warn("Database schema mismatch detected. Attempting fallback insert...");
       if (error.message.includes('author')) {
           const { author, author_avatar, ...restWithoutAuthor } = item;
           const retry1 = await supabase.from('media').insert([restWithoutAuthor]).select();
           if (retry1.error && retry1.error.message.includes('user_id')) {
               const { user_id, ...restNoUser } = restWithoutAuthor;
               return await supabase.from('media').insert([restNoUser]).select();
           }
           return retry1;
       }
       if (error.message.includes('user_id')) {
           const { user_id, ...rest } = item;
           const retry1 = await supabase.from('media').insert([rest]).select();
           if (retry1.error && retry1.error.message.includes('tags')) {
               const { tags, ...rest2 } = rest;
               return await supabase.from('media').insert([rest2]).select();
           }
           return retry1;
       }
       if (error.message.includes('tags')) {
           const { tags, ...rest } = item;
           return await supabase.from('media').insert([rest]).select();
       }
    }
  }

  return { data, error };
};

export const deleteMediaItem = async (id: string) => {
  return await supabase.from('media').delete().eq('id', id);
};

export const updateMediaItem = async (id: string, updates: { description?: string; category?: string; tags?: string[] }) => {
  return await supabase.from('media').update(updates).eq('id', id);
};

export const getFollowedMedia = async (userId: string) => {
    const { data: follows, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);
    
    if (followError || !follows) return { data: [], error: followError };
    
    const followingIds = follows.map(f => f.following_id);
    
    if (followingIds.length === 0) return { data: [], error: null };

    const { data, error } = await supabase
        .from('media')
        .select('*, profiles(name, avatar)')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false });
        
    return { data, error };
};
