
import { MediaItem, MediaType } from './types';
import { processMediaItem } from './lib/utils';

// --- SITE CONFIGURATION ---
export const APP_CONFIG = {
  name: 'OTAKU',
  nameSuffix: '-X',
  subtitle: 'The Premier Anime & Art Gallery',
  itemsPerPage: 24,
  hero: {
    badge: 'Curated Collection',
    description: 'The definitive social playground for anime aesthetics, digital artists, and the otaku elite. Explore high-quality artwork and AMVs directly from the cloud.',
    tags: ['Anime Art', 'AMVs', 'Cosplay', 'Wallpapers']
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

// --- YOUR GALLERY DATA ---
// HOW TO ADD GOOGLE DRIVE LINKS:
// 1. Upload file to Google Drive.
// 2. Right Click -> Share -> General Access -> "Anyone with the link" -> "Viewer".
// 3. Click "Copy Link".
// 4. Paste the link into the 'link' field below.

const CUSTOM_MEDIA_COLLECTION = [
  // --- VIDEO SECTION ---
  {
    type: 'VIDEO',
    // Example Google Drive Video Link
    link: 'https://drive.google.com/file/d/1sILwvb70QBKknRuhk0fJLwnO7kmdEywQ/view?usp=sharing', 
    // You can use a static image or a drive link for the thumbnail
    thumbnail: 'https://images.unsplash.com/photo-1620641788421-7f1c338e420c?q=80&w=1200&auto=format&fit=crop',
    description: 'Cyberpunk Edgerunners AMV - Neon Nights',
    category: 'AMV',
    tags: ['cyberpunk', 'anime', 'edit', '4k'],
    author: 'EditorX',
    is_premium: false
  },
  
  // --- PHOTO SECTION ---
  {
    type: 'PHOTO',
    // Example: Replace with your Google Drive Image Link
    link: 'https://drive.google.com/file/d/1B7xxxxxxxx_YOUR_DRIVE_ID_HERE_xxxxxxx/view?usp=sharing',
    description: 'Evangelion Unit-01 Concept Art',
    category: 'Illustration',
    tags: ['mecha', 'evangelion', 'scifi'],
    author: 'MechaArtist',
    is_premium: true,
    price: 10
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    description: 'Tokyo Street Photography - Akihabara Vibes',
    category: 'Photography',
    tags: ['tokyo', 'real', 'aesthetic'],
    author: 'ShutterBug'
  },
  {
    type: 'PHOTO',
    link: 'https://media.giphy.com/media/LpdlqTkgO2Lwwixwv7/giphy.gif',
    description: 'Lofi Hip Hop Study Girl Loop',
    category: 'Gif',
    tags: ['lofi', 'chill', 'anime'],
    author: 'StudioGhibliFan'
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?q=80&w=1200&auto=format&fit=crop',
    description: 'Cyber Geisha Cosplay Photoshoot',
    category: 'Cosplay',
    tags: ['cosplay', 'cyberpunk', 'costume'],
    author: 'CosplayQueen',
    is_premium: true, // Content locking example
    price: 50
  },
  {
    type: 'PHOTO',
    link: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1200&auto=format&fit=crop',
    description: 'Fantasy Landscape - Isekai World',
    category: 'Background',
    tags: ['fantasy', 'isekai', 'art'],
    author: 'WorldBuilder'
  },
  {
    type: 'VIDEO',
    link: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=1200&auto=format&fit=crop',
    description: '3D CGI Anime Rendering Test',
    category: '3D Render',
    tags: ['3d', 'blender', 'cgi'],
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
