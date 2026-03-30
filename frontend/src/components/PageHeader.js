import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable back-button header used on Cart, Orders, RestaurantDetail pages.
 * - Tries navigate(-1) first (browser history)
 * - Falls back to "/" if no history exists
 */
const PageHeader = ({ title, right }) => {
  const navigate = useNavigate();

  const goBack = () => {
    // window.history.length <= 2 means no real previous page
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-4 bg-white border-b sticky top-0 z-40">
      <button
        onClick={goBack}
        className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
        aria-label="Go back"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="text-lg font-bold text-gray-900 flex-1">{title}</h1>
      {right && <div>{right}</div>}
    </div>
  );
};

export default PageHeader;
