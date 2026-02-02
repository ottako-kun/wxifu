import { MediaItem, MediaType } from './types';
import { processMediaItem } from './lib/utils';

// --- SITE CONFIGURATION ---
export const APP_CONFIG = {
  name: 'WXI',
  nameSuffix: 'FU',
  subtitle: 'Immersive Anime & Digital Art',
  itemsPerPage: 24,
  hero: {
    badge: 'v3.0 NEURAL',
    description: 'The definitive social stage for anime aesthetics. Explore high-fidelity illustrations, immersive AMVs, and exclusive content.',
    tags: ['Neural Art', 'AMVs', 'Motion Visuals', 'Elite Assets']
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

// --- STATIC GALLERY DATA ---
const CUSTOM_MEDIA_COLLECTION: any[] = [
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1974&auto=format&fit=crop',
    description: 'Cyberpunk Streets - Neon Rain Illustration. A deep dive into the rainy nights of Neo-Tokyo.',
    category: 'Illustration',
    author: 'NeoArtist',
    tags: ['Cyberpunk', 'Neon', '4K', 'Environment'],
    is_premium: false
  },
  {
    type: 'VIDEO',
    link: 'https://drive.google.com/file/d/1sILwvb70QBKknRuhk0fJLwnO7kmdEywQ/view',
    thumbnail: 'https://images.unsplash.com/photo-1614728263952-84ea206f99b6?q=80&w=1974&auto=format&fit=crop',
    description: 'Neon Dreams AMV - High Energy Edit. The best of this season compressed into 30 seconds of pure hype.',
    category: 'AMV',
    author: 'VibeEditor',
    tags: ['AMV', 'Action', 'Edit', 'Hype'],
    is_premium: true,
    price: 15
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1974&auto=format&fit=crop',
    description: 'Midnight Samurai - Traditional Style Digitized. Fusing feudal Japan with modern digital painting techniques.',
    category: 'Fanart',
    author: 'RoninArt',
    tags: ['Samurai', 'Dark', 'Art', 'Traditional'],
    is_premium: false
  },
  {
     type: 'PHOTO',
     link: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1974&auto=format&fit=crop',
     description: 'Ethereal Forest - Anime Scenery Background. Perfect for your next desktop setup.',
     category: 'Background',
     author: 'SceneryMaster',
     tags: ['Nature', 'Peaceful', 'Anime', 'Scenery'],
     is_premium: true,
     price: 10
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1620336655055-088d06e76fb0?q=80&w=1974&auto=format&fit=crop',
    description: 'Retro Future Mech - Detailed Concept Art',
    category: 'Concept',
    author: 'MechDesigner',
    tags: ['Mecha', 'SciFi', 'Concept'],
    is_premium: false
  },
  {
    type: 'VIDEO',
    link: 'https://drive.google.com/file/d/1sILwvb70QBKknRuhk0fJLwnO7kmdEywQ/view', // Reusing sample for demo
    thumbnail: 'https://images.unsplash.com/photo-1634157703702-3c124b455499?q=80&w=1974&auto=format&fit=crop',
    description: 'Aesthetic Lo-fi Loop - Relaxing Visuals',
    category: 'Animation',
    author: 'LoFiVibes',
    tags: ['LoFi', 'Relax', 'Animation'],
    is_premium: false
  }
];

// Pre-process static items
const processedCustomItems = CUSTOM_MEDIA_COLLECTION.map((item, index) => 
  processMediaItem(item, index)
);

export const fallbackPhotoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Photo
);

export const fallbackVideoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Video
);