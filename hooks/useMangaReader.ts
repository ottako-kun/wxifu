
import { useState } from 'react';

export type ViewMode = 'chapters' | 'reader';

export const useMangaReader = (externalId?: string) => {
  const [chapters] = useState<any[]>([]);
  const [pages] = useState<string[]>([]);
  const [currentChapter] = useState<any | null>(null);
  const [isLoading] = useState(false);
  const [viewMode] = useState<ViewMode>('chapters');

  const loadChapter = async (chapter: any) => {};
  const closeReader = () => {};

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
