import { THEME_COLORS } from '@/lib/constants';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  color = THEME_COLORS.primary 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${className}`}
      style={{ borderColor: color }}
    />
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = '読み込み中...' }: LoadingPageProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}