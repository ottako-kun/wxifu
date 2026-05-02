
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
const CUSTOM_MEDIA_COLLECTION: any[] = [
  {
    type: 'PHOTO',
    link: 'https://drive.google.com/file/d/121YszgbPGcwOJwsSwJgH0ROAe65-u8D0/view?usp=sharing', 
    description: 'Cyberpunk Oni - Neural Synthesis Study. High-resolution illustration exploring futuristic folklore.',
    category: 'Photos',
    author: 'NeuralRonin',
    tags: ['Illustration', 'Cyberpunk', 'Oni', '4K', 'Art'],
    views: 12500,
    likes: 450,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
  },
  {
    type: 'VIDEO',
    link: 'https://drive.google.com/file/d/1sILwvb70QBKknRuhk0fJLwnO7kmdEywQ/view',
    thumbnail: 'https://images.unsplash.com/photo-1614728263952-84ea206f99b6?q=80&w=1974&auto=format&fit=crop',
    description: 'Neon Dreams AMV - Dynamic Visual Edit. A synchronized journey through Neo-Tokyo.',
    category: 'Videos',
    author: 'VibeEditor',
    tags: ['AMV', 'Action', 'Edit', 'Hype'],
    views: 45000,
    likes: 2100,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
  },
  {
    type: 'PHOTO',
    link: 'https://pbs.twimg.com/media/HA_am5zbAAAE2y3?format=jpg&name=large',
    description: 'Midnight Samurai - Traditional vs Digital Synth.',
    category: 'Photos',
    author: 'RoninArt',
    tags: ['Fanart', 'Samurai', 'Dark', 'Art'],
    views: 8900,
    likes: 320,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    type: 'VIDEO',
    link: 'https://drive.google.com/file/d/1_9vL0yq4z8t-X7G2O_w-P5uK-L2oV1J/view',
    description: 'Mecha Awakening - Experimental Motion Graphics.',
    category: 'Videos',
    author: 'MechaDesigner',
    tags: ['Motion', 'Mecha', 'SciFi', 'Animation'],
    views: 67000,
    likes: 4500,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() // 15 days ago
  },
  {
     type: 'PHOTO',
     link: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1974&auto=format&fit=crop',
     description: 'Ethereal Forest - Background Concept Art.',
     category: 'Photos',
     author: 'SceneryMaster',
     tags: ['Background', 'Nature', 'Anime', 'Scenery'],
     views: 3200,
     likes: 120,
     created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() // 1 day ago
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHYyeHl4ZzR6NHR6NHR6NHR6NHR6NHR6NHR6NHR6NHR6NHR6NHR6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6x4jYlfa/giphy.gif',
    description: 'Glitch Distortion - Aesthetic Loop.',
    category: 'GIFs',
    author: 'GlitchArtist',
    tags: ['Glitch', 'Loop', 'Aesthetic'],
    views: 150000,
    likes: 8900,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() // 30 days ago
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eXh4ZzR6NHR6NHR6NHR6NHR6NHR6NHR6NHR6NHR6NHR6NHR6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxV3GlnRzY4/giphy.gif',
    description: 'Pixel Rain - Retro Aesthetic.',
    category: 'GIFs',
    author: 'RetroVibe',
    tags: ['Pixel', 'Rain', 'Retro'],
    views: 22000,
    likes: 1100,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
  }
];

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
