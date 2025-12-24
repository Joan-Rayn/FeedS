import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, Suspense, lazy, memo } from 'react';
import { getCurrentUser } from './store/slices/authSlice';
import OfflineBanner from './components/OfflineBanner';
import SkeletonLoader from './components/SkeletonLoader';
import './App.css';

// Lazy loading des composants
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const FeedbackForm = lazy(() => import('./pages/FeedbackForm'));
const FeedbackList = lazy(() => import('./pages/FeedbackList'));
const FeedbackDetail = lazy(() => import('./pages/FeedbackDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const PasswordRecovery = lazy(() => import('./pages/PasswordRecovery'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ServerError = lazy(() => import('./pages/ServerError'));

const PrivateRoute = memo(({ children, roles }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si des rôles sont spécifiés, vérifier les permissions
  if (roles && roles.length > 0) {
    if (!user || !roles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
});

PrivateRoute.displayName = 'PrivateRoute';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <OfflineBanner />
      <div className="min-h-screen bg-gray-50">
        <Suspense
          fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <SkeletonLoader type="card" />
                <p className="mt-4 text-gray-600" aria-live="polite">
                  Chargement de l'application...
                </p>
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminPanel />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute roles={['admin']}>
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute roles={['admin']}>
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/feedback/new"
              element={
                <PrivateRoute>
                  <FeedbackForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/feedbacks"
              element={
                <PrivateRoute>
                  <FeedbackList />
                </PrivateRoute>
              }
            />
            <Route
              path="/feedbacks/:id"
              element={
                <PrivateRoute>
                  <FeedbackDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            
            <Route path="/500" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default memo(App);
