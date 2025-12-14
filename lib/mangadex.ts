
import { MediaItem, MediaType } from '../types';

const MANGADEX_API_URL = 'https://api.mangadex.org';
const COVER_URL_BASE = 'https://uploads.mangadex.org/covers';

// Helper to handle API requests
async function fetchMangaDex(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${MANGADEX_API_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
      if (Array.isArray(params[key])) {
          params[key].forEach((v: string) => url.searchParams.append(`${key}[]`, v));
      } else {
          url.searchParams.append(key, params[key]);
      }
  });

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`MangaDex API Error: ${response.statusText}`);
  return response.json();
}

/**
 * Fetches manga lists specifically filtering for adult content as requested
 */
export const fetchMangaList = async (limit = 32, offset = 0): Promise<MediaItem[]> => {
  try {
    const data = await fetchMangaDex('/manga', {
      limit,
      offset,
      // 'erotica' and 'pornographic' for adult arts section
      contentRating: ['erotica', 'pornographic'], 
      includes: ['cover_art', 'author'],
      order: { followedCount: 'desc' } // Popular stuff
    });

    return data.data.map((manga: any) => {
      const coverRel = manga.relationships.find((r: any) => r.type === 'cover_art');
      const authorRel = manga.relationships.find((r: any) => r.type === 'author');
      
      const fileName = coverRel?.attributes?.fileName;
      const coverUrl = fileName 
        ? `${COVER_URL_BASE}/${manga.id}/${fileName}.256.jpg` // Use 256px thumbnail for grid
        : 'https://via.placeholder.com/300x450?text=No+Cover';

      const title = Object.values(manga.attributes.title)[0] as string;
      const description = manga.attributes.description.en || Object.values(manga.attributes.description)[0] || '';

      return {
        id: `manga-${manga.id}`, // Internal App ID
        externalId: manga.id,    // Real API ID
        type: MediaType.Manga,
        src: coverUrl,
        description: title,
        category: 'Manga / Doujin',
        tags: manga.attributes.tags.map((t: any) => t.attributes.name.en).slice(0, 5),
        user_id: 'mangadex-api',
        author: authorRel?.attributes?.name || 'Unknown Artist',
        is_premium: false,
      };
    });
  } catch (error) {
    console.error("Failed to fetch manga:", error);
    return [];
  }
};

/**
 * Fetches chapters for a specific manga
 */
export const fetchMangaChapters = async (mangaId: string) => {
    try {
        const data = await fetchMangaDex(`/manga/${mangaId}/feed`, {
            translatedLanguage: ['en'],
            order: { chapter: 'asc' },
            limit: 100,
            includes: ['scanlation_group']
        });
        return data.data;
    } catch (e) {
        console.error(e);
        return [];
    }
};

/**
 * Fetches the actual image URLs for a chapter
 */
export const fetchChapterPages = async (chapterId: string) => {
    try {
        const data = await fetchMangaDex(`/at-home/server/${chapterId}`);
        const baseUrl = data.baseUrl;
        const hash = data.chapter.hash;
        const files = data.chapter.data; // High quality
        // const filesSaver = data.chapter.dataSaver; // Low quality

        return files.map((file: string) => `${baseUrl}/data/${hash}/${file}`);
    } catch (e) {
        console.error(e);
        return [];
    }
};
