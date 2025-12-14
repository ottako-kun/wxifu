import React from 'react';

const MediaGridSkeleton: React.FC = () => {
    return (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3 md:gap-4 space-y-3 md:space-y-4 pb-20">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-3 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 relative">
                     {/* Random height simulation */}
                     <div style={{ height: `${Math.floor(Math.random() * (300 - 150 + 1) + 150)}px` }} className="w-full bg-gray-800 animate-pulse relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer"></div>
                     </div>
                     <div className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-800 animate-pulse"></div>
                            <div className="h-3 w-20 bg-gray-800 rounded animate-pulse"></div>
                        </div>
                     </div>
                </div>
            ))}
        </div>
    );
};

export default MediaGridSkeleton;