import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FaReceipt,
  FaBolt,
  FaChevronRight,
  FaChevronLeft,
  FaCheck,
  FaTimes,
  FaArrowRight,
  FaPlus,
  FaHistory,
  FaPrint,
} from 'react-icons/fa';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { Card as ShadcnCard, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

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
  const filteredItems = items.filter(
    (item) =>
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
    const selectedItem = items.find((i) => String(i.id) === String(value));
    if (selectedItem) {
      const sellingPrice = selectedItem.price || 0;
      const quantity = values.quantity || 1;
      const newTotal = sellingPrice * quantity;
      const downPayment = values.down_payment || 0;
      const months = values.total_months || 1;
      const remaining = newTotal - downPayment;
      setValues((prev) => ({
        ...prev,
        item_id: String(value),
        cost_price: selectedItem.price || 0,
        selling_price: sellingPrice,
      }));
      setTotalAmount(newTotal);
      setMonthlyPayment(months > 0 ? remaining / months : 0);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setValues((prev) => {
      const newValues = { ...prev, [field]: value };

      // Calculate derived values using the new state
      const sellingPrice = newValues.selling_price || 0;
      const quantity = newValues.quantity || 1;
      const newTotal = sellingPrice * quantity;

      if (field === 'selling_price' || field === 'quantity') {
        setTotalAmount(newTotal);
      }

      if (
        field === 'total_months' ||
        field === 'down_payment' ||
        field === 'selling_price' ||
        field === 'quantity'
      ) {
        const downPayment = newValues.down_payment || 0;
        const months = newValues.total_months || 1;
        const remaining = newTotal - downPayment;
        const monthly = months > 0 ? remaining / months : 0;
        setMonthlyPayment(monthly);
      }

      return newValues;
    });
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
      if (!values.total_months || values.total_months < 1)
        newErrors.total_months = 'عدد الأشهر مطلوب';
      if (values.down_payment < 0) newErrors.down_payment = 'الدفعة الأولى لا يمكن أن تكون سالبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    transition('next', () => setStep((s) => s + 1));
  };

  const back = () => {
    setErrors({});
    transition('prev', () => setStep((s) => s - 1));
  };

  const handlePrintAgreement = () => {
    const selectedItem = items.find((i) => String(i.id) === String(values.item_id));
    const printContent = `
      <html dir="${i18n.language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <title>اتفاقية بيع بالأقساط</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #ec4899; padding-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; color: #ec4899; }
          .date { margin: 10px 0; }
          .section { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .section-title { font-weight: bold; margin-bottom: 10px; color: #ec4899; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { font-size: 18px; font-weight: bold; margin: 5px 0; }
          .highlight { color: #10b981; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">اتفاقية بيع بالأقساط</div>
          <div class="date">التاريخ: ${new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</div>
        </div>
        <div class="section">
          <div class="section-title">معلومات العميل</div>
          <div class="info-row"><span>الاسم:</span><span>${values.customer_name}</span></div>
          ${values.customer_phone ? `<div class="info-row"><span>الهاتف:</span><span>${values.customer_phone}</span></div>` : ''}
        </div>
        <div class="section">
          <div class="section-title">معلومات الصنف</div>
          <div class="info-row"><span>الصنف:</span><span>${selectedItem?.name || '-'}</span></div>
          <div class="info-row"><span>الكمية:</span><span>${values.quantity}</span></div>
          <div class="info-row"><span>سعر البيع:</span><span>${totalAmount.toLocaleString()} د.ع.</span></div>
        </div>
        <div class="section">
          <div class="section-title">تفاصيل الأقساط</div>
          <div class="info-row"><span>الإجمالي:</span><span>${totalAmount.toLocaleString()} د.ع.</span></div>
          <div class="info-row"><span>الدفعة الأولى:</span><span>${values.down_payment.toLocaleString()} د.ع.</span></div>
          <div class="info-row"><span>المتبقي:</span><span>${(totalAmount - values.down_payment).toLocaleString()} د.ع.</span></div>
          <div class="info-row"><span>عدد الأشهر:</span><span>${values.total_months} شهر</span></div>
          <div class="info-row"><span class="highlight">القسط الشهري:</span><span class="highlight">${monthlyPayment.toLocaleString()} د.ع.</span></div>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Recalculate from current values to avoid stale state
      const computedTotal = (values.selling_price || 0) * (values.quantity || 1);
      const computedDownPayment = values.down_payment || 0;
      const computedRemaining = computedTotal - computedDownPayment;
      const computedMonthly =
        (values.total_months || 1) > 0 ? computedRemaining / (values.total_months || 1) : 0;
      const profitMargin =
        values.selling_price > 0
          ? (((values.selling_price - values.cost_price) / values.selling_price) * 100).toFixed(2)
          : 0;
      const saleData = {
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        items: [
          {
            item_id: parseInt(values.item_id) || null,
            item_name: items.find((i) => String(i.id) === String(values.item_id))?.name || '',
            quantity: values.quantity,
            cost_price: values.cost_price,
            selling_price: values.selling_price,
            profit_margin: parseFloat(profitMargin),
            total_price: computedTotal,
          },
        ],
        total_amount: computedTotal,
        down_payment: computedDownPayment,
        remaining_amount: computedRemaining,
        monthly_payment: computedMonthly,
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
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                marginBottom: '0.35rem',
                display: 'block',
              }}
            >
              اسم العميل *
            </label>
            <input
              type="text"
              value={values.customer_name}
              onChange={handleChange('customer_name')}
              placeholder="أدخل اسم العميل"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: errors.customer_name
                  ? '2px solid #ef4444'
                  : '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
            {errors.customer_name && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  fontWeight: 500,
                }}
              >
                {errors.customer_name}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                marginBottom: '0.35rem',
                display: 'block',
              }}
            >
              رقم الهاتف
            </label>
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <label
                style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
              >
                اختر الصنف *
              </label>
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
                  gap: '0.25rem',
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
                border: errors.item_id
                  ? '2px solid #ef4444'
                  : '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <option value="">اختر الصنف من القائمة</option>
              {(filteredItems || []).map((i) => (
                <option key={String(i.id)} value={String(i.id)}>
                  {i.name} ({i.sku})
                </option>
              ))}
            </select>
            {errors.item_id && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  fontWeight: 500,
                }}
              >
                {errors.item_id}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                marginBottom: '0.35rem',
                display: 'block',
              }}
            >
              الكمية *
            </label>
            <input
              type="number"
              value={values.quantity}
              onChange={handleChange('quantity')}
              min="1"
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: errors.quantity
                  ? '2px solid #ef4444'
                  : '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
            {errors.quantity && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  fontWeight: 500,
                }}
              >
                {errors.quantity}
              </div>
            )}
          </div>
        </>
      );
    }
    if (step === 3) {
      return (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                marginBottom: '0.35rem',
                display: 'block',
              }}
            >
              سعر البيع (IQD) *
            </label>
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
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                marginBottom: '0.35rem',
                display: 'block',
              }}
            >
              عدد الأشهر *
            </label>
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
                border: errors.total_months
                  ? '2px solid #ef4444'
                  : '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
            {errors.total_months && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  fontWeight: 500,
                }}
              >
                {errors.total_months}
              </div>
            )}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                marginBottom: '0.35rem',
                display: 'block',
              }}
            >
              الدفعة الأولى (IQD)
            </label>
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
                border: errors.down_payment
                  ? '2px solid #ef4444'
                  : '1px solid var(--color-border-light)',
                background: 'var(--color-card-background)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
            {errors.down_payment && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  fontWeight: 500,
                }}
              >
                {errors.down_payment}
              </div>
            )}
          </div>
          <div
            style={{
              padding: '1rem',
              background: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border-light)',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                الإجمالي:
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                {totalAmount.toLocaleString()} د.ع.
              </span>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                الدفعة الأولى:
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                {values.down_payment.toLocaleString()} د.ع.
              </span>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>المتبقي:</span>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                {(totalAmount - values.down_payment).toLocaleString()} د.ع.
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--color-border-light)',
                paddingTop: '0.5rem',
              }}
            >
              <span
                style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
              >
                القسط الشهري:
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                {monthlyPayment.toLocaleString()} د.ع.
              </span>
            </div>
          </div>
        </>
      );
    }
    if (step === 4) {
      const selectedItem = items.find((i) => String(i.id) === String(values.item_id));
      return (
        <>
          <div
            style={{
              padding: '1.5rem',
              background: 'var(--color-surface)',
              borderRadius: '16px',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                }}
              >
                مراجعة البيانات
              </h3>
              <button
                type="button"
                onClick={handlePrintAgreement}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-light)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <FaPrint size={12} /> طباعة الاتفاقية
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                >
                  العميل:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {values.customer_name}
                </div>
              </div>
              <div>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                >
                  الهاتف:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {values.customer_phone || '-'}
                </div>
              </div>
              <div>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                >
                  الصنف:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {selectedItem?.name || '-'}
                </div>
              </div>
              <div>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                >
                  الكمية:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {values.quantity}
                </div>
              </div>
              <div>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                >
                  الإجمالي:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {totalAmount.toLocaleString()} د.ع.
                </div>
              </div>
              <div>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                >
                  القسط الشهري:
                </span>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginTop: '0.25rem',
                    color: '#10b981',
                  }}
                >
                  {monthlyPayment.toLocaleString()} د.ع.
                </div>
              </div>
              <div>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                >
                  عدد الأشهر:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {values.total_months} شهر
                </div>
              </div>
              <div>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
                >
                  الدفعة الأولى:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {values.down_payment.toLocaleString()} د.ع.
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex items-center gap-3 sm:gap-5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
            <FaReceipt size={24} className="sm:size-26 md:size-28" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              بيع بالأقساط
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              إنشاء فاتورة بيع بالأقساط للزبائن
            </p>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
        <CardContent className="p-4 sm:p-6 md:p-8">
          {/* Progress Bar */}
          <div className="mb-4 sm:mb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4 overflow-x-auto pb-1">
              {STEPS.map((s, index) => (
              <div
                key={s.id}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '60px' }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    smWidth: '40px',
                    smHeight: '40px',
                    mdWidth: '40px',
                    mdHeight: '40px',
                    borderRadius: '50%',
                    background:
                      step >= s.id
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    smFontSize: '1rem',
                    color: step >= s.id ? '#fff' : 'var(--color-text-muted)',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    smMarginBottom: '0.5rem',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {step > s.id ? <FaCheck size={12} className="sm:size-16" /> : s.icon}
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    smFontSize: '0.75rem',
                    color: step >= s.id ? 'var(--color-text)' : 'var(--color-text-muted)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              height: '3px',
              smHeight: '4px',
              background: 'var(--color-surface)',
              borderRadius: '2px',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '2px',
                width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div
          style={{
            opacity: animate ? 0 : 1,
            transform:
              animate === 'next'
                ? 'translateX(20px)'
                : animate === 'prev'
                  ? 'translateX(-20px)'
                  : 'translateX(0)',
            transition: 'all 0.3s ease',
          }}
        >
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            smMarginTop: '2rem',
            gap: '0.75rem',
            smGap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              style={{
                padding: '0.6rem 1.25rem',
                smPadding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--color-border-light)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                smFontSize: '0.9rem',
              }}
            >
              <FaChevronRight size={12} className="sm:size-14" /> السابق
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              style={{
                padding: '0.6rem 1.25rem',
                smPadding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                smFontSize: '0.9rem',
              }}
            >
              التالي <FaChevronLeft size={12} className="sm:size-14" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: '0.6rem 1.25rem',
                smPadding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                smFontSize: '0.9rem',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'تأكيد وحفظ'} <FaCheck size={12} className="sm:size-14" />
            </button>
          )}
        </div>
        </CardContent>
      </ShadcnCard>
    </div>
  );
};

export default InstallmentSales;
