
import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from './icons/LoadingSpinner';

interface ZoomableImageProps {
  src: string;
  alt: string;
  isUnlocked: boolean;
  onZoomChange?: (isZoomed: boolean) => void;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, isUnlocked, onZoomChange }) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Notify parent of zoom state
  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(transform.scale > 1);
    }
  }, [transform.scale, onZoomChange]);

  // --- ZOOM & PAN HANDLERS ---
  const handleWheel = (e: React.WheelEvent) => {
    if (!isUnlocked) return;
    
    const zoomIntensity = 0.1;
    const direction = Math.sign(e.deltaY) * -1;
    const scaleAmount = direction * zoomIntensity;
    
    const newScale = Math.min(Math.max(1, transform.scale + scaleAmount), 5);
    
    setTransform(prev => ({
      ...prev,
      scale: newScale,
      x: newScale === 1 ? 0 : prev.x,
      y: newScale === 1 ? 0 : prev.y
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isUnlocked || transform.scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    e.preventDefault();
    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    setTransform(prev => ({ ...prev, x, y }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // --- TOUCH HANDLERS (Pinch & Pan) ---
  const getTouchDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isUnlocked) return;

    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      pinchStartRef.current = { dist, scale: transform.scale };
    } else if (e.touches.length === 1 && transform.scale > 1) {
      // If we are zoomed in, prevent the swipe behavior of the parent
      e.stopPropagation();
      dragStartRef.current = { 
          x: e.touches[0].clientX - transform.x, 
          y: e.touches[0].clientY - transform.y 
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isUnlocked) return;

    if (e.touches.length === 2 && pinchStartRef.current) {
      e.stopPropagation();
      e.preventDefault();
      
      const dist = getTouchDistance(e.touches);
      const scaleChange = dist / pinchStartRef.current.dist;
      const newScale = Math.min(Math.max(1, pinchStartRef.current.scale * scaleChange), 5);
      
      setTransform(prev => ({ ...prev, scale: newScale }));
    } else if (e.touches.length === 1 && transform.scale > 1 && dragStartRef.current) {
      e.stopPropagation();
      const x = e.touches[0].clientX - dragStartRef.current.x;
      const y = e.touches[0].clientY - dragStartRef.current.y;
      setTransform(prev => ({ ...prev, x, y }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    pinchStartRef.current = null;
  };

  const handleZoomClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (!isUnlocked) return;

    if (transform.scale > 1) {
      setTransform({ scale: 1, x: 0, y: 0 });
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const targetScale = 2.5;
      
      setTransform({
        scale: targetScale,
        x: (rect.width / 2 - x) * 2,
        y: (rect.height / 2 - y) * 2
      });
    }
  };

  if (hasError) {
      return (
          <div className="flex flex-col items-center justify-center h-full w-full text-gray-500 bg-gray-900/50 rounded-lg border border-gray-800 border-dashed p-8 text-center">
              <span className="text-4xl mb-4">⚠️</span>
              <span className="text-sm uppercase font-bold text-gray-400">Broken Link</span>
              <span className="text-xs text-gray-600 mt-2">The source image could not be loaded.</span>
          </div>
      );
  }

  return (
    <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center relative touch-none overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      {isLoading && (
         <div className="absolute inset-0 flex items-center justify-center z-0">
             <LoadingSpinner className="w-10 h-10 text-pink-500" />
         </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`max-h-full max-w-full object-contain select-none transition-transform duration-100 ease-out relative z-10
            ${!isUnlocked ? 'blur-3xl opacity-30 grayscale' : ''}
            ${isDragging ? 'cursor-grabbing' : transform.scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'}
        `}
        onClick={handleZoomClick}
        style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
        draggable={false}
        onError={() => {
            setHasError(true);
            setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default ZoomableImage;
