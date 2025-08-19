import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: '✅',
          titleColor: 'text-green-800',
          messageColor: 'text-green-600',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: '❌',
          titleColor: 'text-red-800',
          messageColor: 'text-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: '⚠️',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-600',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'ℹ️',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-600',
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'ℹ️',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-600',
        };
    }
  };

  const styles = getToastStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.3 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`
            relative max-w-sm w-full ${styles.bg} border rounded-lg shadow-lg p-4 mb-3
            cursor-pointer hover:shadow-xl transition-shadow duration-200
          `}
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 text-lg mr-3">
              {styles.icon}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${styles.titleColor}`}>
                {title}
              </h4>
              <p className={`text-sm ${styles.messageColor} mt-1`}>
                {message}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
                setTimeout(() => onClose(id), 300);
              }}
              className={`ml-2 ${styles.titleColor} hover:opacity-70 transition-opacity`}
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
