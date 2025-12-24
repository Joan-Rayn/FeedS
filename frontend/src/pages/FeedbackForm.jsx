import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createFeedback } from '../store/slices/feedbackSlice';
import Layout from '../components/Layout';
import { Input, Textarea, Button, Spinner } from '../components/design-system';
import { FileText, Upload, X, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Validation schema
const schema = yup.object({
  title: yup.string().required('Le titre est requis').min(5, 'Le titre doit contenir au moins 5 caractères').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: yup.string().required('La description est requise').min(10, 'La description doit contenir au moins 10 caractères').max(1000, 'La description ne peut pas dépasser 1000 caractères'),
  priority: yup.string().oneOf(['low', 'medium', 'high'], 'Priorité invalide').default('medium'),
}).required();

const FeedbackForm = () => {
  const [attachments, setAttachments] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.feedback);
  const { isAuthenticated } = useSelector(state => state.auth);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      priority: 'medium'
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error('Erreur lors de la création du feedback');
    }
  }, [error]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      // Create feedback first
      const result = await dispatch(createFeedback(data));
      
      if (result.meta.requestStatus === 'fulfilled') {
        const feedbackId = result.payload.id;
        
        // Upload attachments if any
        if (attachments.length > 0) {
          const uploadPromises = attachments.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            
            try {
              const token = localStorage.getItem('token');
              const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/feedbacks/${feedbackId}/upload`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: formData
              });
              
              if (!response.ok) {
                console.error(`Failed to upload ${file.name}`);
              }
            } catch (error) {
              console.error(`Error uploading ${file.name}:`, error);
            }
          });
          
          await Promise.all(uploadPromises);
        }
        
        toast.success('Feedback créé avec succès !');
        navigate('/feedbacks');
      }
    } catch (error) {
      toast.error('Erreur lors de la création du feedback');
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Créer un nouveau feedback
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Partagez votre retour ou signalez un problème
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre du feedback *
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Résumez votre feedback en quelques mots"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description détaillée *
              </label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Décrivez votre feedback en détail. Plus vous serez précis, plus nous pourrons vous aider efficacement."
                {...register('description')}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priorité
              </label>
              <select
                id="priority"
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
              {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pièces jointes (optionnel)
              </label>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Glissez-déposez vos fichiers ici ou{' '}
                    <label className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer font-medium">
                      parcourez
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Formats acceptés: Images, PDF, Documents (max 10MB par fichier)
                  </p>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs font-medium text-gray-900 dark:text-white">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/feedbacks')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || Object.keys(errors).length > 0}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                Conseils pour un feedback efficace
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-0.5">
                <li>• Soyez précis et concis dans votre description</li>
                <li>• Fournissez des détails qui aideront à comprendre le problème</li>
                <li>• Ajoutez des captures d'écran si nécessaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeedbackForm;
