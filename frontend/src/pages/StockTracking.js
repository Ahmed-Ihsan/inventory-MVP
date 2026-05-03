import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import StockList from '../components/stock/StockList';
import Button from '../components/common/Button';
import { FaPrint, FaSync, FaWarehouse } from 'react-icons/fa';

const StockTracking = () => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page">
      <div style={{
        background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 8px 32px rgba(26,188,156,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
            <FaWarehouse />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('stock.tracking')}</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>تتبع مستويات المخزون والحركة للأصناف</p>
          </div>
        </div>
        <button onClick={handlePrint} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, backdropFilter: 'blur(4px)', fontSize: '0.875rem' }}>
          <FaPrint size={13} /> {t('common.print')}
        </button>
      </div>
      <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        <StockList />
      </div>
    </div>
  );
};

export default StockTracking;