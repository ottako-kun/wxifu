
import { MediaItem, MediaType } from './types';
import { processMediaItem } from './lib/utils';

// --- SITE CONFIGURATION ---
export const APP_CONFIG = {
  name: 'OTAKU',
  nameSuffix: '-X',
  subtitle: 'The Premier Anime & Art Gallery',
  itemsPerPage: 24,
  hero: {
    badge: 'Curated Collection',
    description: 'The definitive social playground for anime aesthetics, digital artists, and the otaku elite. Explore high-quality artwork and AMVs directly from the cloud.',
    tags: ['Anime Art', 'AMVs', 'Cosplay', 'Wallpapers']
  },
  footer: {
    brand: 'OTAKU-X',
    tagline: 'Celebrating Otaku Culture',
    disclaimer: 'All content belongs to their respective artists.'
  },
  social: {
    twitter: 'https://x.com/ottakokun',
    reddit: 'https://www.reddit.com/r/OTTAKOKUN/',
    telegram: 'https://t.me/OTTAKOKUN'
  }
};

// --- STATIC FALLBACK DATA ---
// Since we are using Supabase to store data, this collection is left empty.
// If you want to add hardcoded items that appear regardless of the database connection, add them here.
const CUSTOM_MEDIA_COLLECTION: any[] = [];

// Pre-process static items for the hooks to use
const processedCustomItems = CUSTOM_MEDIA_COLLECTION.map((item, index) => 
  processMediaItem(item, index)
);

export const fallbackPhotoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Photo
);

export const fallbackVideoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Video
);
