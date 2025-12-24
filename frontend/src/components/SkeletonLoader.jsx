import { memo } from 'react';

const SkeletonLoader = memo(({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
            <div className="p-4 border-b">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        );
    }
  };

  return renderSkeleton();
});

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;