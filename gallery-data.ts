
import { MediaItem, MediaType } from './types';
import { processMediaItem } from './lib/utils';

// --- SITE CONFIGURATION ---
export const APP_CONFIG = {
  name: 'OTAKU',
  nameSuffix: '-X',
  subtitle: 'The Premier Adult Social Stage',
  itemsPerPage: 24,
  hero: {
    badge: 'Liberated Creative Sanctuary',
    description: 'The definitive social playground for adult models, digital artists, and the otaku elite. Share your assets freely in a space designed for uncensored expression.',
    tags: ['Uncensored Art', 'Cosplay Models', 'Exclusive Assets']
  },
  footer: {
    brand: 'OTAKU-X',
    tagline: 'Liberating Otaku Culture',
    disclaimer: 'Strictly for adults (18+). All models appearing on this site are 18 years or older.'
  },
  social: {
    twitter: 'https://x.com/ottakokun',
    reddit: 'https://www.reddit.com/r/OTTAKOKUN/',
    telegram: 'https://t.me/OTTAKOKUN'
  }
};

// --- YOUR GALLERY DATA ---
// INSTRUCTIONS FOR GOOGLE DRIVE:
// 1. Upload your image or video to Google Drive.
// 2. Right-click the file -> Share -> Copy Link (Ensure access is "Anyone with the link").
// 3. Paste the link into the 'link' field below.
// 4. For Videos: You can optionally provide a 'thumbnail' URL (e.g. from an image hosting site or another Drive file)

const CUSTOM_MEDIA_COLLECTION = [
  // --- TEMPLATE: GOOGLE DRIVE PHOTO ---
  // {
  //   type: 'PHOTO',
  //   link: 'https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing', 
  //   description: 'My Awesome Artwork',
  //   category: 'Illustration',
  //   tags: ['oc', 'digital', 'drive'],
  //   author: 'MyArtistName'
  // },

  // --- TEMPLATE: GOOGLE DRIVE VIDEO ---
  // {
  //   type: 'VIDEO',
  //   link: 'https://drive.google.com/file/d/YOUR_VIDEO_FILE_ID/view?usp=sharing',
  //   thumbnail: 'https://drive.google.com/file/d/YOUR_THUMBNAIL_FILE_ID/view?usp=sharing', // Optional
  //   description: 'My Animation',
  //   category: 'Clip',
  //   tags: ['animation', '3d'],
  //   author: 'MyAnimatorName'
  // },

  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/LpdlqTkgO2Lwwixwv7/giphy.gif',
    description: 'Neo Tokyo Rain',
    category: 'Scenery',
    tags: ['cyberpunk', 'rain'],
    author: 'NeonDrifter'
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    description: 'Shinjuku Nights',
    category: 'Photography',
    tags: ['tokyo', 'real'],
    author: 'ShutterBug'
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/h4fzD3yY2qGbe/giphy.gif',
    description: 'Midnight Drive',
    category: 'Vibe',
    tags: ['drive', 'night'],
    author: 'NightRider'
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?q=80&w=1200&auto=format&fit=crop',
    description: 'Cyber Geisha',
    category: 'Cosplay',
    tags: ['cosplay', 'cyber'],
    author: 'CosplayQueen'
  },
  {
    type: 'VIDEO',
    link: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
    description: 'Featured Animation',
    category: 'Clip',
    tags: ['3d', 'funny'],
    author: 'BlenderStudio'
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
