
import { supabase, gasRequest } from '../client';

export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({ provider: 'google' });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const updateUserProfile = async (updates: { full_name?: string; bio?: string; avatar_url?: string }) => {
  const authUpdate = await supabase.auth.updateUser({ data: updates });
  if (authUpdate.error) return authUpdate;

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
      await gasRequest('UPSERT_PROFILE', {
          id: user.id,
          name: updates.full_name,
          avatar: updates.avatar_url,
          bio: updates.bio,
          updated_at: new Date().toISOString()
      });
  }

  return authUpdate;
};
