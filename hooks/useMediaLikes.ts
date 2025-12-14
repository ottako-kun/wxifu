
import { useState, useEffect } from 'react';
import { getLikeCount, checkUserLiked, toggleLike as dbToggleLike } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';

export const useMediaLikes = (mediaId: string, userId: string | undefined, isStatic: boolean) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isStatic) return;

    let mounted = true;

    const fetchLikes = async () => {
      const { count } = await getLikeCount(mediaId);
      if (mounted) setLikeCount(count);

      if (userId) {
        const { isLiked } = await checkUserLiked(mediaId, userId);
        if (mounted) setIsLiked(isLiked);
      }
    };

    fetchLikes();

    return () => {
      mounted = false;
    };
  }, [mediaId, userId, isStatic]);

  const toggleLike = async () => {
    if (isStatic) return;

    if (!userId) {
      toast.info("Please sign in to like posts!");
      return false;
    }

    const previousIsLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic UI Update
    const shouldLike = !previousIsLiked;
    setIsLiked(shouldLike);
    setLikeCount(prev => shouldLike ? prev + 1 : prev - 1);

    const { liked, error } = await dbToggleLike(mediaId, userId);

    if (error) {
      // Revert if failed
      setIsLiked(previousIsLiked);
      setLikeCount(previousCount);
      toast.error("Failed to update like");
      return false;
    } else {
      setIsLiked(liked);
      return true;
    }
  };

  return {
      likeCount,
      isLiked,
      toggleLike
  };
};
