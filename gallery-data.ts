
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

const CUSTOM_MEDIA_COLLECTION = [
  // --- TEMPLATE: GOOGLE DRIVE PHOTO ---
  // {
  //   type: 'PHOTO',
  //   link: 'https://drive.google.com/file/d/1234567890abcdefg/view?usp=sharing', 
  //   description: 'Character Concept Art',
  //   category: 'Illustration',
  //   tags: ['oc', 'sketch', 'drive'],
  //   author: 'ArtistName'
  // },

  // --- TEMPLATE: GOOGLE DRIVE VIDEO ---
  // {
  //   type: 'VIDEO',
  //   link: 'https://drive.google.com/file/d/1234567890abcdefg/view?usp=sharing',
  //   // For Drive videos, you might want a custom thumbnail, otherwise it uses a default
  //   thumbnail: 'https://via.placeholder.com/600x400', 
  //   description: 'Animation Test',
  //   category: 'Clip',
  //   tags: ['animation', '3d'],
  //   author: 'AnimatorName'
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

export const processMediaItem = (item: any, index: number): MediaItem => {
  const isVideo = item.type === MediaType.Video || item.type === 'VIDEO';
  const type = isVideo ? MediaType.Video : MediaType.Photo;
  
  // Create a stable ID based on index if not provided
  const id = item.id || (isVideo ? `static-vid-${index}` : `static-photo-${index}`);
  
  // Input Source Handling
  const sourceString = item.link || item.src || item.url || '';
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
     // If a thumbnail is explicitly provided, use it. Otherwise, use default.
     finalSrc = item.thumbnail || DEFAULT_THUMB_URL;
     
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
