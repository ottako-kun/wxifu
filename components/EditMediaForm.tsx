import React, { useState } from 'react';
import { updateMediaItem } from '../lib/supabaseClient';
import { MediaItem } from '../types';
import { useToast } from '../context/ToastContext';

interface EditMediaFormProps {
  item: MediaItem;
  onCancel: () => void;
  onSuccess: (updatedFields: Partial<MediaItem>) => void;
}

const EditMediaForm: React.FC<EditMediaFormProps> = ({ item, onCancel, onSuccess }) => {
  const [editDesc, setEditDesc] = useState(item.description || '');
  const [editCategory, setEditCategory] = useState(item.category || '');
  const [editTags, setEditTags] = useState(item.tags ? item.tags.join(', ') : '');
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleUpdate = async () => {
    setIsSaving(true);
    const tagsArray = editTags.split(',').map(t => t.trim()).filter(Boolean);
    
    try {
        const { error } = await updateMediaItem(item.id, {
            description: editDesc,
            category: editCategory,
            tags: tagsArray
        });

        if (error) {
            toast.error('Failed to update: ' + error.message);
        } else {
            toast.success('Post updated');
            onSuccess({
                description: editDesc,
                category: editCategory,
                tags: tagsArray
            });
        }
    } catch (e: any) {
        toast.error('Error updating post');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in mb-6">
        <div>
            <label className="text-[10px] uppercase font-bold text-gray-500">Description</label>
            <textarea 
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                rows={3}
            />
        </div>
        <div>
            <label className="text-[10px] uppercase font-bold text-gray-500">Category</label>
            <input 
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm focus:border-pink-500 focus:outline-none"
            />
        </div>
        <div>
            <label className="text-[10px] uppercase font-bold text-gray-500">Tags (comma separated)</label>
            <input 
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 rounded p-2 text-white text-sm focus:border-pink-500 focus:outline-none"
            />
        </div>
        <div className="flex gap-2">
            <button
                onClick={onCancel}
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded text-xs uppercase tracking-wider"
                disabled={isSaving}
            >
                Cancel
            </button>
            <button 
                onClick={handleUpdate}
                disabled={isSaving}
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded text-xs uppercase tracking-wider disabled:opacity-50"
            >
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    </div>
  );
};

export default EditMediaForm;