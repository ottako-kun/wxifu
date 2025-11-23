import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-20 border-b border-pink-500/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Title - now clickable */}
        <a href="/" className="flex items-center gap-x-3 group cursor-pointer">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gray-900 rounded border border-pink-500 overflow-hidden">
             <div className="absolute inset-0 bg-pink-500 opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <span className="text-pink-500 font-black text-xl leading-none select-none relative z-10">O</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white tracking-wider uppercase select-none leading-none" style={{ fontFamily: '"Orbitron", sans-serif', textShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}>
              OTTAKO<span className="text-cyan-400">.</span>KUN
            </h1>
            <span className="text-[0.6rem] text-gray-400 tracking-[0.2em] uppercase">Waifu Art Gallery</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/" className="text-gray-300 hover:text-pink-500 transition-colors font-medium text-lg tracking-wide">Home</a>
          <a href="/gallery" className="text-gray-300 hover:text-pink-500 transition-colors font-medium text-lg tracking-wide">Gallery</a>
          <a href="/about" className="text-gray-300 hover:text-pink-500 transition-colors font-medium text-lg tracking-wide">About</a>
          <a href="/contact" className="text-gray-300 hover:text-pink-500 transition-colors font-medium text-lg tracking-wide">Contact</a>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            aria-label="Open mobile menu"
            className="text-gray-300 hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-md p-2 transition-colors"
            // You would typically add an onClick handler here to toggle a mobile menu state
            // onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {/* Hamburger icon (SVG) */}
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;