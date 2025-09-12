import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12'
};

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  message 
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div className={cn(
        "animate-spin rounded-full border-b-2",
        sizeClasses[size],
        className
      )} 
      style={{ borderColor: '#FF7F50' }}
      />
      {message && (
        <span className="ml-2 text-sm text-gray-600">{message}</span>
      )}
    </div>
  );
}

export function CenteredLoadingSpinner({ 
  size = 'lg', 
  className, 
  message = '読み込み中...',
  height = 'h-64'
}: LoadingSpinnerProps & { height?: string }) {
  return (
    <div className={cn("flex items-center justify-center", height)}>
      <div className="text-center">
        <LoadingSpinner size={size} className={className} />
        {message && (
          <p className="mt-4 text-lg text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}