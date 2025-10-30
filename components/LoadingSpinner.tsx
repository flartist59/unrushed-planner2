
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-start gap-4 justify-start mt-6">
      <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        AI
      </div>
      <div className="max-w-xl rounded-2xl p-4 bg-white border border-stone-200 rounded-bl-none">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-stone-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
          <div className="w-2.5 h-2.5 bg-stone-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
          <div className="w-2.5 h-2.5 bg-stone-500 rounded-full animate-pulse"></div>
          <span className="text-stone-600">Planning your perfect trip...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
