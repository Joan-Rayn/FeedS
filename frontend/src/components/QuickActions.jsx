import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Plus,
  FileText,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  User
} from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const actions = [
    {
      id: 'new-feedback',
      label: 'Nouveau feedback',
      description: 'Créer un nouveau feedback',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      roles: ['student', 'staff'],
      path: '/feedback/new'
    },
    {
      id: 'my-feedbacks',
      label: 'Mes feedbacks',
      description: 'Voir mes feedbacks',
      icon: FileText,
      color: 'bg-green-500 hover:bg-green-600',
      roles: ['student', 'staff'],
      path: '/feedbacks'
    },
    {
      id: 'manage-users',
      label: 'Gérer utilisateurs',
      description: 'Administration des utilisateurs',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600',
      roles: ['admin'],
      path: '/users'
    },
    {
      id: 'admin-panel',
      label: 'Administration',
      description: 'Panneau d\'administration',
      icon: Settings,
      color: 'bg-red-500 hover:bg-red-600',
      roles: ['admin'],
      path: '/admin'
    },
    {
      id: 'search',
      label: 'Recherche',
      description: 'Rechercher des feedbacks',
      icon: Search,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      roles: ['admin', 'personnel'],
      path: '/search'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Voir les notifications',
      icon: Bell,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      roles: ['student', 'staff', 'admin'],
      path: '/notifications'
    },
    {
      id: 'profile',
      label: 'Profil',
      description: 'Gérer mon profil',
      icon: User,
      color: 'bg-gray-500 hover:bg-gray-600',
      roles: ['student', 'staff', 'admin'],
      path: '/profile'
    }
  ];

  const userActions = actions.filter(action =>
    action.roles.includes(user?.role)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="group flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 text-center mb-1">
                {action.label}
              </h4>
              <p className="text-xs text-gray-500 text-center leading-tight">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;