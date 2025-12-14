
import { useState, useEffect } from 'react';
import { getFollowStatus, followUser, unfollowUser } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';

export const useFollow = (currentUserId: string | undefined, targetUserId: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutual, setIsMutual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (currentUserId && currentUserId !== targetUserId && targetUserId && !targetUserId.startsWith('static')) {
        const checkStatus = async () => {
            setIsLoading(true);
            const status = await getFollowStatus(currentUserId, targetUserId);
            setIsFollowing(status.isFollowing);
            setIsMutual(status.isMutual);
            setIsLoading(false);
        };
        checkStatus();
    }
  }, [currentUserId, targetUserId]);

  const toggleFollow = async (targetName: string) => {
      if (!currentUserId) {
          toast.error("Please sign in to follow users.");
          return false;
      }
      
      setIsLoading(true);
      try {
          if (isFollowing) {
              await unfollowUser(currentUserId, targetUserId);
              setIsFollowing(false);
              setIsMutual(false);
              toast.success(`Unfollowed ${targetName}`);
          } else {
              await followUser(currentUserId, targetUserId);
              setIsFollowing(true);
              // Re-check mutual status
              const status = await getFollowStatus(currentUserId, targetUserId);
              setIsMutual(status.isMutual);
              toast.success(`Following ${targetName}`);
          }
          return true;
      } catch (err) {
          console.error("Follow action failed", err);
          toast.error("Failed to update follow status");
          return false;
      } finally {
          setIsLoading(false);
      }
  };

  return {
      isFollowing,
      isMutual,
      isLoading,
      toggleFollow
  };
};
