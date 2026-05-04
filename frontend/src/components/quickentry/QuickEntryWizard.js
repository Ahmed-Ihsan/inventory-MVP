import React, { useState, useEffect, useCallback } from 'react';
import {
  FaPlus, FaTimes, FaBox, FaShoppingCart, FaMoneyBillWave,
  FaChevronRight, FaChevronLeft, FaCheck, FaBolt,
} from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';

// ─── Config ────────────────────────────────────────────────────────────────────
const TYPES = {
  item: {
    key: 'item',
    label: 'إضافة صنف',
    icon: FaBox,
    color: '#00b4d8',
    steps: ['الأساسيات', 'المخزون', 'التسعير', 'المراجعة'],
  },
  purchase: {
    key: 'purchase',
    label: 'تسجيل مشتريات',
    icon: FaShoppingCart,
    color: '#2ecc71',
    steps: ['المورد', 'المبالغ', 'المراجعة'],
  },
  payment: {
    key: 'payment',
    label: 'تسجيل دفعة',
    icon: FaMoneyBillWave,
    color: '#f39c12',
    steps: ['الدفعة', 'التفاصيل', 'المراجعة'],
  },
};

const INITIAL = {
  item: { 
    name: '', 
    sku: '', 
    category_id: '', 
    description: '', 
    price: '', 
    min_stock_level: '0',
    cost_price: '0',
    initial_stock: '0',
    supplier: '',
    unit_of_measure: 'piece',
    expiry_date: '',
    batch_number: '',
  },
  purchase: {
    supplier_name: '',
    purchase_date: new Date().toISOString().slice(0, 16),
    description: '',
    total_amount: '',
    paid_amount: '0',
    payment_method: 'cash',
  },
  payment: {
    payment_type: 'debt',
    amount: '',
    item_id: '',
    description: '',
    transaction_date: new Date().toISOString().slice(0, 16),
    due_date: '',
    status: 'pending',
  },
};

const STEP_VALIDATORS = {
  item: [
    (v) => {
      const e = {};
      if (!v.name?.trim()) e.name = 'اسم الصنف مطلوب';
      if (!v.sku?.trim()) e.sku = 'الرمز (SKU) مطلوب';
      return e;
    },
    (v) => {
      const e = {};
      if (!v.initial_stock || v.initial_stock === '0') e.initial_stock = 'الكمية الأولية مطلوبة';
      return e;
    },
    (v) => {
      const e = {};
      if (v.price === '' || v.price === undefined) e.price = 'السعر مطلوب';
      else if (parseFloat(v.price) < 0) e.price = 'السعر لا يقل عن صفر';
      return e;
    },
    () => ({}),
  ],
  purchase: [
    (v) => {
      const e = {};
      if (!v.supplier_name?.trim()) e.supplier_name = 'اسم المورد مطلوب';
      return e;
    },
    (v) => {
      const e = {};
      if (!v.total_amount) e.total_amount = 'المبلغ الإجمالي مطلوب';
      else if (parseFloat(v.total_amount) <= 0) e.total_amount = 'يجب أن يكون المبلغ أكبر من صفر';
      return e;
    },
    () => ({}),
  ],
  payment: [
    (v) => {
      const e = {};
      if (!v.amount) e.amount = 'المبلغ مطلوب';
      else if (parseFloat(v.amount) <= 0) e.amount = 'يجب أن يكون المبلغ أكبر من صفر';
      return e;
    },
    () => ({}),
    () => ({}),
  ],
};

const REVIEW_LABELS = {
  name: 'الاسم', sku: 'الرمز', price: 'السعر', min_stock_level: 'الحد الأدنى',
  supplier_name: 'المورد', purchase_date: 'تاريخ الشراء',
  total_amount: 'الإجمالي', paid_amount: 'المدفوع', payment_method: 'طريقة الدفع',
  payment_type: 'نوع الدفعة', amount: 'المبلغ', transaction_date: 'تاريخ المعاملة',
  due_date: 'تاريخ الاستحقاق', status: 'الحالة',
  cost_price: 'سعر التكلفة', initial_stock: 'الكمية الأولية',
  supplier: 'المورد', unit_of_measure: 'وحدة القياس', expiry_date: 'تاريخ الانتهاء', batch_number: 'رقم الدفعة',
};

// ─── Component ─────────────────────────────────────────────────────────────────
const QuickEntryWizard = ({ isOpen, onClose, onOpen }) => {
  const { addToast } = useToast();
  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animate, setAnimate] = useState('');

  // Keyboard shortcut: Ctrl + Shift + Q
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
        e.preventDefault();
        onOpen();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onOpen, onClose]);

  // Scroll lock + load data
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    apiService.getCategories().then(setCategories).catch(() => {});
    apiService.getItems().then(setItems).catch(() => {});
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const close = useCallback(() => {
    onClose();
    setSelectedType(null);
    setStep(0);
    setValues({});
    setErrors({});
    setAnimate('');
  }, [onClose]);

  const transition = (dir, fn) => {
    setAnimate(dir === 'next' ? 'slide-out-left' : 'slide-out-right');
    setTimeout(() => {
      fn();
      setAnimate(dir === 'next' ? 'slide-in-right' : 'slide-in-left');
      setTimeout(() => setAnimate(''), 250);
    }, 180);
  };

  const selectType = (typeKey) => {
    transition('next', () => {
      setSelectedType(typeKey);
      setValues({ ...INITIAL[typeKey] });
      setErrors({});
      setStep(1);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const totalSteps = selectedType ? TYPES[selectedType].steps.length : 0;

  const next = () => {
    const stepIndex = step - 1;
    const validate = STEP_VALIDATORS[selectedType]?.[stepIndex];
    if (validate) {
      const errs = validate(values);
      if (Object.keys(errs).length) { setErrors(errs); return; }
    }
    setErrors({});
    transition('next', () => setStep((s) => s + 1));
  };

  const back = () => {
    setErrors({});
    if (step <= 1) {
      transition('prev', () => { setSelectedType(null); setStep(0); });
    } else {
      transition('prev', () => setStep((s) => s - 1));
    }
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      if (selectedType === 'item') {
        await apiService.createItem({
          ...values,
          price: parseFloat(values.price),
          cost_price: parseFloat(values.cost_price) || 0,
          current_stock: parseInt(values.initial_stock) || 0,
          category_id: values.category_id ? parseInt(values.category_id) : null,
          min_stock_level: parseInt(values.min_stock_level) || 0,
        });
        addToast('تمت إضافة الصنف بنجاح', 'success');
      } else if (selectedType === 'purchase') {
        await apiService.createPurchase({
          ...values,
          total_amount: parseFloat(values.total_amount),
          paid_amount: parseFloat(values.paid_amount) || 0,
          remaining_amount:
            parseFloat(values.total_amount) - (parseFloat(values.paid_amount) || 0),
          purchase_date: new Date(values.purchase_date).toISOString(),
          status: 'pending',
        });
        addToast('تم تسجيل المشتريات بنجاح', 'success');
      } else if (selectedType === 'payment') {
        await apiService.createPayment({
          ...values,
          amount: parseFloat(values.amount),
          item_id: values.item_id ? parseInt(values.item_id) : null,
          transaction_date: new Date(values.transaction_date).toISOString(),
          due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
        });
        addToast('تم تسجيل الدفعة بنجاح', 'success');
      }
      close();
    } catch (err) {
      addToast('فشل الحفظ: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step renderers ───────────────────────────────────────────────────────────
  const renderTypeSelect = () => (
    <div className="qe-type-grid">
      {Object.values(TYPES).map(({ key, label, icon: Icon, color }) => (
        <button key={key} className="qe-type-card" onClick={() => selectType(key)}>
          <div className="qe-type-icon" style={{ background: color + '1a', color }}>
            <Icon size={30} />
          </div>
          <span className="qe-type-label">{label}</span>
          <FaChevronLeft size={11} className="qe-type-arrow" />
        </button>
      ))}
    </div>
  );

  const renderItemStep = () => {
    if (step === 1) return (
      <>
        <FormField label="اسم الصنف" name="name" value={values.name} onChange={handleChange}
          error={errors.name} required clearable placeholder="مثال: أسبرين 500 ملغ" 
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="الرمز (SKU)" name="sku" value={values.sku} onChange={handleChange}
          error={errors.sku} required clearable placeholder="مثال: ASP-500"
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="الفئة" name="category_id" type="select" value={values.category_id} onChange={handleChange}
          style={{ marginBottom: '1.25rem' }}
        >
          <option value="">-- اختر الفئة --</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </FormField>
        <FormField label="الوصف" name="description" type="textarea" value={values.description}
          onChange={handleChange} rows={2} maxLength={200} showCount
          style={{ marginBottom: '1.25rem' }}
        />
      </>
    );
    if (step === 2) return (
      <>
        <FormField label="الكمية الأولية" name="initial_stock" type="number"
          value={values.initial_stock} onChange={handleChange} error={errors.initial_stock}
          required min="0" help="الكمية المتاحة في المخزون عند الإضافة"
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="المورد" name="supplier" value={values.supplier}
          onChange={handleChange} clearable placeholder="اسم المورد (اختياري)"
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="وحدة القياس" name="unit_of_measure" type="select"
          value={values.unit_of_measure} onChange={handleChange}
          style={{ marginBottom: '1.25rem' }}
        >
          <option value="piece">قطعة</option>
          <option value="box">علبة</option>
          <option value="bottle">زجاجة</option>
          <option value="pack">رزمة</option>
          <option value="kg">كيلوغرام</option>
          <option value="liter">لتر</option>
          <option value="unit">وحدة</option>
        </FormField>
        <FormField label="تاريخ الانتهاء" name="expiry_date" type="date"
          value={values.expiry_date} onChange={handleChange}
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="رقم الدفعة" name="batch_number" value={values.batch_number}
          onChange={handleChange} clearable placeholder="رقم الدفعة (اختياري)"
          style={{ marginBottom: '1.25rem' }}
        />
      </>
    );
    if (step === 3) return (
      <>
        <FormField label="سعر البيع" name="price" type="number" value={values.price}
          onChange={handleChange} error={errors.price} required min="0" step="0.01" prefix="IQD"
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="سعر التكلفة" name="cost_price" type="number"
          value={values.cost_price} onChange={handleChange} min="0" step="0.01" prefix="IQD"
          help="سعر الشراء من المورد"
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="الحد الأدنى للمخزون" name="min_stock_level" type="number"
          value={values.min_stock_level} onChange={handleChange} min="0"
          help="تنبيه تلقائي عند الوصول لهذا الحد"
          style={{ marginBottom: '1.25rem' }}
        />
      </>
    );
    return renderReview();
  };

  const renderPurchaseStep = () => {
    if (step === 1) return (
      <>
        <FormField label="اسم المورد" name="supplier_name" value={values.supplier_name}
          onChange={handleChange} error={errors.supplier_name} required clearable
          placeholder="اسم الشركة أو المورد"
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="تاريخ الشراء" name="purchase_date" type="datetime-local"
          value={values.purchase_date} onChange={handleChange} required
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="ملاحظات" name="description" type="textarea"
          value={values.description} onChange={handleChange} rows={2}
          style={{ marginBottom: '1.25rem' }}
        />
      </>
    );
    if (step === 2) return (
      <>
        <FormField label="المبلغ الإجمالي" name="total_amount" type="number"
          value={values.total_amount} onChange={handleChange} error={errors.total_amount}
          required min="0" step="0.01" prefix="IQD"
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="المبلغ المدفوع" name="paid_amount" type="number"
          value={values.paid_amount} onChange={handleChange} min="0" step="0.01" prefix="IQD"
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="طريقة الدفع" name="payment_method" type="select"
          value={values.payment_method} onChange={handleChange}
          style={{ marginBottom: '1.25rem' }}
        >
          <option value="cash">نقدي</option>
          <option value="installment">أقساط</option>
        </FormField>
        {values.total_amount !== '' && (
          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>المتبقي:</span>
            <strong style={{ 
              color: '#ef4444',
              fontSize: '1.1rem',
              fontWeight: 700,
            }}>
              {(parseFloat(values.total_amount || 0) - parseFloat(values.paid_amount || 0)).toLocaleString('ar-IQ')} IQD
            </strong>
          </div>
        )}
      </>
    );
    return renderReview();
  };

  const renderPaymentStep = () => {
    if (step === 1) return (
      <>
        <FormField label="نوع الدفعة" name="payment_type" type="select"
          value={values.payment_type} onChange={handleChange} required
          style={{ marginBottom: '1.25rem' }}
        >
          <option value="debt">دين</option>
          <option value="paid">مدفوع</option>
          <option value="credit">ائتمان</option>
        </FormField>
        <FormField label="المبلغ" name="amount" type="number" value={values.amount}
          onChange={handleChange} error={errors.amount} required min="0" step="0.01" prefix="IQD"
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="الصنف المرتبط (اختياري)" name="item_id" type="select"
          value={values.item_id} onChange={handleChange}
          style={{ marginBottom: '1.25rem' }}
        >
          <option value="">-- لا يوجد --</option>
          {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </FormField>
      </>
    );
    if (step === 2) return (
      <>
        <FormField label="تاريخ المعاملة" name="transaction_date" type="datetime-local"
          value={values.transaction_date} onChange={handleChange} required
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="تاريخ الاستحقاق" name="due_date" type="datetime-local"
          value={values.due_date} onChange={handleChange}
          style={{ marginBottom: '1.25rem' }}
        />
        <FormField label="الحالة" name="status" type="select"
          value={values.status} onChange={handleChange}
          style={{ marginBottom: '1.25rem' }}
        >
          <option value="pending">قيد الانتظار</option>
          <option value="completed">مكتمل</option>
          <option value="overdue">متأخر</option>
        </FormField>
        <FormField label="الوصف" name="description" type="textarea"
          value={values.description} onChange={handleChange} rows={2}
          style={{ marginBottom: '1.25rem' }}
        />
      </>
    );
    return renderReview();
  };

  const renderReview = () => {
    const skipKeys = new Set(['description', 'item_id', 'category_id', 'due_date']);
    const entries = Object.entries(values).filter(
      ([k, v]) => !skipKeys.has(k) && v !== '' && v !== null && v !== undefined
    );
    return (
      <div style={{
        padding: '1.5rem',
        borderRadius: '16px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-light)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border-light)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: `${accentColor}20`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaCheck size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>
              مراجعة البيانات
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              راجع البيانات قبل الحفظ النهائي
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {entries.map(([k, v]) => (
            <div key={k} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'var(--color-card-background)',
              border: '1px solid var(--color-border-light)',
            }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {REVIEW_LABELS[k] || k}
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {String(v)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (!selectedType) return renderTypeSelect();
    if (selectedType === 'item') return renderItemStep();
    if (selectedType === 'purchase') return renderPurchaseStep();
    if (selectedType === 'payment') return renderPaymentStep();
    return null;
  };

  const isLastStep = selectedType && step === totalSteps;
  const typeInfo = selectedType ? TYPES[selectedType] : null;
  const accentColor = typeInfo?.color || 'var(--color-accent)';

  return (
    <>
      {/* ── Wizard Overlay ── */}
      {isOpen && (
        <div 
          className="qe-overlay" 
          onClick={close} 
          role="dialog" 
          aria-modal="true" 
          aria-label="معالج الإدخال السريع"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div 
            className="qe-wizard" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              background: 'var(--color-card-background)',
              borderRadius: '24px',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s ease',
            }}
          >
            {/* Header */}
            <div 
              className="qe-header" 
              style={{ 
                padding: '1.75rem 2rem',
                borderBottom: '1px solid var(--color-border-light)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    backdropFilter: 'blur(8px)',
                  }}>
                    {typeInfo
                      ? <typeInfo.icon size={20} />
                      : <FaBolt size={20} />
                    }
                  </div>
                  <div>
                    <h2 style={{ 
                      margin: 0, 
                      color: '#fff', 
                      fontSize: '1.5rem', 
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                    }}>
                      {!selectedType ? 'إدخال سريع' : typeInfo.label}
                    </h2>
                    <p style={{ 
                      margin: 0, 
                      color: 'rgba(255,255,255,0.85)', 
                      fontSize: '0.85rem', 
                      marginTop: '0.25rem',
                      fontWeight: 500,
                    }}>
                      {!selectedType ? 'اختر نوع الإدخال' : `الخطوة ${step} من ${totalSteps}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={close} 
                  aria-label="إغلاق"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  }}
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {selectedType && (
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {TYPES[selectedType].steps.map((label, i) => (
                    <React.Fragment key={i}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1,
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: step > i + 1 ? accentColor : step === i + 1 ? accentColor : 'var(--color-surface)',
                          border: step === i + 1 ? `2px solid ${accentColor}` : '2px solid var(--color-border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: step > i + 1 || step === i + 1 ? '#fff' : 'var(--color-text-muted)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem',
                          transition: 'all 0.3s ease',
                        }}>
                          {step > i + 1 ? <FaCheck size={14} /> : <span>{i + 1}</span>}
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          color: step === i + 1 ? accentColor : 'var(--color-text-muted)',
                          fontWeight: step === i + 1 ? 600 : 400,
                        }}>
                          {label}
                        </span>
                      </div>
                      {i < TYPES[selectedType].steps.length - 1 && (
                        <div style={{
                          flex: 1,
                          height: '2px',
                          background: step > i + 1 ? accentColor : 'var(--color-border-light)',
                          margin: '0 0.5rem',
                          borderRadius: '1px',
                          transition: 'all 0.3s ease',
                        }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Body */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '2rem',
            }}>
              {!selectedType ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {Object.values(TYPES).map(({ key, label, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => selectType(key)}
                      style={{
                        padding: '2rem 1.5rem',
                        borderRadius: '20px',
                        border: '2px solid var(--color-border-light)',
                        background: 'var(--color-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = color;
                        e.currentTarget.style.background = `${color}10`;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 12px 32px ${color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border-light)';
                        e.currentTarget.style.background = 'var(--color-surface)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: `${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color,
                      }}>
                        <Icon size={24} />
                      </div>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                      }}>
                        {label}
                      </span>
                      <FaChevronLeft size={12} style={{ color: 'var(--color-text-muted)', marginTop: 'auto' }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`qe-body qe-anim-${animate}`}>
                  {renderStepContent()}
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedType && (
              <div style={{
                padding: '1.5rem 2rem',
                borderTop: '1px solid var(--color-border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
              }}>
                <Button 
                  type="button" 
                  onClick={back} 
                  className="btn-secondary" 
                  disabled={isSubmitting}
                  style={{
                    padding: '0.875rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border-light)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FaChevronRight size={12} />
                  {step === 1 ? 'تغيير النوع' : 'رجوع'}
                </Button>
                {isLastStep ? (
                  <Button 
                    type="button" 
                    onClick={submit} 
                    className="btn-success" 
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.875rem 2rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    <FaCheck size={14} />
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ البيانات'}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={next} 
                    className="btn-primary"
                    style={{
                      padding: '0.875rem 2rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
                    }}
                  >
                    التالي
                    <FaChevronLeft size={12} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QuickEntryWizard;
