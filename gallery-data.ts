
import { MediaItem, MediaType } from './types';
import { processMediaItem } from './lib/utils';

// --- SITE CONFIGURATION ---
export const APP_CONFIG = {
  name: 'OTAKU',
  nameSuffix: '-X',
  subtitle: 'The Premier Anime & Art Gallery',
  itemsPerPage: 24,
  hero: {
    badge: 'v2.5 PREVIEW',
    description: 'The definitive social playground for anime aesthetics. Explore high-quality 4K artwork, AMVs, and exclusive creator content.',
    tags: ['4K Illustrations', 'AMVs', 'Cosplay', 'Premium Assets']
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

// --- STATIC GALLERY DATA ---
// You can add your Google Drive or Hypnotube links here.
const CUSTOM_MEDIA_COLLECTION: any[] = [
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1974&auto=format&fit=crop',
    description: 'Cyberpunk Streets - Neon Rain Illustration',
    category: 'Illustration',
    author: 'NeoArtist',
    tags: ['Cyberpunk', 'Neon', '4K'],
    is_premium: false
  },
  {
    type: 'VIDEO',
    link: 'https://hypnotube.com/video/neon-dreams-amv-86718.html',
    thumbnail: 'https://images.unsplash.com/photo-1614728263952-84ea206f99b6?q=80&w=1974&auto=format&fit=crop',
    description: 'Neon Dreams AMV - High Energy Edit',
    category: 'AMV',
    author: 'VibeEditor',
    tags: ['AMV', 'Action', 'Edit'],
    is_premium: true,
    price: 15
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1974&auto=format&fit=crop',
    description: 'Midnight Samurai - Traditional Style Digitized',
    category: 'Fanart',
    author: 'RoninArt',
    tags: ['Samurai', 'Dark', 'Art'],
    is_premium: false
  },
  {
     type: 'PHOTO',
     link: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1974&auto=format&fit=crop',
     description: 'Ethereal Forest - Anime Scenery Background',
     category: 'Background',
     author: 'SceneryMaster',
     tags: ['Nature', 'Peaceful', 'Anime'],
     is_premium: true,
     price: 10
  }
];

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
