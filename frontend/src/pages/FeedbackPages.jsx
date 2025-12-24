import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load feedback pages
const FeedbackForm = lazy(() => import('./FeedbackForm'));
const FeedbackList = lazy(() => import('./FeedbackList'));

const FeedbackPages = () => {
  return (
    <Routes>
      <Route path="new" element={<FeedbackForm />} />
      <Route path="list" element={<FeedbackList />} />
    </Routes>
  );
};

export default FeedbackPages;