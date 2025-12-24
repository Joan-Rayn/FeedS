import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load dashboard pages
const Dashboard = lazy(() => import('./Dashboard'));

const DashboardPages = () => {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
    </Routes>
  );
};

export default DashboardPages;