
import { useMemo } from 'react';
import { MediaItem } from '../types';

export const useRelatedMedia = (currentItem: MediaItem, allItems: MediaItem[]) => {
  return useMemo(() => {
    // 1. Filter items excluding current
    const candidates = allItems.filter(i => i.id !== currentItem.id);
    
    // 2. Score them
    const scored = candidates.map(c => {
        let score = 0;
        if (c.category === currentItem.category) score += 2;
        if (c.user_id === currentItem.user_id) score += 1;
        const sharedTags = c.tags?.filter(t => currentItem.tags?.includes(t)).length || 0;
        score += sharedTags * 2;
        return { item: c, score };
    });

    // 3. Sort by score and take top 6
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(s => s.item);
  }, [currentItem, allItems]);
};
