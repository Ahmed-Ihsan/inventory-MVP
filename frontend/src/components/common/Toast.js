import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const iconMap = {
    success: <FaCheckCircle />,
    warning: <FaExclamationTriangle />,
    error: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
  };

  const colorMap = {
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-danger)',
    info: 'var(--color-info)',
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  return (
    <div
      className="toast"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'var(--color-card-background)',
        border: `2px solid ${colorMap[type]}`,
        borderRadius: 'var(--border-radius-md)',
        padding: '1rem',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1000,
        maxWidth: '300px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span style={{ color: colorMap[type], fontSize: '1.2rem' }}>
        {iconMap[type]}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-gray)',
          fontSize: '1.2rem',
        }}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;