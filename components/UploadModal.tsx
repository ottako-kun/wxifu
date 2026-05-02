
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
    category: 'Photos',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');

  const handleChange = (field: keyof UploadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Improved tag processing logic
  const processTags = (input: string, isFinal: boolean = false) => {
    if (input.includes(',') || isFinal) {
      const parts = input.split(',');
      
      // If it's the final submission (Enter), process all parts
      // If it's typing/pasting, process all parts except the last one (which might be incomplete)
      const tagsToProcess = isFinal ? parts : parts.slice(0, -1);
      const remainingInput = isFinal ? '' : parts[parts.length - 1];

      const newTags = tagsToProcess
        .map(t => t.trim().replace(/^#/, ''))
        .filter(t => t !== '' && !formData.tags.includes(t));
      
      if (newTags.length > 0) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, ...newTags] }));
      }
      
      setTagInput(remainingInput);
    } else {
      setTagInput(input);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processTags(tagInput, true);
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
    
    // Ensure any remaining tag input is processed before submit
    const finalTags = [...formData.tags];
    if (tagInput.trim()) {
        const lastTags = tagInput.split(',')
            .map(t => t.trim().replace(/^#/, ''))
            .filter(t => t !== '' && !finalTags.includes(t));
        finalTags.push(...lastTags);
    }

    await onSubmit({ ...formData, tags: finalTags });
  };

  const isVideo = formData.type === MediaType.Video;

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
            
          {/* Category Selection */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Select Feed Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Photos', type: MediaType.Photo, label: 'Photo', icon: PhotoIcon, color: 'pink' },
                { id: 'Videos', type: MediaType.Video, label: 'Video', icon: VideoIcon, color: 'cyan' },
                { id: 'GIFs', type: MediaType.Photo, label: 'GIF', icon: PlayIcon, color: 'purple' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, category: cat.id, type: cat.type }));
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                    formData.category === cat.id
                      ? `bg-${cat.color}-500/10 border-${cat.color}-500 text-${cat.color}-400 shadow-[0_0_20px_rgba(236,72,153,0.1)]`
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  <cat.icon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {isVideo ? 'Video Link (Google Drive / Direct)' : 'Source Link (Direct / Drive)'}
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
                placeholder={isVideo ? "https://drive.google.com/file/d/..." : "https://drive.google.com/file/d/..."}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
                {isVideo 
                  ? "Supports shared Google Drive files and direct video URLs." 
                  : "Supports direct image URLs and shared Google Drive images."}
            </p>
          </div>


          
          {/* Tags - Dynamic Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Tags (comma separated)
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
                  onChange={(e) => processTags(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={formData.tags.length === 0 ? "Paste tags (e.g. waifu, art, 4k)..." : ""}
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
