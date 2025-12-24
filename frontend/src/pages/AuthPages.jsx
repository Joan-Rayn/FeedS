import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load auth pages
const Login = lazy(() => import('./Login'));
const Register = lazy(() => import('./Register'));
const PasswordRecovery = lazy(() => import('./PasswordRecovery'));

const AuthPages = () => {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="password-recovery" element={<PasswordRecovery />} />
    </Routes>
  );
};

export default AuthPages;