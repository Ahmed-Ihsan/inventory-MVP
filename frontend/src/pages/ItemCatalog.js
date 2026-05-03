import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import ItemList from '../components/items/ItemList';
import Button from '../components/common/Button';
import { FaPrint, FaBoxes, FaPlus } from 'react-icons/fa';

const ItemCatalog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
        borderRadius: '24px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 20px 60px rgba(155,89,182,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        
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
            <FaBoxes />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, letterSpacing: '-0.03em', textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{t('items.catalog')}</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', marginTop: '0.35rem', fontWeight: 500 }}>استعرض وأدر جميع الأصناف في مخزونك</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', zIndex: 1 }}>
          <button 
            onClick={() => window.print()} 
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: '1px solid rgba(255,255,255,0.3)', 
              color: '#fff', 
              padding: '0.875rem 1.5rem', 
              borderRadius: '14px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontWeight: 600, 
              backdropFilter: 'blur(4px)', 
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FaPrint size={14} /> {t('common.print')}
          </button>
          <button 
            onClick={() => navigate('/items/new')} 
            style={{ 
              background: '#fff', 
              border: 'none', 
              color: '#9b59b6', 
              padding: '0.875rem 1.75rem', 
              borderRadius: '14px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontWeight: 700, 
              fontSize: '0.95rem', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
          >
            <FaPlus size={14} /> {t('items.addNewItem')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        background: 'var(--color-card-background)', 
        borderRadius: '24px', 
        border: '1px solid var(--color-border-light)', 
        boxShadow: '0 12px 40px rgba(0,0,0,0.08)', 
        padding: '2rem',
      }}>
        <ItemList />
      </div>
    </div>
  );
};

export default ItemCatalog;