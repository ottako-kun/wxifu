
import { MediaItem, MediaType } from './types';
import { getDriveId, getGoogleDriveImageUrl, getGoogleDriveVideoPreviewUrl } from './lib/googleDrive';

// --- SITE CONFIGURATION ---
// Manage your site-wide constants, text, and settings here.

export const APP_CONFIG = {
  // Branding
  name: 'OTAKU',
  nameSuffix: '-X', // Used for styling (cyan color usually)
  subtitle: 'The Premier Adult Social Stage',
  
  // Settings
  itemsPerPage: 24,
  
  // Hero Section Content
  hero: {
    badge: 'Liberated Creative Sanctuary',
    description: 'The definitive social playground for adult models, digital artists, and the otaku elite. Share your assets freely in a space designed for uncensored expression. Connect with a community that worships the art of the body.',
    tags: ['Uncensored Art', 'Cosplay Models', 'Exclusive Assets']
  },
  
  // Footer Content
  footer: {
    brand: 'OTAKU-X',
    tagline: 'Liberating Otaku Culture',
    disclaimer: 'Strictly for adults (18+). All models appearing on this site are 18 years or older.'
  },

  // Social Media Links
  social: {
    twitter: 'https://x.com/ottakokun',
    reddit: 'https://www.reddit.com/r/OTTAKOKUN/',
    telegram: 'https://t.me/OTTAKOKUN'
  }
};

// --- CONFIGURATION: PASTE YOUR LINKS HERE ---

// INSTRUCTIONS FOR GOOGLE DRIVE:
// 1. Upload your image or video to Google Drive.
// 2. Right-click the file -> Share -> Share.
// 3. Under "General Access", change "Restricted" to "Anyone with the link".
// 4. Copy the link and paste it into the 'link' field below.

const CUSTOM_MEDIA_COLLECTION = [
  // --- EXAMPLE: GOOGLE DRIVE PHOTO ---
  // {
  //   type: 'PHOTO',
  //   link: 'https://drive.google.com/file/d/1234567890abcdefg/view?usp=sharing',
  //   description: 'My Awesome Artwork',
  //   category: 'Illustration',
  //   tags: ['oc', 'digital'],
  //   author: 'MyName'
  // },

  // --- PHOTOS & ANIMATED GIFS ---
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
    link: 'https://media.giphy.com/media/j2pWZpr5RlpwpGVtG1/giphy.gif',
    description: 'Pixel Cityscape',
    category: 'Animation',
    tags: ['pixelart', 'city'],
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
    link: 'https://media.giphy.com/media/12NUbkX6p4xOO4/giphy.gif',
    description: 'Space Cowboy',
    category: 'Classic',
    tags: ['anime', 'space']
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
  
  // Use existing ID or generate one. Static IDs use a prefix to ensure uniqueness.
  const id = item.id || (isVideo ? `static-vid-${index}` : `static-photo-${index}`);
  
  // Detect if the input is a full link or just an ID
  const sourceString = item.link || item.src || item.url || '';
  const driveId = getDriveId(sourceString);
  
  let finalSrc = sourceString;
  let finalVideoSrc = item.videoSrc;

  if (type === MediaType.Photo) {
     // If it is a Drive link, convert to LH3 proxy for display
     if (driveId) {
        finalSrc = getGoogleDriveImageUrl(driveId);
     }
  } else {
     // Video Logic
     // Thumbnail: Use provided, or default
     finalSrc = item.thumbnail || DEFAULT_THUMB_URL;
     
     // Video Source: If Drive link, convert to preview, else use direct
     if (driveId) {
        finalVideoSrc = getGoogleDriveVideoPreviewUrl(driveId);
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
