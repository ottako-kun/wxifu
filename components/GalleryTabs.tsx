
import React from 'react';
import PhotoIcon from './icons/PhotoIcon';
import VideoIcon from './icons/VideoIcon';
import UsersIcon from './icons/UsersIcon';

type TabType = 'photos' | 'videos' | 'following';

interface GalleryTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const GalleryTabs: React.FC<GalleryTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'photos' as const, label: 'Artwork', icon: PhotoIcon },
    { id: 'videos' as const, label: 'Videos', icon: VideoIcon },
    { id: 'following' as const, label: 'Following', icon: UsersIcon },
  ];

  return (
    <div className="flex justify-center items-center mb-6">
      <div className="flex bg-gray-900/40 backdrop-blur-3xl p-1 rounded-2xl border border-white/5 shadow-2xl max-w-full relative">
        {tabs.map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           
           return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-500 ease-out
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-500 hover:text-gray-300'
                }
              `}
              title={tab.label}
            >
              {isActive && (
                 <div className="absolute inset-0 bg-pink-600/80 rounded-xl opacity-100 shadow-[0_0_15px_rgba(236,72,153,0.4)] animate-fade-in"></div>
              )}
              
              <div className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform duration-300`} />
                  <span className={`text-[11px] font-black uppercase tracking-[0.15em] hidden sm:block ${isActive ? 'text-white' : ''}`}>
                      {tab.label}
                  </span>
              </div>
            </button>
           );
        })}
      </div>
    </div>
  );
};

export default React.memo(GalleryTabs);
