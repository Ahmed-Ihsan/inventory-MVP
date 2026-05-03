import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ItemForm from '../components/items/ItemForm';
import Card from '../components/common/Card';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaPlus } from 'react-icons/fa';

const AddItem = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const handleSave = async (itemData) => {
    try {
      await apiService.createItem(itemData);
      addToast(t('items.itemAdded'), 'success');
      navigate('/items');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleCancel = () => {
    navigate('/items');
  };

  return (
    <div className="page">
      <div style={{
        background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
        borderRadius: '20px',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 8px 32px rgba(155,89,182,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
          <FaPlus />
        </div>
        <div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.1rem,2.5vw,1.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('items.addNewItem')}</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginTop: '0.2rem' }}>أضف صنفاً جديداً إلى كتالوج مخزونك</p>
        </div>
      </div>
      <div style={{ maxWidth: 700, background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', padding: '1.75rem' }}>
        <ItemForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default AddItem;