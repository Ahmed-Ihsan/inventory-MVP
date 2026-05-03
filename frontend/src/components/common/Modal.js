import React, { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = { sm: '420px', md: '600px', lg: '800px', xl: '1000px' };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content"
        style={{ maxWidth: sizeStyles[size] || sizeStyles.md }}
        onClick={(e) => e.stopPropagation()}
        ref={contentRef}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق النافذة">×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;