
import { useState, useEffect } from 'react';
import { fetchMangaChapters, fetchChapterPages } from '../lib/mangadex';

export type ViewMode = 'chapters' | 'reader';

export const useMangaReader = (externalId?: string) => {
  const [chapters, setChapters] = useState<any[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const [currentChapter, setCurrentChapter] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('chapters');

  // Fetch Chapters on Init
  useEffect(() => {
    if (!externalId) return;
    
    let mounted = true;
    const loadChapters = async () => {
      setIsLoading(true);
      const data = await fetchMangaChapters(externalId);
      if (mounted) {
          // Deduplicate chapters based on chapter number
          const uniqueChapters = data.filter((v: any, i: number, a: any[]) => 
            a.findIndex((t: any) => t.attributes.chapter === v.attributes.chapter) === i
          );
          setChapters(uniqueChapters);
          setIsLoading(false);
      }
    };
    loadChapters();
    
    return () => { mounted = false; };
  }, [externalId]);

  const loadChapter = async (chapter: any) => {
    setIsLoading(true);
    setCurrentChapter(chapter);
    const imageUrls = await fetchChapterPages(chapter.id);
    setPages(imageUrls);
    setViewMode('reader');
    setIsLoading(false);
  };

  const closeReader = () => {
    setViewMode('chapters');
    setPages([]);
    setCurrentChapter(null);
  };

  return {
      chapters,
      pages,
      currentChapter,
      isLoading,
      viewMode,
      loadChapter,
      closeReader
  };
};
