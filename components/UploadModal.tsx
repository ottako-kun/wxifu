
import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import UploadIcon from './icons/UploadIcon';
import PhotoIcon from './icons/PhotoIcon';
import VideoIcon from './icons/VideoIcon';
import PlayIcon from './icons/PlayIcon';
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
    category: 'Images',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [directLink, setDirectLink] = useState('');
  const [hypnotubeLink, setHypnotubeLink] = useState('');

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
  const isGif = formData.category === 'GIFs';

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
                { id: 'Images', type: MediaType.Photo, label: 'Images', icon: PhotoIcon, activeClass: 'bg-pink-500/10 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.1)]' },
                { id: 'Videos', type: MediaType.Video, label: 'Videos', icon: VideoIcon, activeClass: 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]' },
                { id: 'GIFs', type: MediaType.Photo, label: 'GIFs', icon: PlayIcon, activeClass: 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, category: cat.id, type: cat.type, src: '' }));
                    setDirectLink('');
                    setHypnotubeLink('');
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                    formData.category === cat.id
                      ? cat.activeClass
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
          {!isVideo ? (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {isGif ? 'GIF Link (Giphy / Tenor / Direct)' : 'Image Link (Direct / Drive)'}
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
                  placeholder={isGif ? "https://media.giphy.com/..." : "https://.../image.webp"}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                  {isGif
                    ? "Paste a link to a GIF from Giphy, Tenor, or any direct URL."
                    : "Supports direct image URLs and shared Google Drive images."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Box 1: Direct Video Link */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Video Link (Direct / Drive)
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UploadIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                    type="text"
                    required={!hypnotubeLink}
                    value={directLink}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDirectLink(val);
                      if (val) {
                        setHypnotubeLink('');
                        handleChange('src', val);
                      } else {
                        handleChange('src', '');
                      }
                    }}
                    placeholder="https://.../video.mp4"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                    Supports direct video URLs and shared Google Drive files.
                </p>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-grow h-[1px] bg-gray-800"></div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest font-orbitron">OR</span>
                <div className="flex-grow h-[1px] bg-gray-800"></div>
              </div>

              {/* Box 2: HypnoTube Link */}
              <div>
                <label className="block text-xs font-bold text-pink-500/80 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_#ec4899]"></span>
                  HypnoTube Video Link
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-pink-500/60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                    </div>
                    <input
                    type="text"
                    required={!directLink}
                    value={hypnotubeLink}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHypnotubeLink(val);
                      if (val) {
                        setDirectLink('');
                        handleChange('src', val);
                      } else {
                        handleChange('src', '');
                      }
                    }}
                    placeholder="https://hypnotube.com/video/shemale-dildo-trainer-103.html"
                    className="w-full bg-gray-800/60 border border-pink-500/30 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                </div>
                <p className="text-[10px] text-pink-500/60 mt-1">
                    Paste a HypnoTube video URL to embed and play it directly in the app.
                </p>
              </div>
            </div>
          )}


          
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
