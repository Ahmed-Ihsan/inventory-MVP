import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaReceipt, FaBolt, FaChevronRight, FaChevronLeft, FaCheck, FaTimes, FaArrowRight, FaPlus } from 'react-icons/fa';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';

const STEPS = ['العميل', 'الصنف', 'التسعير', 'الدفع', 'المراجعة'];

const INITIAL_VALUES = {
  customer_name: 'عميل نقدي',
  customer_phone: '',
  item_id: '',
  quantity: 1,
  cost_price: 0,
  selling_price: 0,
  payment_method: 'cash',
  notes: '',
};

const QuickInvoice = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animate, setAnimate] = useState('');
  const [profitMargin, setProfitMargin] = useState(0);
  const [itemSearch, setItemSearch] = useState('');

  // Filter items based on search
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(itemSearch.toLowerCase())
  );

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const itemsData = await apiService.getItems();
      console.log('Loaded items:', itemsData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading items:', error);
      addToast(t('salesInvoice.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfitMargin = (cost, selling) => {
    const margin = selling > 0 ? ((selling - cost) / selling * 100).toFixed(2) : 0;
    setProfitMargin(parseFloat(margin));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    
    if (name === 'cost_price' || name === 'selling_price') {
      calculateProfitMargin(
        name === 'cost_price' ? parseFloat(value) || 0 : values.cost_price,
        name === 'selling_price' ? parseFloat(value) || 0 : values.selling_price
      );
    }
  };

  const handleItemChange = (value) => {
    const selectedItem = items.find(i => String(i.id) === String(value));
    if (selectedItem) {
      setValues(prev => ({
        ...prev,
        item_id: String(value),
        cost_price: selectedItem.price || 0,
        selling_price: selectedItem.price || 0,
      }));
      calculateProfitMargin(selectedItem.price || 0, selectedItem.price || 0);
    }
  };

  const transition = (dir, fn) => {
    setAnimate(dir === 'next' ? 'slide-out-left' : 'slide-out-right');
    setTimeout(() => {
      fn();
      setAnimate(dir === 'next' ? 'slide-in-right' : 'slide-in-left');
      setTimeout(() => setAnimate(''), 250);
    }, 180);
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!values.customer_name?.trim()) newErrors.customer_name = 'اسم العميل مطلوب';
    }
    if (step === 2) {
      if (!values.item_id) newErrors.item_id = 'اختر الصنف';
    }
    if (step === 3) {
      if (!values.selling_price || parseFloat(values.selling_price) <= 0) {
        newErrors.selling_price = 'سعر البيع مطلوب';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    transition('next', () => setStep(s => s + 1));
  };

  const back = () => {
    setErrors({});
    transition('prev', () => setStep(s => s - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const invoiceData = {
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        items: [{
          item_id: values.item_id,
          item_name: items.find(i => String(i.id) === String(values.item_id))?.name || '',
          quantity: values.quantity,
          cost_price: values.cost_price,
          selling_price: values.selling_price,
          profit_margin: profitMargin,
          total_price: values.selling_price * values.quantity,
        }],
        total_amount: values.selling_price * values.quantity,
        paid_amount: values.payment_method === 'cash' ? values.selling_price * values.quantity : 0,
        remaining_amount: values.payment_method === 'cash' ? 0 : values.selling_price * values.quantity,
        payment_method: values.payment_method,
        notes: values.notes,
        invoice_date: new Date().toISOString(),
        status: values.payment_method === 'cash' ? 'completed' : 'pending',
      };

      await apiService.createSalesInvoice(invoiceData);
      addToast(t('salesInvoice.created'), 'success');
      navigate('/sales-invoice');
    } catch (error) {
      addToast(t('salesInvoice.errorSaving'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      numberingSystem: 'latn',
    }).format(amount);
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <>
          <FormField label="اسم العميل" name="customer_name" type="text" value={values.customer_name} onChange={handleChange} error={errors.customer_name} required clearable placeholder="أدخل اسم العميل" />
          <FormField label="رقم الهاتف" name="customer_phone" type="text" value={values.customer_phone} onChange={handleChange} placeholder="رقم الهاتف (اختياري)" />
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>اختر الصنف *</label>
              <button 
                type="button"
                onClick={() => navigate('/items/new', { state: { fromQuickInvoice: true } })}
                style={{ 
                  fontSize: '0.75rem', 
                  color: '#10b981', 
                  fontWeight: 600, 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <FaPlus size={10} /> إضافة صنف جديد
              </button>
            </div>
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder="ابحث باسم الصنف أو الرمز (SKU)..."
              style={{
                width: '100%',
                padding: '0.6rem 0.9rem',
                borderRadius: '12px',
                border: '1px solid var(--color-border-light)',
                background: 'var(--color-surface)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}
            />
            <select
              value={values.item_id}
              onChange={(e) => handleItemChange(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.7rem 1rem', 
                borderRadius: '12px', 
                border: errors.item_id ? '2px solid #ef4444' : '1px solid var(--color-border-light)', 
                background: 'var(--color-card-background)', 
                fontSize: '0.9rem',
                color: 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 0.75rem center',
                backgroundSize: '1.25rem',
                paddingLeft: '2.5rem',
              }}
              onMouseEnter={(e) => e.target.style.borderColor = errors.item_id ? '#ef4444' : '#10b981'}
              onMouseLeave={(e) => e.target.style.borderColor = errors.item_id ? '#ef4444' : 'var(--color-border-light)'}
            >
              <option value="" style={{ color: 'var(--color-text-muted)' }}>اختر الصنف من القائمة</option>
              {(filteredItems || []).map(i => <option key={String(i.id)} value={String(i.id)} style={{ color: 'var(--color-text)' }}>{i.name} ({i.sku})</option>)}
            </select>
            {errors.item_id && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>{errors.item_id}</div>}
          </div>
          <FormField label="الكمية" name="quantity" type="number" value={values.quantity} onChange={handleChange} min="1" />
        </>
      );
    }
    if (step === 3) {
      return (
        <>
          <FormField label="سعر التكلفة" name="cost_price" type="number" value={values.cost_price} onChange={handleChange} placeholder="0" />
          <FormField label="سعر البيع" name="selling_price" type="number" value={values.selling_price} onChange={handleChange} error={errors.selling_price} required placeholder="0" />
          <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>هامش الربح:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: '0.5rem', color: profitMargin >= 0 ? '#10b981' : '#ef4444' }}>{profitMargin}%</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>الإجمالي:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: '0.5rem', color: '#10b981' }}>{formatCurrency(values.selling_price * values.quantity)}</span>
            </div>
          </div>
        </>
      );
    }
    if (step === 4) {
      return (
        <>
          <FormField label="طريقة الدفع" name="payment_method" type="select" value={values.payment_method} onChange={handleChange}>
            <option value="cash">نقداً</option>
            <option value="card">بطاقة</option>
            <option value="credit">آجل</option>
          </FormField>
          <FormField label="ملاحظات" name="notes" type="textarea" value={values.notes} onChange={handleChange} rows={3} placeholder="أضف ملاحظات هنا..." />
        </>
      );
    }
    if (step === 5) {
      const skipKeys = new Set(['item_id', 'cost_price', 'notes']);
      const entries = Object.entries(values).filter(([k, v]) => !skipKeys.has(k) && v !== '' && v !== null && v !== undefined);
      const selectedItem = items.find(i => String(i.id) === String(values.item_id));
      return (
        <div style={{ padding: '1rem' }}>
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>راجع البيانات قبل الحفظ النهائي</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>العميل</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{values.customer_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>الصنف</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedItem?.name || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>الكمية</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{values.quantity}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>سعر البيع</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatCurrency(values.selling_price)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>الإجمالي</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{formatCurrency(values.selling_price * values.quantity)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>طريقة الدفع</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{values.payment_method === 'cash' ? 'نقداً' : values.payment_method === 'card' ? 'بطاقة' : 'آجل'}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page">
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 8px 32px rgba(16,185,129,0.28)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
          <FaBolt />
        </div>
        <div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>فاتورة سريعة</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            معالج خطوة بخطوة لإضافة فاتورة جديدة
          </p>
        </div>
      </div>

      {/* Wizard */}
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          {/* Progress bar */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {STEPS.map((label, i) => (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: step === i + 1 ? '#10b981' : step > i + 1 ? '#10b981' : 'var(--color-border-light)', color: step >= i + 1 ? '#fff' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                      {step > i + 1 ? <FaCheck size={10} /> : i + 1}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: step === i + 1 ? 700 : 500, color: step === i + 1 ? '#10b981' : step > i + 1 ? '#10b981' : 'var(--color-text-muted)' }}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: '2px', background: step > i + 1 ? '#10b981' : 'var(--color-border-light)', margin: '0 0.5rem' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '2rem', minHeight: '300px' }} className={`qe-anim-${animate}`}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>جاري التحميل...</div>
            ) : (
              renderStepContent()
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border-light)', display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={() => navigate('/sales-invoice')} className="btn-secondary">
              <span>إلغاء</span>
            </Button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {step > 1 && (
                <Button onClick={back} className="btn-secondary" disabled={isSubmitting}>
                  <FaChevronRight size={11} style={{ marginLeft: '4px' }} />
                  رجوع
                </Button>
              )}
              {step === STEPS.length ? (
                <Button onClick={handleSubmit} className="btn-success" loading={isSubmitting}>
                  <FaCheck size={11} style={{ marginLeft: '6px' }} />
                  إنشاء الفاتورة
                </Button>
              ) : (
                <Button onClick={next} className="btn-primary" disabled={isSubmitting}>
                  التالي
                  <FaChevronLeft size={11} style={{ marginRight: '4px' }} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/items/new')} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-light)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaPlus size={12} /> إضافة صنف جديد
          </button>
          <button onClick={() => navigate('/sales-invoice')} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-light)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaArrowRight size={12} /> عرض جميع الفواتير
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickInvoice;
