
import { useState, useEffect } from 'react';
import { getLikeCount, checkUserLiked, toggleLike as dbToggleLike } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';

export const useMediaLikes = (mediaId: string, userId: string | undefined, isStatic: boolean) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;

    const fetchLikes = async () => {
      // STATIC MEDIA HANDLING (LocalStorage)
      if (isStatic) {
        const localStatus = localStorage.getItem(`like_status_${mediaId}`);
        const localCount = localStorage.getItem(`like_count_${mediaId}`);
        
        if (mounted) {
            setIsLiked(localStatus === 'true');
            // If no count exists, generate a consistent fake number based on ID length or random fallback
            const defaultCount = localCount ? parseInt(localCount) : (mediaId.length * 2) + 5; 
            setLikeCount(defaultCount);
        }
        return;
      }

      // DATABASE MEDIA HANDLING
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
    // STATIC MEDIA TOGGLE
    if (isStatic) {
        const newLikedState = !isLiked;
        const newCount = likeCount + (newLikedState ? 1 : -1);
        
        setIsLiked(newLikedState);
        setLikeCount(newCount);
        
        localStorage.setItem(`like_status_${mediaId}`, String(newLikedState));
        localStorage.setItem(`like_count_${mediaId}`, String(newCount));
        return true;
    }

    // DATABASE MEDIA TOGGLE
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
