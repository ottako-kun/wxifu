
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Home, 
  TrendingUp, 
  Users, 
  Grid, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Hash, 
  Plus
} from 'lucide-react';

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
}

const Sidebar: React.FC<SidebarProps> = ({ 
    activeTab, 
    setActiveTab, 
    selectedCategory,
    setSelectedCategory,
    currentView, 
    onNavigate,
    isOpen,
    onClose,
    onUploadClick
}) => {
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, view: 'home' },
    { id: 'explore', label: 'Explore', icon: TrendingUp, view: 'home' },
    { id: 'upload', label: 'Upload', icon: Plus, view: 'upload' },
    { id: 'niches', label: 'Niches', icon: Hash, view: 'home' },
    { id: 'profile', label: 'Profile', icon: Users, view: 'profile' },
  ];

  const handleNavClick = (id: string, view: any) => {
    if (id === 'upload') {
        onUploadClick();
    } else if (id === 'niches') {
        setActiveTab('photos'); // Reset to photos or handle exploration
        if (setSelectedCategory) setSelectedCategory('Niches');
        onNavigate('home');
    } else if (id === 'explore') {
        setActiveTab('photos');
        if (setSelectedCategory) setSelectedCategory('All');
        onNavigate('home');
    } else if (id === 'home') {
        setActiveTab('following');
        onNavigate('home');
    } else {
        handleNavigateToView(id, view);
    }
    
    if (window.innerWidth < 1024) onClose();
  };

  const handleNavigateToView = (id: string, view: any) => {
      onNavigate(view);
  };

  return (
    <>
      {/* Mobile Overlay */}
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
        "fixed top-0 left-0 h-full w-[260px] bg-[#0A0A0A] border-r border-white/5 z-[80] transition-transform duration-300 ease-in-out lg:translate-x-0 pt-20 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex-grow overflow-y-auto px-4 custom-scrollbar">
          
          {/* Main Nav */}
          <div className="space-y-1 mb-2">
            {navItems.map((item) => {
              let isActive = false;
              if (item.id === 'home') isActive = currentView === 'home' && activeTab === 'following';
              else if (item.id === 'explore') isActive = currentView === 'home' && activeTab !== 'following' && selectedCategory !== 'Niches';
              else if (item.id === 'niches') isActive = currentView === 'home' && selectedCategory === 'Niches';
              else if (item.id === 'profile') isActive = currentView === 'profile';
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.view)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-black transition-all group relative overflow-hidden uppercase tracking-widest",
                    isActive 
                      ? "text-pink-500 bg-pink-500/5" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 relative z-10",
                    isActive ? "text-pink-500" : "group-hover:text-white"
                  )} />
                  <span className="relative z-10 text-[10px]">{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Footer info at bottom of sidebar */}
        <div className="p-6 border-t border-white/5 mt-auto">
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
