
import React, { useRef, useState, useEffect } from 'react';
import { MediaItem } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import LoadingSpinner from './icons/LoadingSpinner';
import { useMangaReader } from '../hooks/useMangaReader';

interface MangaReaderModalProps {
  item: MediaItem;
  onClose: () => void;
}

const MangaReaderModal: React.FC<MangaReaderModalProps> = ({ item, onClose }) => {
  const { 
      chapters, 
      pages, 
      currentChapter, 
      isLoading, 
      viewMode, 
      loadChapter, 
      closeReader 
  } = useMangaReader(item.externalId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress
  useEffect(() => {
    const el = containerRef.current;
    if (!el || viewMode !== 'reader') return;

    const handleScroll = () => {
        const totalHeight = el.scrollHeight - el.clientHeight;
        const progress = totalHeight > 0 ? (el.scrollTop / totalHeight) * 100 : 0;
        setScrollProgress(progress);
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [viewMode, pages]);

  const handleTap = (e: React.MouseEvent) => {
    if (!containerRef.current || viewMode !== 'reader') return;
    
    // Determine click position
    const { clientX, currentTarget } = e;
    const width = currentTarget.clientWidth;
    const clickX = clientX;

    // Left 30% -> Scroll Up
    if (clickX < width * 0.3) {
        containerRef.current.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
    }
    // Right 30% -> Scroll Down
    else if (clickX > width * 0.7) {
        containerRef.current.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
    }
    // Center -> Toggle controls (Optional, simplified here)
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 z-10 relative shadow-md">
         {viewMode === 'reader' && (
             <div 
                className="absolute bottom-0 left-0 h-1 bg-pink-500 transition-all duration-100 ease-out" 
                style={{ width: `${scrollProgress}%` }}
             ></div>
         )}
         
         <div className="flex items-center gap-4 overflow-hidden">
            {viewMode === 'reader' && (
                <button onClick={closeReader} className="p-2 hover:bg-gray-800 rounded-full text-white transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            )}
            <div>
                <h2 className="text-white font-bold truncate max-w-[200px] md:max-w-md font-orbitron">{item.description}</h2>
                <p className="text-xs text-gray-400">
                    {viewMode === 'chapters' ? `${chapters.length} Chapters` : `Chapter ${currentChapter?.attributes?.chapter || 'One-shot'}`}
                </p>
            </div>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-red-900/50 rounded-full text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
         </button>
      </div>

      {/* Content */}
      <div 
        ref={containerRef}
        className="flex-grow overflow-y-auto bg-black relative no-scrollbar"
        onClick={handleTap}
      >
         {isLoading && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                 <LoadingSpinner className="w-10 h-10 text-pink-500" />
             </div>
         )}

         {viewMode === 'chapters' ? (
             <div className="container mx-auto max-w-2xl p-4">
                 <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
                     <img src={item.src} alt="Cover" className="w-32 md:w-48 rounded-lg shadow-xl border border-gray-800" />
                     <div className="flex-grow">
                         <div className="flex flex-wrap gap-2 mb-4">
                             {item.tags?.map(tag => (
                                 <span key={tag} className="px-2 py-1 bg-gray-800 text-gray-300 text-[10px] uppercase rounded border border-gray-700">
                                     {tag}
                                 </span>
                             ))}
                         </div>
                         <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Read this manga directly on Ottako-X. Powered by MangaDex.
                         </p>
                     </div>
                 </div>

                 <h3 className="text-pink-500 font-bold uppercase tracking-wider mb-4 border-b border-pink-500/20 pb-2">Chapter List</h3>
                 <div className="space-y-2">
                     {chapters.length === 0 && !isLoading && (
                         <div className="text-gray-500 text-center py-10">No chapters found in English.</div>
                     )}
                     {chapters.map((ch) => (
                         <button 
                            key={ch.id}
                            onClick={(e) => { e.stopPropagation(); loadChapter(ch); }}
                            className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg group transition-all"
                         >
                            <div className="text-left">
                                <span className="text-white font-bold group-hover:text-pink-400 transition-colors">
                                    {ch.attributes.chapter ? `Ch. ${ch.attributes.chapter}` : 'One-shot'}
                                </span>
                                {ch.attributes.title && (
                                    <span className="text-gray-500 ml-2 text-sm">- {ch.attributes.title}</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-600">
                                {new Date(ch.attributes.publishAt).toLocaleDateString()}
                            </span>
                         </button>
                     ))}
                 </div>
             </div>
         ) : (
             <div className="w-full min-h-full bg-[#1a1a1a] flex flex-col items-center py-4 space-y-2 cursor-pointer">
                 {pages.map((pageUrl, idx) => (
                     <img 
                        key={idx}
                        src={pageUrl}
                        alt={`Page ${idx + 1}`}
                        className="max-w-full h-auto shadow-2xl"
                        loading="lazy"
                     />
                 ))}
                 <div className="py-20 text-gray-500 text-sm flex flex-col items-center gap-2">
                    <span>End of Chapter</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); closeReader(); }}
                        className="px-4 py-2 bg-gray-800 rounded text-white text-xs hover:bg-gray-700"
                    >
                        Back to Chapters
                    </button>
                 </div>
                 
                 {/* Tap Hints (Visible briefly or on hover for desktop) */}
                 <div className="fixed top-1/2 left-4 w-12 h-24 bg-white/5 rounded-full hidden md:flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                     <ChevronLeftIcon className="w-8 h-8 text-white/50" />
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default MangaReaderModal;
