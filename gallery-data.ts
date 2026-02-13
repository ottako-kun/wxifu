
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
 * To add Google Drive content:
 * 1. Set type to 'PHOTO' or 'VIDEO'
 * 2. Paste the "Share" link into the 'link' property.
 * 3. Add a thumbnail if it's a video (use a direct image link or another Drive link).
 */
const CUSTOM_MEDIA_COLLECTION: any[] = [
  {
    type: 'PHOTO',
    link: 'https://drive.google.com/file/d/1X5l_9o5-rN_XmYk_w2O-A5p7vP1Z9N5S/view', // Sample Drive ID
    description: 'Cyberpunk Oni - Ultra Detailed Illustration. Exploring the synthesis of traditional Japanese folklore and futuristic neon aesthetics.',
    category: 'Illustration',
    author: 'NeuralRonin',
    tags: ['Cyberpunk', 'Oni', '4K', 'Character'],
    is_premium: false
  },
  {
    type: 'VIDEO',
    link: 'https://drive.google.com/file/d/1sILwvb70QBKknRuhk0fJLwnO7kmdEywQ/view',
    thumbnail: 'https://images.unsplash.com/photo-1614728263952-84ea206f99b6?q=80&w=1974&auto=format&fit=crop',
    description: 'Neon Dreams AMV - High Energy Edit. A synchronized visual journey through Neo-Tokyo nightlife.',
    category: 'AMV',
    author: 'VibeEditor',
    tags: ['AMV', 'Action', 'Edit', 'Hype'],
    is_premium: true,
    price: 15
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1974&auto=format&fit=crop',
    description: 'Midnight Samurai - Digital Painting. Fusing feudal Japan with modern digital techniques.',
    category: 'Fanart',
    author: 'RoninArt',
    tags: ['Samurai', 'Dark', 'Art', 'Traditional'],
    is_premium: false
  },
  {
    type: 'VIDEO',
    link: 'https://drive.google.com/file/d/1_9vL0yq4z8t-X7G2O_w-P5uK-L2oV1J/view',
    thumbnail: 'https://images.unsplash.com/photo-1620336655055-088d06e76fb0?q=80&w=1974&auto=format&fit=crop',
    description: 'Mecha Awakening - Motion Graphics. Procedural animation test for a larger cinematic project.',
    category: 'Motion',
    author: 'MechaDesigner',
    tags: ['Mecha', 'SciFi', 'Animation'],
    is_premium: false
  },
  {
     type: 'PHOTO',
     link: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1974&auto=format&fit=crop',
     description: 'Ethereal Forest - Background Art. Atmosphere and lighting study for an unannounced visual novel.',
     category: 'Background',
     author: 'SceneryMaster',
     tags: ['Nature', 'Peaceful', 'Anime', 'Scenery'],
     is_premium: true,
     price: 10
  }
];

// Pre-process static items using the utility
const processedCustomItems = CUSTOM_MEDIA_COLLECTION.map((item, index) => 
  processMediaItem(item, index)
);

export const fallbackPhotoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Photo
);

export const fallbackVideoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Video
);
