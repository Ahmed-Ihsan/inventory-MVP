import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaShoppingCart, FaBox, FaBarcode, FaReceipt, FaFileInvoice } from 'react-icons/fa';

const QuickAccessCards = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: FaReceipt, label: 'فاتورة سريعة', path: '/quick-invoice', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { icon: FaShoppingCart, label: 'بيع بالأقساط', path: '/installment-sales', color: '#667eea', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { icon: FaBox, label: 'إضافة صنف', path: '/items/new', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { icon: FaBarcode, label: 'مسح الباركود', path: '/scan', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { icon: FaFileInvoice, label: 'فاتورة بيع', path: '/sales-invoice', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>
        وصول سريع
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            style={{
              padding: '1.25rem',
              borderRadius: '16px',
              border: 'none',
              background: action.gradient,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              <action.icon />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessCards;
