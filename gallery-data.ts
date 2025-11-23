import { MediaItem, MediaType } from './types';

// --- HOW TO UPDATE THE GALLERY ---
// 1. Make sure your photos/videos in Google Drive are public ("Anyone with the link").
// 2. Get the shareable link. It will look like:
//    https://drive.google.com/file/d/THIS_IS_THE_ID/view?usp=sharing
// 3. Copy the ID part and add it to the appropriate list below.
// 4. Add a description for each item.
// 5. For videos, you MUST provide a thumbnail image ID. Just take a screenshot of the video,
//    upload it to Drive, get its ID, and add it below. /

const GOOGLE_DRIVE_PHOTOS: { id: string; description: string }[] = [
  {
    id: '1VcZ2HwtbfXJddnszt9PoguYiRTNoZL0a',
    description: '1'
  },
  {
    id: '1VZcVYIZ0kdY722MshqvKOoDMAR62qkP5',
    description: '2'
  },
  {
    id: '1GKdEr3pj5LxaNVUSMzo4o9tHCLSRfoEh',
    description: '3'
  },
  {
    id: '1BlKaIHxsJ9ypmfuIeQq_PM5jpX6rGAYG',
    description: '4'
  },
  {
    id: '1Csc0lB7GP_l0rC2jwz39jh8gsoiW12fc',
    description: '5'
  },
  {
    id: '1usvczHCsfT91WMMngvp24BB-w6U6KYsE',
    description: '6'
  },
  {
    id: '168F8qwSuAhqFY_d1nrAVbBReqhX03WGq',
    description: '7'
  },
  {
    id: '1qlg40kPJ11z4PVsx_ojwGSO5XWCcdJlH',
    description: '8'
  },
  {
    id: '1YaAMkRbe2xX8yvJBth1KWyTdTMq-Co8Q',
    description: '9'
  },
  {
    id: '17XmtlKQQ5rTEuL_1HD7lzYJLED46Ubsc',
    description: '10'
  },
  {
    id: '1bJIIrbnewoJF6NZok0LhV0QdEOjtICUL',
    description: '11'
  },
  {
    id: '1C6Nam5BM88HT8-DXhq7vN6FAi7cZkcPp',
    description: '12'
  },
  {
    id: '1kipcKgGzFU8PXdbMZ44ectyGYACJgvwb',
    description: '13'
  },
  {
    id: '186pUq7cS_BwaFcz-F6fC-5Ym752XfM33',
    description: '14'
  },
  {
    id: '1wsQFU_MmDIZmghniDaCJWWL-Fmg19QjZ',
    description: '15'
  },
  {
    id: '1c_KpirK7XCX613T5euluXskr9hQp8wAf',
    description: '16'
  },
  {
    id: '1lJ7GfmGc-u-BqGPhnyZfodT_mmBgzd4K',
    description: '17'
  },
  {
    id: '1iGm25Ydjf3hVrqbNRwab9ZMLqSClUn2S',
    description: '18'
  },
  {
    id: '1ZG1V97vtLuhG6HiTmXJbPjAM7OIJLCzQ',
    description: '19'
  },
  {
    id: '133GUoe5e3Y5wTDJ4fHcJ3WtkXfGGYduu',
    description: '20'
  },
  {
    id: '1A-9jSXec31FgKB-FRX-LG-9ynjBXfkX1',
    description: '21'
  },
  {
    id: '1PEYlzBLLtU7JrvwyfyIT9n6VD-w99mvT',
    description: '22'
  },
  {
    id: '1jCWs73KSou7zKakpNlC0cjvCZ7mVv-r8',
    description: '23'
  },
];


const GOOGLE_DRIVE_VIDEOS: { videoId: string; thumbnailId: string, description: string }[] = [
  {
    videoId: '1FtUMM6NDQatclxoABpS2mCkvDCWif6CR',
    thumbnailId: '1kV5XMG9SFnXCAuX-Rqm8p2cu0xC1kDOl',
    description: 'Animation Showreel 2025'
  },
  {
    videoId: '17gOAdMDLNbyDNV_O4dnjtIcZUlUEhEB3',
    thumbnailId: '1ICYSgKhI6VGphsxX7-aArxYnelVC22BN',
    description: 'Speedpaint Process - 10x Speed'
  },
];


// --- APP LOGIC (No need to edit below this line) ---

export const photoMedia: MediaItem[] = GOOGLE_DRIVE_PHOTOS.map(photo => ({
  id: photo.id,
  type: MediaType.Photo,
  src: `https://lh3.googleusercontent.com/d/${photo.id}`,
  description: photo.description,
}));

export const videoMedia: MediaItem[] = GOOGLE_DRIVE_VIDEOS.map(video => ({
  id: video.videoId,
  type: MediaType.Video,
  src: `https://lh3.googleusercontent.com/d/${video.thumbnailId}`,
  videoSrc: `https://drive.google.com/file/d/${video.videoId}/preview`,
  description: video.description,
}));