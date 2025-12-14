import React from 'react';

const Hero: React.FC = () => {
  return (
    <section
      className="relative flex items-center justify-center text-center text-white pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden"
    >
      {/* Abstract background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/10 to-[#0a0a0c] z-0 pointer-events-none"></div>

      {/* Grid overlay for cyber feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.5)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)] z-0 pointer-events-none opacity-50"></div>

      <div className="relative z-10 container mx-auto px-4 animate-fade-in">
        <div className="inline-flex items-center gap-x-2 mb-8 px-5 py-2 border border-pink-500/30 rounded-full bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.1)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
          <span className="text-pink-400 text-xs font-bold tracking-[0.2em] uppercase">Private Collection</span>
        </div>

        <h1
          className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-6"
          style={{ textShadow: '0 10px 30px rgba(236, 72, 153, 0.3)' }}
        >
          OTAKU<span className="text-cyan-500">-</span>X
        </h1>

        <div className="h-1.5 w-32 mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-10 rounded-full opacity-80"></div>

        <p className="text-lg md:text-2xl font-medium text-gray-200 tracking-wide mb-8 max-w-2xl mx-auto leading-relaxed">
          Are you a <span className="text-pink-400 font-bold">Nudist Waifu</span> who loves to share your Goddess body? Step into the <span className="text-cyan-400 font-bold">Spotlight</span>. Your Simps are <span className="text-purple-400 font-bold">Patiently Waiting</span>.
        </p>

        <p className="max-w-xl mx-auto text-sm md:text-base text-gray-400 leading-relaxed font-light mb-8">
         Browse a gallery of captivating visuals and sensual edits. Feel the pull of the spotlight… it’s ready for you to become our next featured waifu.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
            <span>Illustrations</span>
            <span className="text-pink-500">•</span>
            <span>Cosplay</span>
            <span className="text-cyan-500">•</span>
            <span>AMVs</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;