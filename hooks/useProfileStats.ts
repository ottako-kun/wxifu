
import { useState, useEffect } from 'react';
import { supabase, getProfileStats } from '../lib/supabaseClient';

export const useProfileStats = (userId: string) => {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      const stats = await getProfileStats(userId);
      if (mounted) {
        setFollowersCount(stats.followers);
        setFollowingCount(stats.following);
        setLoading(false);
      }
    };

    fetchStats();

    // Realtime Subscription to update counts when someone follows/unfollows
    // Fixed: Mock client now supports properly chained channel definitions
    const channel = supabase
      .channel(`public:follows:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${userId}`,
        },
        () => {
          // If someone follows/unfollows THIS user, refresh followers count
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`,
        },
        () => {
          // If THIS user follows/unfollows someone, refresh following count
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Allow optimistic updates from the UI
  const incrementFollowers = () => setFollowersCount((prev) => prev + 1);
  const decrementFollowers = () => setFollowersCount((prev) => Math.max(0, prev - 1));

  return {
    followersCount,
    followingCount,
    loading,
    incrementFollowers,
    decrementFollowers
  };
};
