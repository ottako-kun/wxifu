import React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'image';
  width?: string;
  height?: string;
}

/**
 * Skeleton Loader Component
 * Provides visual feedback during loading states
 * Uses shimmer animation for perceived performance
 */
export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'text',
  width,
  height 
}) => {
  const baseClasses = "skeleton animate-shimmer";
  
  const variantClasses = {
    text: "skeleton-text w-full",
    title: "skeleton-title",
    avatar: "skeleton-avatar",
    card: "skeleton-card",
    image: "w-full h-48",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

interface SkeletonCardProps {
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * Skeleton Card for Feed/Media Items
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  showAvatar = true, 
  showActions = true,
  className 
}) => {
  return (
    <div className={cn("p-4 space-y-3", className)}>
      {/* Header with Avatar */}
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/4" />
          </div>
        </div>
      )}
      
      {/* Media Placeholder */}
      <Skeleton variant="image" className="rounded-lg" />
      
      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-4 pt-2">
          <Skeleton variant="text" className="w-8 h-8 rounded-full" />
          <Skeleton variant="text" className="w-8 h-8 rounded-full" />
          <Skeleton variant="text" className="w-8 h-8 rounded-full" />
        </div>
      )}
      
      {/* Caption */}
      <div className="space-y-2 pt-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );
};

interface SkeletonProfileProps {
  className?: string;
}

/**
 * Skeleton Profile Header
 */
export const SkeletonProfile: React.FC<SkeletonProfileProps> = ({ className }) => {
  return (
    <div className={cn("p-6 text-center space-y-4", className)}>
      <Skeleton variant="avatar" className="w-24 h-24 mx-auto" />
      <Skeleton variant="title" className="w-48 mx-auto" />
      <Skeleton variant="text" className="w-32 mx-auto" />
      <div className="flex justify-center gap-8 pt-4">
        <div className="text-center">
          <Skeleton variant="text" className="w-12 mx-auto mb-1" />
          <Skeleton variant="text" className="w-16 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton variant="text" className="w-12 mx-auto mb-1" />
          <Skeleton variant="text" className="w-16 mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton variant="text" className="w-12 mx-auto mb-1" />
          <Skeleton variant="text" className="w-16 mx-auto" />
        </div>
      </div>
    </div>
  );
};

interface SkeletonListProps {
  count?: number;
  variant?: 'card' | 'list';
  className?: string;
}

/**
 * Skeleton List for Multiple Items
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 3, 
  variant = 'card',
  className 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="border border-white/5 rounded-lg" />
      ))}
    </div>
  );
};

export default Skeleton;
