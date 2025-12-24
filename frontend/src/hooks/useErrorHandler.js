import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { clearError } from '../store/slices/authSlice';

export const useErrorHandler = () => {
  const dispatch = useDispatch();

  const handleError = useCallback((error, customMessage = null) => {
    console.error('Error:', error);

    let message = customMessage;

    if (!message) {
      if (error?.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else {
        message = 'Une erreur inattendue s\'est produite';
      }
    }

    toast.error(message);

    // Clear auth errors from store
    dispatch(clearError());

    return message;
  }, [dispatch]);

  const handleSuccess = useCallback((message) => {
    toast.success(message);
  }, []);

  const handleInfo = useCallback((message) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
    });
  }, []);

  return {
    handleError,
    handleSuccess,
    handleInfo,
  };
};

export default useErrorHandler;