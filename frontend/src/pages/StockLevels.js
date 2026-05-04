import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaWarehouse, FaBox, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

const StockLevels = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStockLevels = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStockLevels();
      setStockLevels(data);
    } catch (error) {
      addToast('خطأ في تحميل مستويات المخزون', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockLevels();
  }, []);

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const columns = [
    { header: 'الصنف', accessor: 'name', sortable: true },
    { header: 'SKU', accessor: 'sku', sortable: true },
    { header: 'الفئة', accessor: 'category_name', sortable: true },
    { header: 'السعر', accessor: 'price', sortable: true, render: (row) => formatCurrency(row.price) },
    { header: 'المخزون الحالي', accessor: 'current_stock', sortable: true },
    { header: 'الحد الأدنى', accessor: 'min_stock_level', sortable: true },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => {
        const isLowStock = row.current_stock <= row.min_stock_level;
        return isLowStock ? (
          <span style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <FaExclamationCircle size={12} /> منخفض
          </span>
        ) : (
          <span style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
            متاح
          </span>
        );
      },
    },
  ];

  const lowStockCount = stockLevels.filter(item => item.current_stock <= item.min_stock_level).length;
  const totalItems = stockLevels.length;

  return (
    <div className="page">
      <div style={{
        background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
        borderRadius: '24px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 20px 60px rgba(26,188,156,0.3)',
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
            <FaWarehouse />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>مستويات المخزون</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {totalItems} صنف · {lowStockCount} منخفض المخزون
            </p>
          </div>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div style={{
          padding: '1.25rem 1.75rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 12px 40px rgba(239,68,68,0.3)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FaExclamationTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              تنبيه: {lowStockCount} صنف منخفض المخزون
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.95 }}>
              يرجى إعادة تخزين الأصناف المنخفضة
            </p>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--color-card-background)',
        borderRadius: '28px',
        border: '1px solid var(--color-border-light)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        padding: '2.5rem',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>جاري التحميل...</div>
        ) : stockLevels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '18px', background: '#1abc9c15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#1abc9c', margin: '0 auto 1.25rem' }}>
              <FaBox />
            </div>
            <h3 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem' }}>لا توجد أصناف</h3>
          </div>
        ) : (
          <Table columns={columns} data={stockLevels} />
        )}
      </div>
    </div>
  );
};

export default StockLevels;
