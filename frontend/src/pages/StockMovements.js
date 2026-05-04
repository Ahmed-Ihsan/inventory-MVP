import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaExchangeAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StockMovements = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStockMovements();
      setMovements(data);
    } catch (error) {
      addToast('خطأ في تحميل حركات المخزون', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const filteredMovements = filter === 'all' 
    ? movements 
    : movements.filter(m => m.reason === filter);

  const columns = [
    { header: 'التاريخ', accessor: 'timestamp', render: (row) => new Date(row.timestamp).toLocaleDateString('ar-SA') },
    { header: 'الصنف', accessor: 'item_name' },
    { header: 'نوع الحركة', accessor: 'reason', render: (row) => (
      <span style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', background: row.reason === 'inbound' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
        {row.reason === 'inbound' ? <FaArrowDown size={12} /> : <FaArrowUp size={12} />}
        {row.reason === 'inbound' ? 'إدخال' : row.reason === 'outbound' ? 'إخراج' : 'تعديل'}
      </span>
    )},
    { header: 'الكمية', accessor: 'quantity_change' },
    { header: 'الملاحظات', accessor: 'notes', render: (row) => row.notes || '-' },
  ];

  return (
    <div className="page">
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        borderRadius: '24px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 20px 60px rgba(139,92,246,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 1 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}>
            <FaExchangeAlt />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>حركات المخزون</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              تتبع جميع عمليات إدخال وإخراج المخزون
            </p>
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--color-card-background)',
        borderRadius: '28px',
        border: '1px solid var(--color-border-light)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        padding: '2.5rem',
      }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'الكل', color: 'var(--color-primary)' },
            { key: 'inbound', label: 'إدخال', color: '#10b981' },
            { key: 'outbound', label: 'إخراج', color: '#ef4444' },
            { key: 'adjustment', label: 'تعديل', color: '#f59e0b' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: filter === key ? `2px solid ${color}` : '2px solid var(--color-border-light)',
                background: filter === key ? color + '20' : 'transparent',
                color: filter === key ? color : 'var(--color-text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>جاري التحميل...</div>
        ) : filteredMovements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h3 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem' }}>لا توجد حركات مخزون</h3>
          </div>
        ) : (
          <Table columns={columns} data={filteredMovements} />
        )}
      </div>
    </div>
  );
};

export default StockMovements;
