import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../store/slices/authSlice';
import {
  Home,
  FileText,
  Users,
  BarChart3,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Plus
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Tableau de bord',
      icon: Home,
      roles: ['student', 'staff', 'admin']
    },
    {
      path: '/feedbacks',
      label: 'Feedbacks',
      icon: FileText,
      roles: ['student', 'staff', 'admin']
    }
  ];

  if (user?.role === 'student') {
    menuItems.push(
      {
        path: '/feedback/new',
        label: 'Nouveau feedback',
        icon: Plus,
        roles: ['student']
      }
    );
  }

  if (user?.role === 'admin') {
    menuItems.push(
      {
        path: '/users',
        label: 'Utilisateurs',
        icon: Users,
        roles: ['admin']
      },
      {
        path: '/admin',
        label: 'Administration',
        icon: Settings,
        roles: ['admin']
      }
    );
  }

  menuItems.push(
    {
      path: '/profile',
      label: 'Profil',
      icon: User,
      roles: ['student', 'staff', 'admin']
    }
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-lg border-r border-gray-100
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        w-64 flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">FeedS</h2>
                <p className="text-xs text-gray-500">ENSPD</p>
              </div>
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    onClick={onClose}
                  >
                    <IconComponent className={`
                      w-5 h-5 flex-shrink-0 transition-colors
                      ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                    `} />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">
                        {item.label}
                      </span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-3 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-gray-500 group-hover:text-red-600" />
            {!isCollapsed && (
              <span className="ml-3 font-medium">Déconnexion</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
