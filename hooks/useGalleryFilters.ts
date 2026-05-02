import { useState, useMemo, useEffect } from 'react';
import { MediaItem, MediaType, SortOption } from '../types';
import { APP_CONFIG } from '../gallery-data';
import { useUI } from '../context/UIContext';

export const useGalleryFilters = (items: MediaItem[]) => {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useUI();
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Trending);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(APP_CONFIG.itemsPerPage);

  // Derive available categories from the dataset
  const availableCategories = useMemo(() => {
    return ['All', 'GIFs', 'Images', 'Videos', 'Creators', 'Niches'];
  }, []);

  const availableTags = useMemo(() => {
    const tags = new Set(items.flatMap(item => item.tags || []));
    return Array.from(tags);
  }, [items]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(APP_CONFIG.itemsPerPage);
  }, [searchQuery, selectedCategory, selectedTags, sortOption]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      const inDescription = item.description?.toLowerCase().includes(query) ?? false;
      const inCategory = item.category?.toLowerCase().includes(query) ?? false;
      const inTags = item.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false;
      const inAuthor = item.author?.toLowerCase().includes(query) ?? false;
      
      const matchesSearch = query === '' || inDescription || inCategory || inTags || inAuthor;
      
      let matchesCategory = true;
      if (selectedCategory !== 'All') {
        const cat = selectedCategory.toLowerCase();
        if (cat === 'images' || cat === 'photos') {
          matchesCategory = item.type === MediaType.Photo && !item.src.toLowerCase().includes('.gif');
        } else if (cat === 'videos') {
          matchesCategory = item.type === MediaType.Video;
        } else if (cat === 'gifs') {
          matchesCategory = item.src.toLowerCase().includes('.gif');
        } else if (cat === 'creators' || cat === 'niches') {
            // These would normally be handled by a different rendering mode in HomeView
            matchesCategory = true; 
        }
      }
      
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => item.tags?.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [items, searchQuery, selectedCategory, selectedTags]);

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    
    switch (sortOption) {
      case SortOption.Trending:
        // Trending = Higher likes/views ratio or recently popular (mocking with likes)
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case SortOption.Views:
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case SortOption.Latest:
        return sorted.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });
      case SortOption.Week:
        // Mocking week: Filter then sort by likes (in real app, we'd filter by timestamp first)
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case SortOption.Month:
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return sorted;
    }
  }, [filteredItems, sortOption]);

  const visibleItems = useMemo(() => {
    return sortedItems.slice(0, visibleCount);
  }, [sortedItems, visibleCount]);

  const loadMore = () => setVisibleCount(prev => prev + APP_CONFIG.itemsPerPage);
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTags([]);
    setSortOption(SortOption.Trending);
    setVisibleCount(APP_CONFIG.itemsPerPage);
  };

  return {
    searchQuery, setSearchQuery,
    sortOption, setSortOption,
    selectedCategory, setSelectedCategory,
    selectedTags, toggleTag,
    visibleCount, loadMore,
    clearFilters,
    availableCategories,
    availableTags,
    filteredItems,
    sortedItems,
    visibleItems,
  };
};
