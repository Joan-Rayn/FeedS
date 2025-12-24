import { useEffect } from 'react';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const typeStyles = {
    error: 'bg-red-500 border-red-600',
    success: 'bg-green-500 border-green-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-lg text-white ${typeStyles[type]} transform transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition duration-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;