import { useState, useMemo, useEffect } from 'react';
import { MediaItem, MediaType } from '../types';
import { APP_CONFIG } from '../gallery-data';

export const useGalleryFilters = (items: MediaItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc'>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(APP_CONFIG.itemsPerPage);

  // Derive available categories/tags from the dataset
  const availableCategories = useMemo(() => {
    return ['All', 'GIFs', 'Photos', 'Videos'];
  }, []);

  const availableTags = useMemo(() => {
    const tags = new Set(items.flatMap(item => item.tags || []));
    return Array.from(tags);
  }, [items]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(APP_CONFIG.itemsPerPage);
  }, [searchQuery, selectedCategory, selectedTags]);

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
        if (selectedCategory === 'Photos') {
          matchesCategory = item.type === MediaType.Photo && !item.src.toLowerCase().includes('.gif');
        } else if (selectedCategory === 'Videos') {
          matchesCategory = item.type === MediaType.Video;
        } else if (selectedCategory === 'GIFs') {
          matchesCategory = item.src.toLowerCase().includes('.gif');
        }
      }
      
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => item.tags?.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [items, searchQuery, selectedCategory, selectedTags]);

  const sortedItems = useMemo(() => {
    if (sortOrder === 'asc') {
      return [...filteredItems].sort((a, b) => 
        (a.description || '').localeCompare(b.description || '')
      );
    }
    return filteredItems;
  }, [filteredItems, sortOrder]);

  const visibleItems = useMemo(() => {
    return sortedItems.slice(0, visibleCount);
  }, [sortedItems, visibleCount]);

  const loadMore = () => setVisibleCount(prev => prev + APP_CONFIG.itemsPerPage);
  const toggleSort = () => setSortOrder(prev => (prev === 'asc' ? 'default' : 'asc'));
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTags([]);
    setSortOrder('default');
    setVisibleCount(APP_CONFIG.itemsPerPage);
  };

  return {
    searchQuery, setSearchQuery,
    sortOrder, toggleSort,
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