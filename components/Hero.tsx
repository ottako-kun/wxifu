import React from 'react';

const Hero: React.FC = () => {
  return (
    <section 
      className="relative flex items-center justify-center text-center text-white pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden"
    >
      {/* Abstract background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/10 to-black z-0 pointer-events-none"></div>
      
      {/* Grid overlay for cyber feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 animate-fade-in">
        <div className="inline-flex items-center gap-x-2 mb-6 px-4 py-1.5 border border-pink-500/30 rounded-full bg-black/50 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
          <span className="text-pink-400 text-xs md:text-sm font-bold tracking-widest uppercase">Private Collection</span>
        </div>
        
        <h1 
          className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-4" 
          style={{ fontFamily: '"Orbitron", sans-serif', textShadow: '4px 4px 0px #ec4899' }}
        >
          OTTAKO<span className="text-white">.</span>KUN
        </h1>
        
        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-pink-500 to-cyan-500 mb-8"></div>

        <p className="text-lg md:text-2xl font-medium text-gray-200 tracking-wide mb-8 max-w-2xl mx-auto">
          Step Into the <span className="text-cyan-400">Spotlight</span>, <span className="text-pink-500">Stunning Waifu.</span> & <span className="text-purple-400">Your Ottakos are waiting</span>.
        </p>
        
        <p className="max-w-xl mx-auto text-sm md:text-base text-gray-400 leading-relaxed font-light">
         Browse a gallery of captivating visuals and sensual edits. Feel the pull of the spotlight… it’s ready for you to become our next featured waifu.
        </p>
      </div>
    </section>
  );
};

export default Hero;
