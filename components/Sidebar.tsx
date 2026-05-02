
import React from 'react';
import { cn } from '../lib/utils';
import { 
  Home, 
  TrendingUp, 
  Users, 
  Grid, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Hash, 
  Star,
  Clock,
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'photos' | 'videos' | 'following';
  setActiveTab: (tab: 'photos' | 'videos' | 'following') => void;
  currentView: 'home' | 'profile' | 'inbox';
  onNavigate: (view: 'home' | 'profile' | 'inbox') => void;
  isOpen: boolean;
  onClose: () => void;
  onUploadClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    activeTab, 
    setActiveTab, 
    currentView, 
    onNavigate,
    isOpen,
    onClose,
    onUploadClick
}) => {
  
  const navItems = [
    { id: 'photos', label: 'For You', icon: Home, view: 'home' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, view: 'home' },
    { id: 'following', label: 'Following', icon: Users, view: 'home' },
  ];

  const categories = [
    { label: 'AMVs', icon: VideoIcon, tag: 'AMV' },
    { label: 'Illustrations', icon: ImageIcon, tag: 'Illustration' },
    { label: 'Motion', icon: Grid, tag: 'Motion' },
    { label: 'Backgrounds', icon: ImageIcon, tag: 'Background' },
    { label: 'Cyberpunk', icon: Hash, tag: 'Cyberpunk' },
  ];

  const handleNavClick = (id: string, view: any) => {
    if (view === 'home') {
        if (id === 'photos' || id === 'videos' || id === 'following') {
            setActiveTab(id as any);
        }
        onNavigate('home');
    } else {
        onNavigate(view);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full w-[260px] bg-[#0A0A0A] border-r border-white/5 z-[80] transition-transform duration-300 ease-in-out lg:translate-x-0 pt-20 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex-grow overflow-y-auto px-4 custom-scrollbar">
          
          {/* Main Nav */}
          <div className="space-y-1 mb-8">
            {navItems.map((item) => {
              const isActive = currentView === item.view && (item.id === 'trending' || activeTab === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.view)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                    isActive 
                      ? "bg-pink-500/10 text-pink-500" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-pink-500" : "group-hover:text-white"
                  )} />
                  <span className="tracking-wide">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]" />}
                </button>
              );
            })}
          </div>

          {/* Discovery Section */}
          <div className="mb-8">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Discovery</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <cat.icon className="w-5 h-5 group-hover:text-pink-500 transition-colors" />
                  <span className="tracking-wide">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Creator Tools */}
          <div className="mb-8">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Creators</h3>
            <button 
                onClick={onUploadClick}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-pink-950/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Broadcast</span>
            </button>
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
