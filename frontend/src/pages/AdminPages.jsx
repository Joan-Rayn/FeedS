import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load admin pages
const AdminPanel = lazy(() => import('./AdminPanel'));
const UserManagement = lazy(() => import('./UserManagement'));

const AdminPages = () => {
  return (
    <Routes>
      <Route index element={<AdminPanel />} />
      <Route path="users" element={<UserManagement />} />
    </Routes>
  );
};

export default AdminPages;