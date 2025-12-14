
import React from 'react';

type TabType = 'photos' | 'videos' | 'following' | 'manga';

interface GalleryTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const GalleryTabs: React.FC<GalleryTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'photos', label: 'Featured Waifu' },
    { id: 'videos', label: 'Video Collection' },
    { id: 'manga', label: 'Manga & Doujin' },
    { id: 'following', label: 'Following' },
  ];

  return (
    <div className="flex justify-center items-center mb-6">
      <div className="flex bg-gray-900/80 backdrop-blur-md p-1.5 rounded-full border border-gray-800 shadow-xl overflow-x-auto no-scrollbar max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap 
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/25' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(GalleryTabs);
