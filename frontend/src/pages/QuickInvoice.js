import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FaBolt,
  FaChevronRight,
  FaChevronLeft,
  FaCheck,
  FaArrowRight,
  FaPlus,
  FaPrint,
} from 'react-icons/fa';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import { Card as ShadcnCard, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';

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
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(itemSearch.toLowerCase())
  );

  useEffect(() => {
    loadItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    const margin = selling > 0 ? (((selling - cost) / selling) * 100).toFixed(2) : 0;
    setProfitMargin(parseFloat(margin));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'cost_price' || name === 'selling_price') {
      calculateProfitMargin(
        name === 'cost_price' ? parseFloat(value) || 0 : values.cost_price,
        name === 'selling_price' ? parseFloat(value) || 0 : values.selling_price
      );
    }
  };

  const handleItemChange = (value) => {
    const selectedItem = items.find((i) => String(i.id) === String(value));
    if (selectedItem) {
      setValues((prev) => ({
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
    transition('next', () => setStep((s) => s + 1));
  };

  const back = () => {
    setErrors({});
    transition('prev', () => setStep((s) => s - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const invoiceData = {
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        items: [
          {
            item_id: values.item_id,
            item_name: items.find((i) => String(i.id) === String(values.item_id))?.name || '',
            quantity: values.quantity,
            cost_price: values.cost_price,
            selling_price: values.selling_price,
            profit_margin: profitMargin,
            total_price: values.selling_price * values.quantity,
          },
        ],
        total_amount: values.selling_price * values.quantity,
        paid_amount: values.payment_method === 'cash' ? values.selling_price * values.quantity : 0,
        remaining_amount:
          values.payment_method === 'cash' ? 0 : values.selling_price * values.quantity,
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

  const handlePrintInvoice = () => {
    const selectedItem = items.find((i) => String(i.id) === String(values.item_id));
    const printContent = `
      <html dir="${i18n.language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <title>فاتورة سريعة</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #06b6d4; padding-bottom: 10px; }
          .invoice-title { font-size: 24px; font-weight: bold; color: #06b6d4; }
          .invoice-info { margin: 10px 0; }
          .customer-info { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .items-table th { background: #06b6d4; color: white; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { font-size: 18px; font-weight: bold; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="invoice-title">فاتورة سريعة</div>
          <div class="invoice-info">التاريخ: ${new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</div>
        </div>
        <div class="customer-info">
          <strong>العميل:</strong> ${values.customer_name}<br>
          ${values.customer_phone ? `<strong>الهاتف:</strong> ${values.customer_phone}<br>` : ''}
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>سعر البيع</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${selectedItem?.name || '-'}</td>
              <td>${values.quantity}</td>
              <td>${formatCurrency(values.selling_price)}</td>
              <td>${formatCurrency(values.selling_price * values.quantity)}</td>
            </tr>
          </tbody>
        </table>
        <div class="totals">
          <div class="total-row">الإجمالي: ${formatCurrency(values.selling_price * values.quantity)}</div>
          <div class="total-row">طريقة الدفع: ${values.payment_method === 'cash' ? 'نقداً' : values.payment_method === 'card' ? 'بطاقة' : 'آجل'}</div>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <>
          <FormField
            label="اسم العميل"
            name="customer_name"
            type="text"
            value={values.customer_name}
            onChange={handleChange}
            error={errors.customer_name}
            required
            clearable
            placeholder="أدخل اسم العميل"
          />
          <FormField
            label="رقم الهاتف"
            name="customer_phone"
            type="text"
            value={values.customer_phone}
            onChange={handleChange}
            placeholder="رقم الهاتف (اختياري)"
          />
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
                transition: 'all 0.2s ease',
                appearance: 'none',
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 0.75rem center',
                backgroundSize: '1.25rem',
                paddingLeft: '2.5rem',
              }}
              onMouseEnter={(e) =>
                (e.target.style.borderColor = errors.item_id ? '#ef4444' : '#10b981')
              }
              onMouseLeave={(e) =>
                (e.target.style.borderColor = errors.item_id
                  ? '#ef4444'
                  : 'var(--color-border-light)')
              }
            >
              <option value="" style={{ color: 'var(--color-text-muted)' }}>
                اختر الصنف من القائمة
              </option>
              {(filteredItems || []).map((i) => (
                <option
                  key={String(i.id)}
                  value={String(i.id)}
                  style={{ color: 'var(--color-text)' }}
                >
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
          <FormField
            label="الكمية"
            name="quantity"
            type="number"
            value={values.quantity}
            onChange={handleChange}
            min="1"
          />
        </>
      );
    }
    if (step === 3) {
      return (
        <>
          <FormField
            label="سعر التكلفة"
            name="cost_price"
            type="number"
            value={values.cost_price}
            onChange={handleChange}
            placeholder="0"
          />
          <FormField
            label="سعر البيع"
            name="selling_price"
            type="number"
            value={values.selling_price}
            onChange={handleChange}
            error={errors.selling_price}
            required
            placeholder="0"
          />
          <div
            style={{
              padding: '1rem',
              background: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
              >
                هامش الربح:
              </span>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginLeft: '0.5rem',
                  color: profitMargin >= 0 ? '#10b981' : '#ef4444',
                }}
              >
                {profitMargin}%
              </span>
            </div>
            <div>
              <span
                style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
              >
                الإجمالي:
              </span>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginLeft: '0.5rem',
                  color: '#10b981',
                }}
              >
                {formatCurrency(values.selling_price * values.quantity)}
              </span>
            </div>
          </div>
        </>
      );
    }
    if (step === 4) {
      return (
        <>
          <FormField
            label="طريقة الدفع"
            name="payment_method"
            type="select"
            value={values.payment_method}
            onChange={handleChange}
          >
            <option value="cash">نقداً</option>
            <option value="card">بطاقة</option>
            <option value="credit">آجل</option>
          </FormField>
          <FormField
            label="ملاحظات"
            name="notes"
            type="textarea"
            value={values.notes}
            onChange={handleChange}
            rows={3}
            placeholder="أضف ملاحظات هنا..."
          />
        </>
      );
    }
    if (step === 5) {
      const selectedItem = items.find((i) => String(i.id) === String(values.item_id));
      return (
        <div style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
              }}
            >
              راجع البيانات قبل الحفظ النهائي
            </p>
            <button
              type="button"
              onClick={handlePrintInvoice}
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
              <FaPrint size={12} /> طباعة
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>العميل</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{values.customer_name}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>الصنف</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {selectedItem?.name || '-'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>الكمية</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{values.quantity}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                سعر البيع
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {formatCurrency(values.selling_price)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>الإجمالي</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                {formatCurrency(values.selling_price * values.quantity)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                طريقة الدفع
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {values.payment_method === 'cash'
                  ? 'نقداً'
                  : values.payment_method === 'card'
                    ? 'بطاقة'
                    : 'آجل'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex items-center gap-3 sm:gap-5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
            <FaBolt size={24} className="sm:size-26 md:size-28" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              فاتورة سريعة
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              معالج خطوة بخطوة لإضافة فاتورة جديدة
            </p>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <div className="max-w-3xl mx-auto px-2 sm:px-0">
        <ShadcnCard className="border-border/60 shadow-lg shadow-black/5 overflow-hidden">
          {/* Progress bar */}
          <div className="p-3 sm:p-4 md:p-6 border-b border-border">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
              {STEPS.map((label, i) => (
                <React.Fragment key={`step-${i}`}>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div
                      className={cn(
                        'flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-semibold',
                        step === i + 1
                          ? 'bg-cyan-500 text-white'
                          : step > i + 1
                            ? 'bg-cyan-500 text-white'
                            : 'bg-border text-muted-foreground'
                      )}
                    >
                      {step > i + 1 ? <FaCheck size={8} className="sm:size-10" /> : i + 1}
                    </div>
                    <span
                      className={cn(
                        'text-[10px] sm:text-xs',
                        step === i + 1 ? 'font-bold text-cyan-600' : step > i + 1 ? 'font-semibold text-cyan-600' : 'text-muted-foreground'
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 sm:h-0.5 w-4 sm:w-auto',
                        step > i + 1 ? 'bg-cyan-500' : 'bg-border'
                      )}
                      style={{ margin: '0 0.25rem sm:0 0.5rem' }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 md:p-8 min-h-[250px] sm:min-h-[300px]">
            {loading ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground text-xs sm:text-sm">
                جاري التحميل...
              </div>
            ) : (
              renderStepContent()
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 md:p-6 border-t border-border flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center">
            <Button variant="outline" onClick={() => navigate('/sales-invoice')} className="w-full sm:w-auto text-xs sm:text-sm">
              إلغاء
            </Button>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              {step > 1 && (
                <Button variant="outline" onClick={back} disabled={isSubmitting} className="flex-1 sm:flex-none text-xs sm:text-sm">
                  <FaChevronRight size={10} className="sm:size-11 mr-1" />
                  رجوع
                </Button>
              )}
              {step === STEPS.length ? (
                <Button onClick={handleSubmit} loading={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700 flex-1 sm:flex-none text-xs sm:text-sm">
                  <FaCheck size={10} className="sm:size-11 mr-1" />
                  إنشاء الفاتورة
                </Button>
              ) : (
                <Button onClick={next} disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700 flex-1 sm:flex-none text-xs sm:text-sm">
                  التالي
                  <FaChevronLeft size={10} className="sm:size-11 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </ShadcnCard>

        {/* Quick Actions */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/items/new')}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <FaPlus size={11} className="sm:size-12 mr-1" />
            إضافة صنف جديد
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/sales-invoice')}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <FaArrowRight size={11} className="sm:size-12 mr-1" />
            عرض جميع الفواتير
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickInvoice;
