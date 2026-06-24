
import { MediaItem, MediaType } from './types';
import { processMediaItem } from './lib/utils';

// --- SITE CONFIGURATION ---
export const APP_CONFIG = {
  name: 'WXI',
  nameSuffix: 'FU',
  subtitle: 'Neural Art & Motion Visuals',
  itemsPerPage: 24,
  hero: {
    badge: 'v3.5 NEURAL',
    description: 'The definitive stage for high-fidelity anime artwork and immersive motion edits. Explore, collect, and connect with elite creators.',
    tags: ['Neural Art', '4K AMVs', 'Motion Visuals', 'Elite Assets', 'UHD Illustrations']
  },
  footer: {
    brand: 'WXIFU',
    tagline: 'The Aesthetic Frontier',
    disclaimer: 'All content belongs to their respective artists.'
  },
  social: {
    twitter: 'https://x.com/wxifu',
    reddit: 'https://www.reddit.com/r/wxifu/',
    telegram: 'https://t.me/wxifu'
  }
};

/**
 * --- STATIC GALLERY DATA ---
 * TO ADD GOOGLE DRIVE CONTENT:
 * 1. Go to Google Drive, right-click your file -> Share -> Copy Link.
 * 2. Ensure "Anyone with the link" can view.
 * 3. Paste the link into the 'link' property below.
 */
const CUSTOM_MEDIA_COLLECTION: any[] = [];

// Pre-process items using the utility (handles Google Drive ID extraction)
const processedCustomItems = CUSTOM_MEDIA_COLLECTION.map((item, index) => 
  processMediaItem(item, index)
);

export const fallbackPhotoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Photo
);

export const fallbackVideoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Video
);
