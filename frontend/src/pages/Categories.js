import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useCategories } from '../hooks/useCategories';
import { FaTags, FaPlus } from 'react-icons/fa';

const Categories = () => {
  const { t } = useTranslation();
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nameError, setNameError] = useState('');

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setIsEditing(false);
    setNameError('');
  };

  const handleAdd = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
    setIsEditing(true);
    setNameError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setNameError('اسم الفئة مطلوب'); return; }
    setIsSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await addCategory(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => resetForm();

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteCategory(confirmId);
    } finally {
      setIsDeleting(false);
      setConfirmId(null);
    }
  };

  const CAT_COLORS = ['#e74c3c','#9b59b6','#3498db','#2ecc71','#f39c12','#1abc9c','#e67e22','#e91e63'];

  return (
    <div className="page">
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 8px 32px rgba(231,76,60,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
            <FaTags />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('categories.management')}</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {categories.length} {t('categories.noCategories') === 'لا توجد فئات' ? 'فئة مسجلة' : 'categories'} · أضف ودر فئات الأصناف
            </p>
          </div>
        </div>
        {!isEditing && (
          <button onClick={handleAdd} style={{ background: '#fff', border: 'none', color: '#e74c3c', padding: '0.6rem 1.4rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <FaPlus size={13} /> {t('categories.addNew')}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isEditing && (
        <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '2px solid #e74c3c40', boxShadow: '0 4px 24px rgba(231,76,60,0.1)', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#e74c3c18', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {editingId ? <FaTags size={14} /> : <FaPlus size={14} />}
            </div>
            <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>
              {editingId ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </h3>
          </div>
          <form onSubmit={handleSave} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <FormField
                  label={t('categories.name')}
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setNameError(''); }}
                  error={nameError}
                  required
                  clearable
                  placeholder="أدخل اسم الفئة"
                />
              </div>
              <div>
                <FormField
                  label={t('categories.description')}
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف اختياري للفئة"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button type="button" onClick={handleCancel} className="btn-secondary" disabled={isSaving}>{t('common.cancel')}</Button>
              <Button type="submit" className="btn-primary" loading={isSaving}>{t('common.save')}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid/Table */}
      <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>{t('common.loading')}</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '18px', background: '#e74c3c12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#e74c3c', margin: '0 auto 1.25rem' }}><FaTags /></div>
            <h3 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem' }}>لا توجد فئات بعد</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>أضف أول فئة لتنظيم مخزونك</p>
            <button onClick={handleAdd} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaPlus size={12} /> {t('categories.addNew')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--color-border-light)' }}>
            {categories.map((category, i) => (
              <div key={category.id} style={{ background: 'var(--color-card-background)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: CAT_COLORS[i % CAT_COLORS.length] + '18', color: CAT_COLORS[i % CAT_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                  {category.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{category.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{category.description || '—'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => handleEdit(category)} style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✏️</button>
                  <button onClick={() => setConfirmId(category.id)} style={{ width: 32, height: 32, borderRadius: '8px', background: '#e74c3c12', border: '1px solid #e74c3c30', color: '#e74c3c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmId}
        title="حذف الفئة"
        message="هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
};

export default Categories;