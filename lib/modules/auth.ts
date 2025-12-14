
import { supabase } from '../client';

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
  // 1. Update Auth User Metadata
  const authUpdate = await supabase.auth.updateUser({
    data: updates
  });
  
  if (authUpdate.error) return authUpdate;

  // 2. Update Public Profiles Table
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
          return { data: authUpdate.data, error };
      }
  }

  return authUpdate;
};
