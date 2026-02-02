
import { useState, useEffect, useCallback } from 'react';
import { supabase, getFollowedMedia } from '../lib/supabaseClient';
import { fallbackPhotoMedia, fallbackVideoMedia } from '../gallery-data';
import { processMediaItem } from '../lib/utils';
import { MediaItem, MediaType, Session } from '../types';
// Fixed: Import Session from local types

export const useMediaLibrary = (session: Session | null) => {
  const [photoMedia, setPhotoMedia] = useState<MediaItem[]>([]);
  const [videoMedia, setVideoMedia] = useState<MediaItem[]>([]);
  const [followedMedia, setFollowedMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let fetchedData: any[] = [];

      // Attempt 1: Efficient Join (Requires Foreign Key)
      // Fixed: The chain is now properly thenable in lib/client.ts mock
      const { data: joinData, error: joinError } = await supabase
        .from('media')
        .select('*, profiles(name, avatar)')
        .order('created_at', { ascending: false });

      if (!joinError && joinData) {
        fetchedData = joinData;
      } else {
        // Attempt 2: Fallback Manual Fetch
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (mediaError) throw mediaError;

        if (mediaData && mediaData.length > 0) {
           const userIds = Array.from(new Set(
               mediaData
                  .map(m => m.user_id)
                  .filter(id => id && id.length > 20 && !id.startsWith('static'))
           ));
           
           const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, name, avatar')
              .in('id', userIds as string[]);
              
           const profileMap = new Map(profilesData?.map((p: any) => [p.id, p]) || []);
           
           fetchedData = mediaData.map(m => ({
               ...m,
               profiles: profileMap.get(m.user_id) || null
           }));
        }
      }

      // Process Global Fetched Data
      const fetchedPhotos: MediaItem[] = [];
      const fetchedVideos: MediaItem[] = [];

      fetchedData.forEach((item, index) => {
          const processed = processMediaItem(item, index);
          if (processed.type === MediaType.Video) {
              fetchedVideos.push(processed);
          } else {
              fetchedPhotos.push(processed);
          }
      });
      
      setPhotoMedia([...fetchedPhotos, ...fallbackPhotoMedia]);
      setVideoMedia([...fetchedVideos, ...fallbackVideoMedia]);

      // --- FETCH FOLLOWED MEDIA ---
      if (session) {
          const { data: followedDataRaw, error: followFetchError } = await getFollowedMedia(session.user.id);
          if (followFetchError) throw followFetchError;
          
          if (followedDataRaw && followedDataRaw.length > 0) {
              const processedFollowed = followedDataRaw.map((item, index) => {
                  const processed = processMediaItem(item, index);
                  if (item.profiles) {
                      processed.author = item.profiles.name || processed.author;
                      processed.author_avatar = item.profiles.avatar || processed.author_avatar;
                  }
                  return processed;
              });
              setFollowedMedia(processedFollowed);
          } else {
              setFollowedMedia([]);
          }
      } else {
          setFollowedMedia([]);
      }

    } catch (err: any) {
      console.warn("Supabase Sync unavailable, using Local Archive:", err.message);
      // We don't set setError here so the UI doesn't show a scary banner
      // The app simply defaults to the local constant file
      setPhotoMedia(fallbackPhotoMedia);
      setVideoMedia(fallbackVideoMedia);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { photoMedia, videoMedia, followedMedia, isLoading, error, refresh: fetchData };
};
