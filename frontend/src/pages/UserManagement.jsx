import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/slices/userSlice';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Layout from '../components/Layout';
import { Button, Input, Select } from '../components/design-system';
import { Search, Plus, Edit, Trash2, User, Mail, Calendar, X, CheckCircle, AlertCircle } from 'lucide-react';

const userSchema = yup.object().shape({
  matricule: yup.string().required('Le matricule est requis'),
  nom: yup.string().required('Le nom est requis'),
  prenom: yup.string().required('Le prénom est requis'),
  date_naissance: yup.string().required('La date de naissance est requise'),
  email: yup.string().email('Email invalide').required('L\'email est requis'),
  password: yup.string().when('$isEditing', {
    is: false,
    then: (schema) => schema.min(6, 'Le mot de passe doit contenir au moins 6 caractères').required('Le mot de passe est requis'),
    otherwise: (schema) => schema.notRequired(),
  }),
  role: yup.string().oneOf(['etudiant', 'personnel', 'admin'], 'Rôle invalide').required('Le rôle est requis'),
});

const UserManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { users, loading, error } = useSelector(state => state.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForm = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      matricule: '',
      nom: '',
      prenom: '',
      date_naissance: '',
      email: '',
      password: '',
      role: 'etudiant',
    },
    context: { isEditing: false },
  });

  const editForm = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      matricule: '',
      nom: '',
      prenom: '',
      date_naissance: '',
      email: '',
      password: '',
      role: 'etudiant',
    },
    context: { isEditing: true },
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/dashboard');
    } else {
      console.log('Fetching users...');
      dispatch(fetchUsers());
    }
  }, [isAuthenticated, user, dispatch, navigate]);

  useEffect(() => {
    console.log('Users state changed:', { users: users.length, loading, error });
  }, [users, loading, error]);

  const handleCreateUser = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await dispatch(createUser(data));
      if (result.meta.requestStatus === 'fulfilled') {
        setShowCreateModal(false);
        createForm.reset();
        toast.success('Utilisateur créé avec succès');
      } else {
        toast.error(result.error?.message || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    const dateValue = user.date_naissance ? 
      (typeof user.date_naissance === 'string' ? user.date_naissance.split('T')[0] : new Date(user.date_naissance).toISOString().split('T')[0]) 
      : '';
    
    editForm.reset({
      matricule: user.matricule || '',
      nom: user.nom || '',
      prenom: user.prenom || '',
      date_naissance: dateValue,
      email: user.email || '',
      password: '',
      role: user.role || 'etudiant',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (data) => {
    setIsSubmitting(true);
    try {
      // Remove password if empty
      const updateData = { ...data };
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }
      
      const result = await dispatch(updateUser({ id: selectedUser.id, data: updateData }));
      if (result.meta.requestStatus === 'fulfilled') {
        setShowEditModal(false);
        setSelectedUser(null);
        editForm.reset();
        toast.success('Utilisateur mis à jour');
      } else {
        toast.error(result.error?.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const result = await dispatch(deleteUser(selectedUser.id));
      if (result.meta.requestStatus === 'fulfilled') {
        setShowDeleteModal(false);
        setSelectedUser(null);
        toast.success('Utilisateur supprimé');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.nom} ${user.prenom} ${user.email} ${user.matricule}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const badges = {
      etudiant: { label: 'Étudiant', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      personnel: { label: 'Personnel', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' }
    };
    const badge = badges[role] || badges.etudiant;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const UserFormFields = ({ form, isEditing }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Matricule *
          </label>
          <Input
            {...form.register('matricule')}
            placeholder="Ex: ADM001"
            className={form.formState.errors.matricule ? 'border-red-500' : ''}
          />
          {form.formState.errors.matricule && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.matricule.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rôle *
          </label>
          <select
            {...form.register('role')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="etudiant">Étudiant</option>
            <option value="personnel">Personnel</option>
            <option value="admin">Administrateur</option>
          </select>
          {form.formState.errors.role && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom *
          </label>
          <Input
            {...form.register('nom')}
            placeholder="Nom de famille"
            className={form.formState.errors.nom ? 'border-red-500' : ''}
          />
          {form.formState.errors.nom && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.nom.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prénom *
          </label>
          <Input
            {...form.register('prenom')}
            placeholder="Prénom"
            className={form.formState.errors.prenom ? 'border-red-500' : ''}
          />
          {form.formState.errors.prenom && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.prenom.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email *
        </label>
        <Input
          type="email"
          {...form.register('email')}
          placeholder="exemple@enspd.com"
          className={form.formState.errors.email ? 'border-red-500' : ''}
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date de naissance *
        </label>
        <Input
          type="date"
          {...form.register('date_naissance')}
          className={form.formState.errors.date_naissance ? 'border-red-500' : ''}
        />
        {form.formState.errors.date_naissance && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.date_naissance.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mot de passe {isEditing && '(Laisser vide pour ne pas modifier)'}
        </label>
        <Input
          type="password"
          {...form.register('password')}
          placeholder={isEditing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
          className={form.formState.errors.password ? 'border-red-500' : ''}
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
              Gestion des utilisateurs
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
            </p>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Erreur: {error.message || JSON.stringify(error)}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Debug: {users.length} utilisateurs chargés, {loading ? 'chargement...' : 'chargé'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel utilisateur</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les rôles</option>
              <option value="etudiant">Étudiants</option>
              <option value="personnel">Personnel</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Matricule</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Rôle</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold mr-2">
                            {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.nom} {user.prenom}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.date_naissance ? new Date(user.date_naissance).toLocaleDateString('fr-FR') : 'Date non renseignée'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-gray-900 dark:text-white">{user.matricule}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-gray-900 dark:text-white">{user.email}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors mr-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Créer un nouvel utilisateur">
        <form onSubmit={createForm.handleSubmit(handleCreateUser)}>
          <UserFormFields form={createForm} isEditing={false} />
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier l'utilisateur">
        <form onSubmit={editForm.handleSubmit(handleUpdateUser)}>
          <UserFormFields form={editForm} isEditing={true} />
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal && selectedUser} onClose={() => setShowDeleteModal(false)} title="Confirmer la suppression">
        <div className="text-center py-4">
          <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Êtes-vous sûr de vouloir supprimer cet utilisateur ?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {selectedUser?.prenom} {selectedUser?.nom} ({selectedUser?.matricule})
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </Layout>
  );
};

export default UserManagement;
