interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function LoadingSpinner({ size = 'md', className = '', showText = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        role="status"
        className={`animate-spin rounded-full border-2 border-[#c5a059] border-t-transparent ${sizeClasses[size]} ${className}`}
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {showText && <p className="mt-2 text-sm text-gray-600">Loading...</p>}
    </div>
  );
}