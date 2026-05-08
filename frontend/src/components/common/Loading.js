import React from 'react';
import { cn } from '../../lib/utils';

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-10 w-10 border-4',
  lg: 'h-14 w-14 border-4',
};

const Loading = ({ size = 'md' }) => {
  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
      <div
        className={cn(
          'rounded-full border-primary/20 border-t-primary animate-spin',
          sizeClasses[size]
        )}
      />
    </div>
  );
};

export default Loading;
