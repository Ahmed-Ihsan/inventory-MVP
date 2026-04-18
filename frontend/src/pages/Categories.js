import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import { useCategories } from '../hooks/useCategories';

const Categories = () => {
  const { t } = useTranslation();
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setIsEditing(false);
  };

  const handleAdd = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await addCategory(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('categories.confirmDelete'))) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>{t('categories.management')}</h1>
        {!isEditing && (
          <Button onClick={handleAdd} className="btn-primary">
            {t('categories.addNew')}
          </Button>
        )}
      </div>

      {isEditing && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={handleSave}>
            <FormField
              label={t('categories.name')}
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormField
              label={t('categories.description')}
              name="description"
              type="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button type="button" onClick={handleCancel} className="btn-secondary">
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="btn-primary">
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            {t('categories.noCategories')}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('categories.name')}</th>
                <th>{t('categories.description')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        onClick={() => handleEdit(category)}
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        onClick={() => handleDelete(category.id)}
                        className="btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default Categories;