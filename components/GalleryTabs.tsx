
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
    { id: 'photos' as const, label: 'Waifu', icon: PhotoIcon },
    { id: 'videos' as const, label: 'Videos', icon: VideoIcon },
    { id: 'following' as const, label: 'Following', icon: UsersIcon },
  ];

  return (
    <div className="flex justify-center items-center mb-4">
      <div className="flex bg-gray-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-800 shadow-xl max-w-full">
        {tabs.map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           
           return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }
              `}
              title={tab.label}
            >
              {/* Animated Background for Active State */}
              {isActive && (
                 <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-pink-500 rounded-xl opacity-100 shadow-[0_0_15px_rgba(236,72,153,0.3)]"></div>
              )}
              
              <div className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {/* Label: Hidden on very small screens if needed, but flex-wrap handles it. 
                      We keep it short: Waifu, Videos, Following */}
                  <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-white' : ''} hidden sm:block`}>
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
