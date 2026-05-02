
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { MediaItem, Session } from '../types';
import MediaCard from './MediaCard';
// Fixed: Session import already moved to types.ts above
import MediaGridSkeleton from './skeletons/MediaGridSkeleton';
import { useUI } from '../context/UIContext';

interface MediaGridProps {
  items: MediaItem[];
  onUserClick?: (user: { id: string; name: string; avatar: string }) => void;
  session?: Session | null;
  onDataChange?: () => void;
  isLoading?: boolean; 
  onItemClick?: (index: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const MediaGrid: React.FC<MediaGridProps> = ({ items, onUserClick, session, onDataChange, isLoading, onItemClick }) => {
  const { density } = useUI();

  const columnClass = useMemo(() => {
    switch (density) {
      case 'compact':
        // Mobile: 3 columns, Desktop (XL): 12 columns
        return "columns-3 sm:columns-4 md:columns-6 lg:columns-8 xl:columns-12";
      case 'large':
        // Mobile: 1 column, Desktop (XL): 5 columns
        return "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5";
      case 'standard':
      default:
        // Mobile: 2 columns, Desktop (XL): 8 columns
        return "columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8";
    }
  }, [density]);

  if (isLoading && items.length === 0) {
      return <MediaGridSkeleton />;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`${columnClass} gap-2 md:gap-4 space-y-2 md:space-y-4 pb-20 transition-all duration-500`}
    >
    {items.map((item, index) => (
        <motion.div key={item.id} variants={itemVariants}>
          <MediaCard 
              item={item} 
              onClick={() => onItemClick && onItemClick(index)}
              onUserClick={onUserClick}
              session={session || null}
              onDataChange={onDataChange}
          />
        </motion.div>
    ))}
    </motion.div>
  );
};

export default React.memo(MediaGrid);
