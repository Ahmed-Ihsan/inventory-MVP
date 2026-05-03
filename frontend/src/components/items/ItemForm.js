import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';
import useFormValidation from '../../hooks/useFormValidation';

const validators = {
  name: (v) => !v?.trim() ? 'اسم العنصر مطلوب' : v.trim().length < 2 ? 'يجب أن يكون الاسم حرفين على الأقل' : '',
  sku: (v) => !v?.trim() ? 'رمز العنصر (SKU) مطلوب' : '',
  price: (v) => v === '' || v === undefined ? 'السعر مطلوب' : parseFloat(v) < 0 ? 'يجب أن يكون السعر صفرًا أو أكثر' : '',
  category_id: (v) => !v ? 'الفئة مطلوبة' : '',
};

const ItemForm = ({ item = null, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [existingSkus, setExistingSkus] = useState([]);
  const initializedRef = useRef(false);

  const { values, setValues, errors, handleChange, handleBlur, validateAll, isSubmitting, setIsSubmitting } = useFormValidation(
    { name: '', description: '', sku: '', price: 0, category_id: '', min_stock_level: 0, initial_stock: 0, supplier: '', unit_of_measure: 'piece', expiry_date: '', batch_number: '', cost_price: 0 },
    validators
  );

  const [profitMargin, setProfitMargin] = useState(0);

  // Calculate profit margin when cost or selling price changes
  useEffect(() => {
    const cost = parseFloat(values.cost_price) || 0;
    const selling = parseFloat(values.price) || 0;
    if (selling > 0) {
      const margin = ((selling - cost) / selling * 100).toFixed(2);
      setProfitMargin(parseFloat(margin));
    } else {
      setProfitMargin(0);
    }
  }, [values.cost_price, values.price]);

  useEffect(() => {
    loadCategories();
    loadExistingSkus();
  }, []);

  useEffect(() => {
    if (item && item.id && !initializedRef.current) {
      setValues({
        name: item.name || '',
        description: item.description || '',
        sku: item.sku || '',
        price: item.price || 0,
        category_id: item.category_id || '',
        min_stock_level: item.min_stock_level || 0,
        initial_stock: item.current_stock || 0,
        supplier: item.supplier || '',
        unit_of_measure: item.unit_of_measure || 'piece',
        expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().slice(0, 10) : '',
        batch_number: item.batch_number || '',
        cost_price: item.cost_price || 0,
      });
      initializedRef.current = true;
    } else if (!item) {
      initializedRef.current = false;
    }
  }, [item?.id, setValues]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadExistingSkus = async () => {
    try {
      const items = await apiService.getItems();
      setExistingSkus(items.map(i => i.sku));
    } catch (error) {
      console.error('Error loading SKUs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for duplicate SKU (skip check if editing same item)
    const isDuplicateSku = existingSkus.includes(values.sku) && (!item || item.sku !== values.sku);
    if (isDuplicateSku) {
      alert('هذا الرمز (SKU) مستخدم بالفعل. يرجى اختيار رمز آخر.');
      return;
    }
    
    if (!validateAll()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        ...values,
        price: parseFloat(values.price),
        cost_price: parseFloat(values.cost_price) || 0,
        current_stock: parseInt(values.initial_stock) || 0,
        category_id: values.category_id ? parseInt(values.category_id) : null,
        min_stock_level: parseInt(values.min_stock_level) || 0,
        expiry_date: values.expiry_date ? new Date(values.expiry_date).toISOString() : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        label={t('items.name')}
        name="name"
        type="text"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.name}
        required
        clearable
        placeholder="مثال: باراسيتامول 500 ملغ"
        help="أدخل اسم العنصر كما يظهر للمستخدمين"
      />

      <FormField
        label={t('items.description')}
        name="description"
        type="textarea"
        value={values.description}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={3}
        maxLength={300}
        showCount
      />

      <FormField
        label={t('items.sku')}
        name="sku"
        type="text"
        value={values.sku}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.sku}
        required
        clearable
        placeholder="مثال: PROD-001"
        help="رمز تعريف فريد للعنصر"
      />

      <FormField
        label={t('items.price')}
        name="price"
        type="number"
        value={values.price}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.price}
        required
        min="0"
        step="0.01"
        prefix="IQD"
      />

      <FormField
        label="سعر التكلفة"
        name="cost_price"
        type="number"
        value={values.cost_price}
        onChange={handleChange}
        onBlur={handleBlur}
        min="0"
        step="0.01"
        prefix="IQD"
        help="سعر الشراء أو التكلفة (اختياري)"
      />

      <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>هامش الربح:</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: '0.5rem', color: profitMargin >= 0 ? '#10b981' : '#ef4444' }}>{profitMargin}%</span>
        </div>
      </div>

      <FormField
        label={t('items.category')}
        name="category_id"
        type="select"
        value={values.category_id}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.category_id}
        required
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
        value={values.min_stock_level}
        onChange={handleChange}
        onBlur={handleBlur}
        min="0"
        required
        help="الحد الأدنى للمخزون — سيتم إرسال تنبيه عند الوصول إليه"
      />

      <FormField
        label="الكمية الأولية"
        name="initial_stock"
        type="number"
        value={values.initial_stock}
        onChange={handleChange}
        onBlur={handleBlur}
        min="0"
        help="الكمية الأولية عند إنشاء الصنف"
      />

      <FormField
        label="المورد"
        name="supplier"
        type="text"
        value={values.supplier}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="اسم المورد"
        help="المورد الذي يوفر هذا الصنف"
      />

      <FormField
        label="وحدة القياس"
        name="unit_of_measure"
        type="select"
        value={values.unit_of_measure}
        onChange={handleChange}
        onBlur={handleBlur}
      >
        <option value="piece">قطعة</option>
        <option value="kg">كيلوغرام</option>
        <option value="liter">لتر</option>
        <option value="box">صندوق</option>
        <option value="pack">عبوة</option>
        <option value="meter">متر</option>
      </FormField>

      <FormField
        label="تاريخ الصلاحية"
        name="expiry_date"
        type="date"
        value={values.expiry_date}
        onChange={handleChange}
        onBlur={handleBlur}
        help="تاريخ انتهاء الصلاحية (للأصناف القابلة للتلف)"
      />

      <FormField
        label="رقم الدفعة / اللوت"
        name="batch_number"
        type="text"
        value={values.batch_number}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="مثال: BATCH-001"
        help="رقم الدفعة لتتبع المنتجات"
      />

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <Button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="btn-primary" loading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;