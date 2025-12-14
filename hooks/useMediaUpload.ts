
import { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { insertMediaItem } from '../lib/supabaseClient';
import { MediaType } from '../types';
import { useToast } from '../context/ToastContext';

interface UseMediaUploadProps {
  session: Session | null;
  onUploadSuccess: () => Promise<void>;
}

export const useMediaUpload = ({ session, onUploadSuccess }: UseMediaUploadProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const openModal = () => {
    if (!session) {
      toast.error("Please sign in to upload media.");
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleUploadSubmit = async (data: { type: MediaType; src: string; description: string; category: string; tags: string[]; is_premium: boolean; price: number }) => {
    if (!session) return;
    setIsUploading(true);
    try {
        const { error } = await insertMediaItem({
            type: data.type,
            src: data.src,
            description: data.description,
            category: data.category,
            tags: data.tags,
            user_id: session.user.id,
            author: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
            author_avatar: session.user.user_metadata.avatar_url,
            is_premium: data.is_premium,
            price: data.price
        });

        if (error) {
            throw error;
        }

        // Refresh data to show new item
        await onUploadSuccess();
        setIsModalOpen(false);
        toast.success('Successfully added to gallery!');
        
        return data.type; // Return type to help switching tabs

    } catch (err: any) {
        console.error("Upload error:", err);
        toast.error(`Failed to upload: ${err.message}`);
        return null;
    } finally {
        setIsUploading(false);
    }
  };

  return {
    isModalOpen,
    isUploading,
    openModal,
    closeModal,
    handleUploadSubmit
  };
};
