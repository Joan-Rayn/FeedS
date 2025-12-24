import { useState, useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, confirmText = "Confirmer", cancelText = "Annuler", onConfirm, type = "info" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const typeStyles = {
    info: "bg-blue-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    success: "bg-green-500"
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className={`bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform ${isOpen ? 'scale-100' : 'scale-95'} transition-transform duration-300`}>
        <div className={`w-full h-1 ${typeStyles[type]} rounded-t-2xl mb-4`}></div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <div className="text-gray-700 mb-6">{children}</div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition duration-200 ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
              type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;