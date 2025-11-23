import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MediaGrid from './components/MediaGrid';
import { photoMedia, videoMedia } from './gallery-data';
import Footer from './components/Footer';
import SearchIcon from './components/icons/SearchIcon';
import SortAscendingIcon from './components/icons/SortAscendingIcon';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc'>('default');

  const itemsToDisplay = activeTab === 'photos' ? photoMedia : videoMedia;
  const galleryName = activeTab === 'photos' ? 'photo' : 'video';
  
  const filteredItems = itemsToDisplay.filter(item =>
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = useMemo(() => {
    if (sortOrder === 'asc') {
      return [...filteredItems].sort((a, b) => 
        (a.description || '').localeCompare(b.description || '')
      );
    }
    return filteredItems;
  }, [filteredItems, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'default' : 'asc'));
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans flex flex-col">
      <Header />
      <div className="flex-grow">
        <Hero />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center mb-8 border border-gray-800 rounded-full p-1 max-w-xs mx-auto bg-black/20 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('photos')}
              className={`w-1/2 py-2 px-4 rounded-full text-sm font-semibold transition-colors duration-300 ${activeTab === 'photos' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              Featured Waifu
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`w-1/2 py-2 px-4 rounded-full text-sm font-semibold transition-colors duration-300 ${activeTab === 'videos' ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              Video Collection
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-x-4 mb-8 max-w-xl mx-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="search"
                placeholder="Search descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-full py-2.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                aria-label="Search media by description"
              />
            </div>

            <button
              onClick={handleSortToggle}
              className={`flex-shrink-0 flex items-center gap-x-2 px-4 py-2.5 rounded-full border transition-colors duration-300 text-sm font-semibold
                ${sortOrder === 'asc'
                  ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:text-white hover:border-cyan-500'
                }`}
              aria-label="Sort by description from A to Z"
            >
              <SortAscendingIcon className="w-5 h-5" />
              <span>A-Z</span>
            </button>
          </div>

          {itemsToDisplay.length > 0 ? (
            filteredItems.length > 0 ? (
              <div className="text-center">
                <MediaGrid items={sortedItems} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[40vh] text-center animate-fade-in">
                <h2 className="text-3xl font-bold text-gray-400 mb-2">No Results Found</h2>
                <p className="text-lg text-gray-500">Your search for "<span className="font-semibold text-cyan-400">{searchQuery}</span>" did not match any items.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <h2 className="text-3xl font-bold text-gray-400 mb-2">No {galleryName}s yet.</h2>
              <p className="text-lg text-gray-500">Add {galleryName} data to gallery-data.ts to see them here.</p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;