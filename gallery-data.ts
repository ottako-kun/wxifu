import { MediaItem, MediaType } from './types';

// --- SITE CONFIGURATION ---
// Manage your site-wide constants, text, and settings here.

export const APP_CONFIG = {
  // Branding
  name: 'OTAKU',
  nameSuffix: '-X', // Used for styling (cyan color usually)
  subtitle: 'Waifu Art Gallery',
  
  // Settings
  itemsPerPage: 24,
  
  // Hero Section Content
  hero: {
    badge: 'NSFW Gallery Collection',
    description: 'Browse a gallery of captivating visuals and sensual edits. Feel the pull of the spotlight… it’s ready for you to become our next featured waifu.',
    tags: ['Illustrations', 'Photos', 'Videos']
  },
  
  // Footer Content
  footer: {
    brand: 'OTTAKO-KUN',
    tagline: 'Est. 2025',
    disclaimer: 'For mature audiences only'
  },

  // Social Media Links
  social: {
    twitter: 'https://x.com/ottakokun',
    reddit: 'https://www.reddit.com/r/OTTAKOKUN/',
    telegram: 'https://t.me/OTTAKOKUN'
  }
};

// --- CONFIGURATION: PASTE YOUR LINKS HERE ---

// 1. Add your Google Drive links here.
// 2. Ensure the file on Google Drive is set to "Anyone with the link" -> "Viewer".
// 3. You can optionally add 'author' and 'author_avatar' to credit specific users.

const CUSTOM_MEDIA_COLLECTION = [
  // --- PHOTOS & ANIMATED GIFS ---
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/LpdlqTkgO2Lwwixwv7/giphy.gif',
    description: 'Neo Tokyo Rain',
    category: 'Scenery',
    tags: ['cyberpunk', 'rain'],
    author: 'NeonDrifter' // Example: Custom Author
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
    link: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    description: 'Shinjuku Nights',
    category: 'Photography',
    tags: ['tokyo', 'real'],
    author: 'ShutterBug'
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/j2pWZpr5RlpwpGVtG1/giphy.gif',
    description: 'Pixel Cityscape',
    category: 'Animation',
    tags: ['pixelart', 'city'],
    // No author specified -> defaults to Ottako Admin
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/i2tLw5ZyizMNy/giphy.gif',
    description: 'Cherry Blossom Fall',
    category: 'Scenery',
    tags: ['sakura', 'nature'],
    author: 'SakuraFan'
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
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
    description: 'Lofi Study Session',
    category: 'Vibe',
    tags: ['lofi', 'chill'],
    author: 'LoFiGirl'
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/12NUbkX6p4xOO4/giphy.gif',
    description: 'Space Cowboy',
    category: 'Classic',
    tags: ['anime', 'space']
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=1200&auto=format&fit=crop',
    description: 'Urban Ninja',
    category: 'Cosplay',
    tags: ['ninja', 'urban']
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/fCda953g1W6fC/giphy.gif',
    description: 'System Glitch',
    category: 'Aesthetic',
    tags: ['glitch', 'tech']
  },
  
  // --- VIDEOS ---
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

// --- HELPERS ---

// Helper to extract Google Drive ID from various URL formats
export const getDriveId = (input: string): string => {
  if (!input) return '';
  // Match /d/ID pattern (standard drive links)
  const matchSlash = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchSlash && matchSlash[1]) return matchSlash[1];

  // Match id=ID pattern (some export links)
  const matchId = input.match(/id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) return matchId[1];

  // If no pattern matches, assume it's already the ID
  return input;
};

// Default Thumbnail ID (Used if no thumbnail is provided for videos)
export const DEFAULT_VIDEO_THUMBNAIL_ID = '1sILwvb70QBKknRuhk0fJLwnO7kmdEywQ';
export const DEFAULT_THUMB_URL = `https://lh3.googleusercontent.com/d/${DEFAULT_VIDEO_THUMBNAIL_ID}`;

/**
 * Helper to process a raw DB item or static item into a MediaItem
 * This handles the Google Drive link conversion logic centrally.
 */
export const processMediaItem = (item: any, index: number): MediaItem => {
  const isVideo = item.type === MediaType.Video || item.type === 'VIDEO';
  const type = isVideo ? MediaType.Video : MediaType.Photo;
  
  // Use existing ID or generate one
  const id = item.id || (isVideo ? `vid-${index}` : `photo-${index}`);
  
  // Detect if the input is a full link or just an ID
  const sourceString = item.link || item.src || item.url || '';
  const driveId = getDriveId(sourceString);
  
  let finalSrc = sourceString;
  let finalVideoSrc = item.videoSrc;

  if (type === MediaType.Photo) {
     // If it looks like a Drive ID, construct the proxy URL for faster loading
     // We check if it contains drive.google.com OR if it was just an ID string (length check is a rough heuristic)
     if (driveId && (sourceString.includes('drive.google.com') || sourceString.length < 50)) {
        finalSrc = `https://lh3.googleusercontent.com/d/${driveId}`;
     }
  } else {
     // Video Logic
     // Thumbnail: Use provided, or default
     finalSrc = item.thumbnail || DEFAULT_THUMB_URL;
     
     // Video Source: If Drive link, convert to preview, else use direct
     if (sourceString && sourceString.includes('drive.google.com')) {
        const vidDriveId = getDriveId(sourceString);
        finalVideoSrc = `https://drive.google.com/file/d/${vidDriveId}/preview`;
     } else {
        finalVideoSrc = item.videoSrc || sourceString;
     }
  }

  // Determine Author
  // Priority: 1. Joined Profile Data (if available), 2. Denormalized Column, 3. 'Unknown' or Default
  // 'item.profiles' comes from the join in Supabase
  const profileName = item.profiles?.name;
  const profileAvatar = item.profiles?.avatar;

  const authorName = profileName || item.author || (item.user_id ? 'Unknown' : 'Ottako Admin');

  // Generate a consistent user_id for static items with an author so they are clickable
  let userId = item.user_id;
  if (!userId) {
      // Create a slug-like ID from the author name to act as a pseudo-user-id
      userId = `static-${authorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
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
    author_avatar: profileAvatar || item.author_avatar
  };
};

// --- DATA PROCESSING ---

// Generate the fallback data from the configuration array above
const processedCustomItems = CUSTOM_MEDIA_COLLECTION.map((item, index) => 
  processMediaItem(item, index)
);

export const fallbackPhotoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Photo
);

export const fallbackVideoMedia: MediaItem[] = processedCustomItems.filter(
  item => item.type === MediaType.Video
);