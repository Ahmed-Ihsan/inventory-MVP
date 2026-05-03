import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaReceipt, FaBolt, FaChevronRight, FaChevronLeft, FaCheck, FaTimes, FaArrowRight, FaPlus, FaHistory } from 'react-icons/fa';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';

const STEPS = [
  { id: 1, title: 'معلومات العميل', icon: '👤' },
  { id: 2, title: 'الصنف', icon: '📦' },
  { id: 3, title: 'تفاصيل الأقساط', icon: '📅' },
  { id: 4, title: 'المراجعة', icon: '✅' },
];

const INITIAL_VALUES = {
  customer_name: '',
  customer_phone: '',
  item_id: '',
  quantity: 1,
  cost_price: 0,
  selling_price: 0,
  total_months: 12,
  down_payment: 0,
  monthly_payment: 0,
  notes: '',
};

const InstallmentSales = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animate, setAnimate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
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
      setItems(itemsData);
    } catch (error) {
      addToast(t('salesInvoice.errorLoading'), 'error');
    } finally {
      setLoading(false);
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
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Calculate totals when relevant fields change
    if (field === 'selling_price' || field === 'quantity') {
      const newTotal = (values.selling_price || 0) * (values.quantity || 1);
      setTotalAmount(newTotal);
    }
    
    if (field === 'total_months' || field === 'down_payment' || field === 'selling_price' || field === 'quantity') {
      const newTotal = (values.selling_price || 0) * (values.quantity || 1);
      const downPayment = field === 'down_payment' ? value : values.down_payment;
      const months = field === 'total_months' ? value : values.total_months;
      const remaining = newTotal - downPayment;
      const monthly = months > 0 ? remaining / months : 0;
      setMonthlyPayment(monthly);
    }
  };

  const transition = (direction, callback) => {
    setAnimate(direction);
    setTimeout(() => {
      callback();
      setTimeout(() => setAnimate(''), 300);
    }, 300);
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!values.customer_name.trim()) newErrors.customer_name = 'مطلوب';
    } else if (step === 2) {
      if (!values.item_id) newErrors.item_id = 'مطلوب';
      if (values.quantity < 1) newErrors.quantity = 'الكمية يجب أن تكون 1 على الأقل';
    } else if (step === 3) {
      if (!values.total_months || values.total_months < 1) newErrors.total_months = 'عدد الأشهر مطلوب';
      if (values.down_payment < 0) newErrors.down_payment = 'الدفعة الأولى لا يمكن أن تكون سالبة';
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
      const saleData = {
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        items: [{
          item_id: values.item_id,
          item_name: items.find(i => String(i.id) === String(values.item_id))?.name || '',
          quantity: values.quantity,
          cost_price: values.cost_price,
          selling_price: values.selling_price,
          profit_margin: ((values.selling_price - values.cost_price) / values.selling_price * 100).toFixed(2),
          total_price: values.selling_price * values.quantity,
        }],
        total_amount: totalAmount,
        down_payment: values.down_payment,
        remaining_amount: totalAmount - values.down_payment,
        monthly_payment: monthlyPayment,
        total_months: values.total_months,
        paid_months: 0,
        start_date: new Date().toISOString(),
        status: 'active',
        notes: values.notes,
      };

      await apiService.createInstallmentSale(saleData);
      addToast('تم إنشاء البيع بالأقساط بنجاح', 'success');
      navigate('/installment-sales');
    } catch (error) {
      addToast('خطأ في إنشاء البيع بالأقساط', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>اسم العميل *</label>
            <input
              type="text"
              value={values.customer_name}
              onChange={handleChange('customer_name')}
              placeholder="أدخل اسم العميل"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: errors.customer_name ? '2px solid #ef4444' : '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
            {errors.customer_name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>{errors.customer_name}</div>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>رقم الهاتف</label>
            <input
              type="text"
              value={values.customer_phone}
              onChange={handleChange('customer_phone')}
              placeholder="07XXXXXXXXX"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
          </div>
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
                onClick={() => navigate('/items/new', { state: { fromInstallmentSales: true } })}
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
              }}
            >
              <option value="">اختر الصنف من القائمة</option>
              {(filteredItems || []).map(i => <option key={String(i.id)} value={String(i.id)}>{i.name} ({i.sku})</option>)}
            </select>
            {errors.item_id && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>{errors.item_id}</div>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>الكمية *</label>
            <input
              type="number"
              value={values.quantity}
              onChange={handleChange('quantity')}
              min="1"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: errors.quantity ? '2px solid #ef4444' : '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
            {errors.quantity && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>{errors.quantity}</div>}
          </div>
        </>
      );
    }
    if (step === 3) {
      return (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>سعر البيع (IQD) *</label>
            <input
              type="number"
              value={values.selling_price}
              onChange={handleChange('selling_price')}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>عدد الأشهر *</label>
            <input
              type="number"
              value={values.total_months}
              onChange={handleChange('total_months')}
              min="1"
              max="60"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: errors.total_months ? '2px solid #ef4444' : '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
            {errors.total_months && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>{errors.total_months}</div>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>الدفعة الأولى (IQD)</label>
            <input
              type="number"
              value={values.down_payment}
              onChange={handleChange('down_payment')}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: errors.down_payment ? '2px solid #ef4444' : '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
            {errors.down_payment && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>{errors.down_payment}</div>}
          </div>
          <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border-light)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>الإجمالي:</span>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>{totalAmount.toLocaleString()} د.ع.</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>الدفعة الأولى:</span>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>{values.down_payment.toLocaleString()} د.ع.</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>المتبقي:</span>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>{(totalAmount - values.down_payment).toLocaleString()} د.ع.</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>القسط الشهري:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{monthlyPayment.toLocaleString()} د.ع.</span>
            </div>
          </div>
        </>
      );
    }
    if (step === 4) {
      const selectedItem = items.find(i => String(i.id) === String(values.item_id));
      return (
        <>
          <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '16px', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>مراجعة البيانات</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>العميل:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>{values.customer_name}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>الهاتف:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>{values.customer_phone || '-'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>الصنف:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>{selectedItem?.name || '-'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>الكمية:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>{values.quantity}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>الإجمالي:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>{totalAmount.toLocaleString()} د.ع.</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>القسط الشهري:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem', color: '#10b981' }}>{monthlyPayment.toLocaleString()} د.ع.</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>عدد الأشهر:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>{values.total_months} شهر</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>الدفعة الأولى:</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>{values.down_payment.toLocaleString()} د.ع.</div>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="page">
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 8px 32px rgba(102,126,234,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
            <FaReceipt />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>بيع بالأقساط</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>إنشاء فاتورة بيع بالأقساط للزبائن</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', padding: '2rem' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            {STEPS.map((s, index) => (
              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: step >= s.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  color: step >= s.id ? '#fff' : 'var(--color-text-muted)',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  transition: 'all 0.3s ease',
                }}>
                  {step > s.id ? <FaCheck size={16} /> : s.icon}
                </div>
                <span style={{ fontSize: '0.75rem', color: step >= s.id ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: 600 }}>{s.title}</span>
              </div>
            ))}
          </div>
          <div style={{ height: '4px', background: 'var(--color-surface)', borderRadius: '2px', position: 'relative' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '2px',
              width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Form Content */}
        <div style={{
          opacity: animate ? 0 : 1,
          transform: animate === 'next' ? 'translateX(20px)' : animate === 'prev' ? 'translateX(-20px)' : 'translateX(0)',
          transition: 'all 0.3s ease',
        }}>
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--color-border-light)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              <FaChevronRight size={14} /> السابق
            </button>
          ) : <div />}
          
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              التالي <FaChevronLeft size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'تأكيد وحفظ'} <FaCheck size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallmentSales;
