import React from 'react';
import { SpinnerSize } from '@/types/types';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = SpinnerSize.MEDIUM,
  className = '',
}) => {
  const sizeClasses = {
    [SpinnerSize.SMALL]: 'w-4 h-4',
    [SpinnerSize.MEDIUM]: 'w-8 h-8',
    [SpinnerSize.LARGE]: 'w-12 h-12',
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <svg 
        className="animate-spin text-white" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default Spinner;