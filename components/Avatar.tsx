import React from 'react';

// Frame Definitions
export const FRAMES: Record<string, { css: string; label: string; price: number }> = {
    'none': { css: '', label: 'Default', price: 0 },
    'neon-pink': { 
        css: 'ring-2 ring-pink-500 shadow-[0_0_10px_#ec4899]', 
        label: 'Neon Pink', 
        price: 100 
    },
    'cyber-cyan': { 
        css: 'ring-2 ring-cyan-500 shadow-[0_0_10px_#06b6d4,inset_0_0_5px_#06b6d4]', 
        label: 'Cyber Cyan', 
        price: 100 
    },
    'gold-rush': { 
        css: 'ring-4 ring-yellow-500 shadow-[0_0_15px_#eab308] border-2 border-yellow-200', 
        label: 'Gold Rush', 
        price: 500 
    },
    'glitch': { 
        css: 'ring-2 ring-white shadow-[2px_0_0_#ef4444,-2px_0_0_#3b82f6]', 
        label: 'Glitch', 
        price: 300 
    },
    'royal': {
        css: 'ring-4 ring-purple-600 shadow-[0_0_20px_#9333ea]',
        label: 'Royal Void',
        price: 1000
    }
};

interface AvatarProps {
  src?: string;
  alt?: string;
  frame?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, frame, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-32 h-32 text-4xl',
    '2xl': 'w-40 h-40 text-5xl',
  };

  const frameStyle = frame && FRAMES[frame] ? FRAMES[frame].css : '';

  return (
    <div className={`relative inline-block ${className}`}>
        <div className={`
            ${sizeClasses[size]} 
            rounded-full bg-gray-800 flex items-center justify-center 
            overflow-hidden relative z-10
            ${frameStyle}
            transition-all duration-300
        `}>
            {src ? (
                <img src={src} alt={alt || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-gray-400">
                    {alt?.charAt(0).toUpperCase() || '?'}
                </div>
            )}
        </div>
        
        {/* Particle Effects for expensive frames could go here */}
        {frame === 'gold-rush' && (
             <div className="absolute inset-0 rounded-full animate-pulse border border-yellow-200/50 z-20 pointer-events-none"></div>
        )}
    </div>
  );
};

export default Avatar;