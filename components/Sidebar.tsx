import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { buttonVariants, spacing, colors } from '../lib/designTokens';
import { 
  Home, 
  TrendingUp, 
  Users, 
  Grid, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Hash, 
  Plus,
  LogOut,
  ChevronRight,
  Film,
  Palette
} from 'lucide-react';
import { useDevice } from '../hooks/useDevice';

interface SidebarProps {
  activeTab: 'photos' | 'videos' | 'following';
  setActiveTab: (tab: 'photos' | 'videos' | 'following') => void;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
  currentView: 'home' | 'profile' | 'inbox';
  onNavigate: (view: 'home' | 'profile' | 'inbox') => void;
  isOpen: boolean;
  onClose: () => void;
  onUploadClick: () => void;
  onLogout: () => void;
  session: any;
}

type SubItem = {
  id: string;
  label: string;
  category: string;
};

const Sidebar: React.FC<SidebarProps> = ({ 
    activeTab, 
    setActiveTab, 
    selectedCategory,
    setSelectedCategory,
    currentView, 
    onNavigate,
    isOpen,
    onClose,
    onUploadClick,
    onLogout,
    session
}) => {
  
  const { isDesktop, isTablet } = useDevice();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const homeSubItems: SubItem[] = [
    { id: 'for-you', label: 'For You', category: 'For You' },
    { id: 'trending', label: 'Trending', category: 'Trending' },
  ];

  const exploreSubItems: SubItem[] = [
    { id: 'gifs', label: 'GIFs', category: 'GIFs' },
    { id: 'images', label: 'Images', category: 'Images' },
    { id: 'creators', label: 'Creators', category: 'Creators' },
    { id: 'niches-explore', label: 'Niches', category: 'Niches' },
  ];

  const nichesSubItems: SubItem[] = [
    { id: 'all-niches', label: 'All Categories', category: 'All Niches' },
  ];

  const handleSubItemClick = (subItem: SubItem, parentSection: string) => {
    if (parentSection === 'home') {
      setActiveTab('following');
    } else {
      setActiveTab('photos');
    }
    if (setSelectedCategory) setSelectedCategory(subItem.category);
    onNavigate('home');
    if (!isDesktop) onClose();
  };

  const handleNavClick = (id: string, view: any) => {
    if (id === 'upload') {
        onUploadClick();
    } else if (id === 'home' || id === 'explore' || id === 'niches') {
        // Toggle expansion for sections with sub-items
        toggleSection(id);
    } else if (id === 'profile') {
        onNavigate('profile');
        if (!isDesktop) onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay - only on mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed top-0 left-0 h-full w-[260px] bg-[#0A0A0A] border-r border-white/5 z-[80] transition-transform duration-300 ease-in-out pt-20 flex flex-col",
        // Show on desktop always, on tablet/mobile when open
        isDesktop ? "translate-x-0" : isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex-grow overflow-y-auto px-4 custom-scrollbar">
          
          {/* Main Nav */}
          <nav className="space-y-1 mb-2" role="navigation" aria-label="Main navigation">
            {/* Home Section */}
            <div className="mb-1">
              <button
                onClick={() => handleNavClick('home', 'home')}
                className={cn(
                  "w-full flex items-center justify-between gap-4 px-4 py-4 rounded-2xl text-sm font-black transition-all group relative overflow-hidden uppercase tracking-widest",
                  "min-h-[48px] active:scale-[0.98] transition-transform",
                  expandedSection === 'home' || (currentView === 'home' && selectedCategory === 'For You' || selectedCategory === 'Trending')
                    ? "text-pink-500 bg-pink-500/5" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                aria-expanded={expandedSection === 'home'}
                aria-controls="home-submenu"
              >
                <div className={cn("flex items-center gap-4", spacing.gap4)}>
                  <Home className={cn(
                    "w-5 h-5 relative z-10",
                    expandedSection === 'home' || (currentView === 'home' && selectedCategory === 'For You' || selectedCategory === 'Trending') ? "text-pink-500" : "group-hover:text-white"
                  )} />
                  <span className="relative z-10 text-[10px]">Home</span>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  expandedSection === 'home' ? "rotate-90 text-pink-500" : "text-gray-500"
                )} />
              </button>
              
              <AnimatePresence>
                {expandedSection === 'home' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-4 mt-1 space-y-1"
                  >
                    {homeSubItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(subItem, 'home')}
                        className={cn(
                          "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold transition-all",
                          selectedCategory === subItem.category
                            ? "text-pink-400 bg-pink-500/10" 
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        )}
                      >
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Explore Section */}
            <div className="mb-1">
              <button
                onClick={() => handleNavClick('explore', 'home')}
                className={cn(
                  "w-full flex items-center justify-between gap-4 px-4 py-4 rounded-2xl text-sm font-black transition-all group relative overflow-hidden uppercase tracking-widest",
                  expandedSection === 'explore' || (currentView === 'home' && ['GIFs', 'Images', 'Creators', 'Niches'].includes(selectedCategory || ''))
                    ? "text-pink-500 bg-pink-500/5" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <TrendingUp className={cn(
                    "w-5 h-5 relative z-10",
                    expandedSection === 'explore' || (currentView === 'home' && ['GIFs', 'Images', 'Creators', 'Niches'].includes(selectedCategory || '')) ? "text-pink-500" : "group-hover:text-white"
                  )} />
                  <span className="relative z-10 text-[10px]">Explore</span>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  expandedSection === 'explore' ? "rotate-90 text-pink-500" : "text-gray-500"
                )} />
              </button>
              
              <AnimatePresence>
                {expandedSection === 'explore' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-4 mt-1 space-y-1"
                  >
                    {exploreSubItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(subItem, 'explore')}
                        className={cn(
                          "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold transition-all",
                          selectedCategory === subItem.category
                            ? "text-pink-400 bg-pink-500/10" 
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        )}
                      >
                        {subItem.id === 'gifs' && <Film className="w-4 h-4" />}
                        {subItem.id === 'images' && <ImageIcon className="w-4 h-4" />}
                        {subItem.id === 'creators' && <Users className="w-4 h-4" />}
                        {subItem.id === 'niches-explore' && <Palette className="w-4 h-4" />}
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Upload */}
            <button
              onClick={() => handleNavClick('upload', 'upload')}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-black transition-all group relative overflow-hidden uppercase tracking-widest",
                "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Plus className={cn(
                "w-5 h-5 relative z-10 group-hover:text-white"
              )} />
              <span className="relative z-10 text-[10px]">Upload</span>
            </button>

            {/* Niches Section */}
            <div className="mb-1">
              <button
                onClick={() => handleNavClick('niches', 'home')}
                className={cn(
                  "w-full flex items-center justify-between gap-4 px-4 py-4 rounded-2xl text-sm font-black transition-all group relative overflow-hidden uppercase tracking-widest",
                  expandedSection === 'niches' || selectedCategory === 'All Niches'
                    ? "text-pink-500 bg-pink-500/5" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <Hash className={cn(
                    "w-5 h-5 relative z-10",
                    expandedSection === 'niches' || selectedCategory === 'All Niches' ? "text-pink-500" : "group-hover:text-white"
                  )} />
                  <span className="relative z-10 text-[10px]">Niches</span>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  expandedSection === 'niches' ? "rotate-90 text-pink-500" : "text-gray-500"
                )} />
              </button>
              
              <AnimatePresence>
                {expandedSection === 'niches' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-4 mt-1 space-y-1"
                  >
                    {nichesSubItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(subItem, 'niches')}
                        className={cn(
                          "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold transition-all",
                          selectedCategory === subItem.category
                            ? "text-pink-400 bg-pink-500/10" 
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        )}
                      >
                        <Palette className="w-4 h-4" />
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <button
              onClick={() => handleNavClick('profile', 'profile')}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-black transition-all group relative overflow-hidden uppercase tracking-widest",
                currentView === 'profile'
                  ? "text-pink-500 bg-pink-500/5" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Users className={cn(
                "w-5 h-5 relative z-10",
                currentView === 'profile' ? "text-pink-500" : "group-hover:text-white"
              )} />
              <span className="relative z-10 text-[10px]">Profile</span>
            </button>
          </nav>

        </div>

        {/* Footer info at bottom of sidebar */}
        <div className="p-6 border-t border-white/5 mt-auto">
            {session && (
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all mb-4 border border-rose-500/20"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                        <LogOut className="w-4 h-4" />
                    </motion.div>
                    Log Out
                </button>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                <a href="#" className="hover:text-gray-400">Rules</a>
                <a href="#" className="hover:text-gray-400">API</a>
                <a href="#" className="hover:text-gray-400">Discord</a>
            </div>
            <p className="text-[9px] text-gray-700 mt-4 tracking-tighter">© 2026 WXIFU NEURAL NETWORK</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
