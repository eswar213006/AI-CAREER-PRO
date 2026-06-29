import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectShowAssistant, hideAssistant } from '../../store/aiAssistantSlice';

// Section card imports (lazy-loaded)
const ReviewCard = React.lazy(() => import('./sections/ReviewCard'));
const ExplainCard = React.lazy(() => import('./sections/ExplainCard'));
// Add other imports as needed

export const AIAssistantPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShowAssistant);

  // Close on ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(hideAssistant());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-end">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(hideAssistant())}
      />

      {/* Panel */}
      <div className="relative w-full lg:w-96 bg-white dark:bg-gray-900 rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none shadow-xl transition-transform transform translate-y-0 lg:translate-y-0 lg:translate-x-0">
        <div className="p-4 overflow-y-auto h-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">AI Assistant</h2>
          <React.Suspense fallback={<div className="text-center py-4">Loading...</div>}>
            <div className="space-y-4">
              <ReviewCard />
              <ExplainCard />
              {/* Add other section cards here */}
            </div>
          </React.Suspense>
        </div>
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          onClick={() => dispatch(hideAssistant())}
          aria-label="Close AI Assistant"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
