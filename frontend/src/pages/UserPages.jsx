import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load user pages
const Profile = lazy(() => import('./Profile'));

const UserPages = () => {
  return (
    <Routes>
      <Route index element={<Profile />} />
    </Routes>
  );
};

export default UserPages;