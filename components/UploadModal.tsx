
import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import UploadIcon from './icons/UploadIcon';
import PhotoIcon from './icons/PhotoIcon';
import VideoIcon from './icons/VideoIcon';
import LockIcon from './icons/LockIcon';
import { MediaType } from '../types';

interface UploadFormData {
  type: MediaType;
  src: string;
  description: string;
  category: string;
  tags: string[];
  is_premium: boolean;
  price: number;
}

interface UploadModalProps {
  onClose: () => void;
  onSubmit: (data: UploadFormData) => Promise<void>;
  isSubmitting: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<UploadFormData>({
    type: MediaType.Photo,
    src: '',
    description: '',
    category: '',
    tags: [],
    is_premium: false,
    price: 5
  });
  
  const [tagInput, setTagInput] = useState('');

  const handleChange = (field: keyof UploadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      setFormData(prev => ({ ...prev, tags: prev.tags.slice(0, -1) }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.src || !formData.description || !formData.category) return;
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-auto flex flex-col relative overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white tracking-wide uppercase font-orbitron">Add to Gallery</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleChange('type', MediaType.Photo)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                formData.type === MediaType.Photo
                  ? 'bg-pink-500/10 border-pink-500 text-pink-400'
                  : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
              }`}
            >
              <PhotoIcon className="w-5 h-5" />
              <span className="font-semibold">Photo</span>
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', MediaType.Video)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                formData.type === MediaType.Video
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                  : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
              }`}
            >
              <VideoIcon className="w-5 h-5" />
              <span className="font-semibold">Video</span>
            </button>
          </div>

          {/* Premium / Monetization Toggle */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-yellow-500 font-bold">
                      <LockIcon className="w-5 h-5" />
                      <span className="uppercase tracking-wider text-xs">Premium Content</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.is_premium}
                        onChange={(e) => handleChange('is_premium', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
              </div>
              
              {formData.is_premium && (
                  <div className="animate-fade-in">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Unlock Price ($ or Coins)
                      </label>
                      <input 
                        type="number"
                        min="1"
                        value={formData.price}
                        onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                        className="w-full bg-black/40 border border-yellow-500/50 rounded-lg p-2 text-yellow-400 font-bold focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <p className="text-[10px] text-gray-500 mt-2">
                          Users must pay this amount to view the content.
                      </p>
                  </div>
              )}
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Google Drive / Image Link
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UploadIcon className="h-5 w-5 text-gray-500" />
                </div>
                <input
                type="text"
                required
                value={formData.src}
                onChange={(e) => handleChange('src', e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
                Make sure the Google Drive link has "Anyone with the link" access.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Category
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g. Illustration, Fanart, 3D Render..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Tags - Dynamic Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Tags
            </label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent transition-all">
                {formData.tags.map(tag => (
                   <span key={tag} className="bg-cyan-900/40 text-cyan-300 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 border border-cyan-500/30">
                      #{tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="hover:text-white"
                      >
                         &times;
                      </button>
                   </span>
                ))}
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={formData.tags.length === 0 ? "Add tags (press Enter)..." : ""}
                  className="bg-transparent text-white placeholder-gray-500 focus:outline-none flex-grow min-w-[120px] text-sm py-1"
                />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Give your post a catchy title or description..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-pink-900/20 transform transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Posting...
                </span>
            ) : (
                'POST TO GALLERY'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
