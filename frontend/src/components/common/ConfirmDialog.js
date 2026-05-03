import React, { useEffect } from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaTrash } from 'react-icons/fa';
import Button from './Button';

/**
 * ConfirmDialog — accessible replacement for window.confirm()
 *
 * Usage:
 *   <ConfirmDialog
 *     isOpen={open}
 *     title="حذف العنصر"
 *     message="هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
 *     onConfirm={handleDelete}
 *     onCancel={() => setOpen(false)}
 *     variant="danger"
 *   />
 */
const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'danger',
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const icons = {
    danger: <FaTrash size={22} />,
    warning: <FaExclamationTriangle size={22} />,
    info: <FaInfoCircle size={22} />,
  };

  return (
    <div
      className="modal-overlay confirm-overlay"
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`confirm-icon-wrap confirm-icon-${variant}`}>
          {icons[variant] || icons.danger}
        </div>
        <h3 id="confirm-title" className="confirm-title">{title}</h3>
        <p id="confirm-message" className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <Button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={`btn-${variant}`}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
