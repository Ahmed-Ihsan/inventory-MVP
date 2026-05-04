import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaReceipt, FaBox, FaBarcode, FaShoppingCart } from 'react-icons/fa';

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: FaReceipt, label: 'فاتورة سريعة', path: '/quick-invoice', color: '#10b981' },
    { icon: FaShoppingCart, label: 'بيع بالأقساط', path: '/installment-sales', color: '#667eea' },
    { icon: FaBox, label: 'إضافة صنف', path: '/items/new', color: '#3b82f6' },
    { icon: FaBarcode, label: 'مسح الباركود', path: '/scan', color: '#f59e0b' },
  ];

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
          {actions.map((action, index) => (
            <button
              key={action.path}
              onClick={() => {
                navigate(action.path);
                setIsOpen(false);
              }}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: action.color,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                animation: `fadeIn 0.2s ease ${index * 0.05}s both`,
                fontSize: '0.875rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              <action.icon size={16} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: 'none',
          background: isOpen ? '#ef4444' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isOpen ? 'rotate(45deg) scale(1.1)' : 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? 'rotate(45deg) scale(1)' : 'scale(1)';
        }}
      >
        <FaPlus />
      </button>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FloatingActionButton;
