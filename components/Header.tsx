import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-20 border-b border-pink-500/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gray-900 rounded border border-pink-500 overflow-hidden group cursor-pointer">
             <div className="absolute inset-0 bg-pink-500 opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <span className="text-pink-500 font-black text-xl leading-none select-none relative z-10">O</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white tracking-wider uppercase select-none leading-none" style={{ fontFamily: '"Orbitron", sans-serif', textShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}>
              OTTAKO<span className="text-cyan-400">.</span>KUN
            </h1>
            <span className="text-[0.6rem] text-gray-400 tracking-[0.2em] uppercase">Waifu Art Gallery</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
        </nav>
      </div>
    </header>
  );
};

export default Header;