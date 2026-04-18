import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';

const CategoryForm = ({ category = null, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const initializedRef = useRef(false);

  useEffect(() => {
    if (category && category.id && !initializedRef.current) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
      initializedRef.current = true;
    } else if (!category) {
      initializedRef.current = false;
    }
  }, [category?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label={t('categories.name')}
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
        help="أدخل اسم الفئة كما يظهر للمستخدمين"
      />

      <FormField
        label={t('categories.description')}
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        rows={3}
      />

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <Button type="button" onClick={onCancel} className="btn-secondary">
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="btn-primary">
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;