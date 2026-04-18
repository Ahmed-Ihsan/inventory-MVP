import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';

const ItemForm = ({ item = null, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    category_id: '',
    min_stock_level: 0,
  });
  const initializedRef = useRef(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (item && item.id && !initializedRef.current) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        sku: item.sku || '',
        price: item.price || 0,
        category_id: item.category_id || '',
        min_stock_level: item.min_stock_level || 0,
      });
      initializedRef.current = true;
    } else if (!item) {
      initializedRef.current = false;
    }
  }, [item?.id]);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      price: parseFloat(formData.price),
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      min_stock_level: parseInt(formData.min_stock_level),
    };
    onSave(submissionData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label={t('items.name')}
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
        help="أدخل اسم العنصر كما يظهر للمستخدمين"
      />

      <FormField
        label={t('items.description')}
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        rows={3}
      />

      <FormField
        label={t('items.sku')}
        name="sku"
        type="text"
        value={formData.sku}
        onChange={handleChange}
        required
        help="رمز تعريف فريد للعنصر (مثل: PROD-001)"
      />

      <FormField
        label={t('items.price')}
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        required
        min="0"
        step="0.01"
      />

      <FormField
        label={t('items.category')}
        name="category_id"
        type="select"
        value={formData.category_id}
        onChange={handleChange}
      >
        <option value="">-- {t('common.select')} --</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </FormField>

      <FormField
        label={t('items.minStockLevel')}
        name="min_stock_level"
        type="number"
        value={formData.min_stock_level}
        onChange={handleChange}
        min="0"
        help="الحد الأدنى للمخزون - سيتم إرسال تنبيه عند الوصول إليه"
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

export default ItemForm;