import React from 'react';
import { APP_CONFIG } from '../config';

const Hero: React.FC = () => {
  return (
    <section
      className="relative flex items-center justify-center text-center text-white pt-24 pb-12 md:pt-40 md:pb-24 overflow-hidden border-b border-pink-500/10"
    >
      {/* Dynamic Background with Animated Gradient */}
      <div className="absolute inset-0 bg-[#050505] z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-pink-900 via-purple-900 to-cyan-900 animate-gradient-xy"></div>
          
          {/* 3D Cyber Grid Animation */}
          <div className="cyber-grid opacity-30"></div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 z-1 pointer-events-none opacity-20 scanline"></div>

      <div className="relative z-10 container mx-auto px-4 animate-fade-in">
        <div className="inline-flex items-center gap-x-3 mb-6 px-5 py-2 border border-pink-500/30 rounded-full bg-black/60 backdrop-blur-md shadow-[0_0_25px_rgba(236,72,153,0.15)] hover:border-pink-500/60 transition-colors duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
          <span className="text-pink-400 text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase">{APP_CONFIG.hero.badge}</span>
        </div>

        <h1
          className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase mb-6 select-none glitch-text cursor-default"
          style={{ 
            textShadow: '0 0 40px rgba(236, 72, 153, 0.4), 0 0 10px rgba(6, 182, 212, 0.3)' 
          }}
        >
          {APP_CONFIG.name}<span className="text-cyan-500 mx-1">{APP_CONFIG.nameSuffix}</span>
        </h1>

        <div className="h-1 md:h-1.5 w-24 md:w-32 mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-8 rounded-full opacity-80 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>

        <p className="text-lg md:text-2xl font-medium text-gray-200 tracking-wide mb-6 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
           THE UNCENSORED <span className="text-pink-400 font-bold border-b border-pink-500/30 pb-0.5">CANVAS</span> FOR FREEDOM.
        </p>

        <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-400 leading-relaxed font-light mb-8 hidden md:block">
         {APP_CONFIG.hero.description}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[10px] md:text-xs font-semibold tracking-widest text-gray-500 uppercase">
            {APP_CONFIG.hero.tags.map((tag, i) => (
                <React.Fragment key={tag}>
                    <span className="hover:text-pink-400 transition-colors cursor-default border border-gray-800 bg-gray-900/50 px-3 py-1.5 rounded-md hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]">{tag}</span>
                </React.Fragment>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
