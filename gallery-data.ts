
import { MediaItem, MediaType } from './types';
import { getDriveId, getGoogleDriveImageUrl, getGoogleDriveVideoPreviewUrl } from './lib/googleDrive';

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

// --- INTERNAL HELPERS (Do not edit below unless you are a dev) ---

export const DEFAULT_VIDEO_THUMBNAIL_ID = '1sILwvb70QBKknRuhk0fJLwnO7kmdEywQ';
export const DEFAULT_THUMB_URL = `https://lh3.googleusercontent.com/d/${DEFAULT_VIDEO_THUMBNAIL_ID}`;

// Simple string hash for stable IDs
const generateHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

export const processMediaItem = (item: any, index: number): MediaItem => {
  // Case insensitive check for video type
  const rawType = item.type ? String(item.type).toUpperCase() : '';
  const isVideo = rawType === 'VIDEO' || rawType === MediaType.Video;
  
  const type = isVideo ? MediaType.Video : MediaType.Photo;
  
  // Input Source Handling
  const sourceString = item.link || item.src || item.url || '';
  
  // Generate stable ID based on content source rather than index
  // This prevents UI glitches when items are reordered or filtered
  const contentHash = generateHash(sourceString + (item.description || ''));
  const id = item.id || (isVideo ? `static-vid-${contentHash}` : `static-photo-${contentHash}`);
  
  const driveId = getDriveId(sourceString);
  
  let finalSrc = sourceString;
  let finalVideoSrc = item.videoSrc;

  if (type === MediaType.Photo) {
     // Auto-convert Drive Links to High-Res Image Proxy
     if (driveId) {
        finalSrc = getGoogleDriveImageUrl(driveId);
     }
  } else {
     // Video Handling
     // Check if thumbnail is also a Drive link
     const thumbDriveId = getDriveId(item.thumbnail);
     if (thumbDriveId) {
         finalSrc = getGoogleDriveImageUrl(thumbDriveId);
     } else {
         finalSrc = item.thumbnail || DEFAULT_THUMB_URL;
     }
     
     if (driveId) {
        // If it's a Drive ID, construct the preview URL
        finalVideoSrc = getGoogleDriveVideoPreviewUrl(driveId);
     } else {
        // Otherwise use the direct link
        finalVideoSrc = item.videoSrc || sourceString;
     }
  }

  // Author Logic
  const profileName = item.profiles?.name;
  const profileAvatar = item.profiles?.avatar;
  const authorName = profileName || item.author || (item.user_id ? 'Unknown' : 'Ottako Admin');

  // Pseudo User ID for static items to allow clicking profile
  let userId = item.user_id;
  if (!userId) {
      userId = `static-user-${authorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  return {
    id: id.toString(),
    type,
    src: finalSrc,
    videoSrc: finalVideoSrc,
    description: item.description,
    category: item.category || (type === MediaType.Photo ? 'Illustration' : 'Clip'),
    tags: item.tags || [],
    user_id: userId, 
    author: authorName,
    author_avatar: profileAvatar || item.author_avatar,
    is_premium: item.is_premium || false,
    price: item.price || 0
  };
};

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
