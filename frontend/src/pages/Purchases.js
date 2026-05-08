import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import FormField from '../components/common/FormField';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card as ShadcnCard, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import {
  FaShoppingCart,
  FaPlus,
  FaBoxOpen,
  FaCheckCircle,
  FaExclamationCircle,
  FaPrint,
} from 'react-icons/fa';

const Purchases = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState({
    total_purchases: 0,
    total_amount: 0,
    total_paid: 0,
    total_remaining: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    supplier_name: '',
    total_amount: '',
    paid_amount: '',
    payment_method: 'cash',
    description: '',
    purchase_date: new Date().toISOString().slice(0, 16),
    items: [],
  });

  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { status: filter } : {};
      const [purchasesData, summaryData] = await Promise.all([
        apiService.getPurchases(filters),
        apiService.getPurchaseSummary(),
      ]);
      setPurchases(purchasesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const loadPurchasePayments = async (purchaseId) => {
    try {
      const purchase = await apiService.getPurchase(purchaseId);
      // For now, just show the purchase details
      // In a real implementation, you'd need a backend endpoint to get payment history
    } catch (error) {
      console.error('Error loading purchase:', error);
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

  const resetForm = () => {
    setFormData({
      supplier_name: '',
      total_amount: '',
      paid_amount: '',
      payment_method: 'cash',
      description: '',
      purchase_date: new Date().toISOString().slice(0, 16),
      items: [],
    });
    setEditingPurchase(null);
    setIsEditing(false);
  };

  const handleAdd = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      supplier_name: purchase.supplier_name,
      total_amount: purchase.total_amount,
      paid_amount: purchase.paid_amount,
      payment_method: purchase.payment_method,
      description: purchase.description || '',
      purchase_date: purchase.purchase_date
        ? new Date(purchase.purchase_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      items: purchase.items || [],
    });
    setIsEditing(true);
  };

  const handleMakePayment = async (purchaseId, amount) => {
    try {
      await apiService.makePurchasePayment(purchaseId, amount);
      addToast('تم تسجيل الدفعة بنجاح', 'success');
      loadPurchases();
    } catch (error) {
      console.error('Error making payment:', error);
      addToast('فشل تسجيل الدفعة: ' + error.message, 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const submissionData = {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        paid_amount: parseFloat(formData.paid_amount) || 0,
        remaining_amount:
          parseFloat(formData.total_amount) - (parseFloat(formData.paid_amount) || 0),
        purchase_date: new Date(formData.purchase_date).toISOString(),
        status: editingPurchase ? editingPurchase.status : 'pending',
      };

      if (editingPurchase) {
        await apiService.updatePurchase(editingPurchase.id, submissionData);
        addToast('تم تحديث المشتريات بنجاح', 'success');
      } else {
        await apiService.createPurchase(submissionData);
        addToast('تمت إضافة المشتريات بنجاح', 'success');
      }
      resetForm();
      loadPurchases();
    } catch (error) {
      console.error('Error saving purchase:', error);
      addToast('فشل حفظ المشتريات: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await apiService.deletePurchase(confirmDeleteId);
      addToast('تم حذف السجل بنجاح', 'success');
      loadPurchases();
    } catch (error) {
      addToast('فشل حذف السجل: ' + error.message, 'error');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      completed: 'success',
      cancelled: 'danger',
    };
    return <StatusBadge status={statusMap[status] || 'info'} />;
  };

  const getPaymentMethodBadge = (method) => {
    return method === 'cash' ? (
      <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>
        {t('purchases.cash')}
      </span>
    ) : (
      <span style={{ color: 'var(--color-warning)', fontWeight: '600' }}>
        {t('purchases.installment')}
      </span>
    );
  };

  const handlePrintPurchase = (purchase) => {
    const printContent = `
      <html dir="${i18n.language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <title>طلب شراء #${purchase.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
          .title { font-size: 24px; font-weight: bold; color: #f59e0b; }
          .date { margin: 10px 0; }
          .section { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .section-title { font-weight: bold; margin-bottom: 10px; color: #f59e0b; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { font-size: 18px; font-weight: bold; margin: 5px 0; }
          .status { padding: 5px 15px; border-radius: 20px; display: inline-block; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">طلب شراء #${purchase.id}</div>
          <div class="date">التاريخ: ${new Date(purchase.purchase_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</div>
        </div>
        <div class="section">
          <div class="section-title">معلومات المورد</div>
          <div class="info-row"><span>المورد:</span><span>${purchase.supplier_name}</span></div>
        </div>
        <div class="section">
          <div class="section-title">تفاصيل الشراء</div>
          <div class="info-row"><span>الإجمالي:</span><span>${formatCurrency(purchase.total_amount)}</span></div>
          <div class="info-row"><span>المدفوع:</span><span>${formatCurrency(purchase.paid_amount)}</span></div>
          <div class="info-row"><span>المتبقي:</span><span>${formatCurrency(purchase.remaining_amount)}</span></div>
          <div class="info-row"><span>طريقة الدفع:</span><span>${purchase.payment_method === 'cash' ? 'نقداً' : 'آجل'}</span></div>
        </div>
        ${purchase.description ? `<div class="section"><div class="section-title">ملاحظات</div><div>${purchase.description}</div></div>` : ''}
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const columns = [
    {
      header: t('purchases.supplier'),
      accessor: 'supplier_name',
    },
    {
      header: t('purchases.date'),
      accessor: 'purchase_date',
      render: (row) =>
        new Date(row.purchase_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US'),
    },
    {
      header: t('purchases.total'),
      accessor: 'total_amount',
      render: (row) => formatCurrency(row.total_amount),
    },
    {
      header: t('purchases.paid'),
      accessor: 'paid_amount',
      render: (row) => formatCurrency(row.paid_amount),
    },
    {
      header: t('purchases.remaining'),
      accessor: 'remaining_amount',
      render: (row) => (
        <span
          style={{
            color: row.remaining_amount > 0 ? 'var(--color-danger)' : 'var(--color-success)',
            fontWeight: '600',
          }}
        >
          {formatCurrency(row.remaining_amount)}
        </span>
      ),
    },
    {
      header: t('purchases.paymentMethod'),
      accessor: 'payment_method',
      render: (row) => getPaymentMethodBadge(row.payment_method),
    },
    {
      header: t('purchases.status'),
      accessor: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: t('common.actions'),
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            onClick={() => handlePrintPurchase(row)}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
          >
            <FaPrint size={12} style={{ marginRight: '0.25rem' }} /> {t('common.print')}
          </Button>
          {row.remaining_amount > 0 && row.status === 'pending' && (
            <Button
              onClick={() => {
                const amount = prompt('أدخل مبلغ الدفعة:', row.remaining_amount);
                if (amount) handleMakePayment(row.id, parseFloat(amount));
              }}
              className="btn-success"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
            >
              {t('purchases.pay')}
            </Button>
          )}
          <Button
            onClick={() => handleEdit(row)}
            className="btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
          >
            {t('common.edit')}
          </Button>
          <Button
            onClick={() => setConfirmDeleteId(row.id)}
            className="btn-danger"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
          >
            {t('common.delete')}
          </Button>
        </div>
      ),
    },
  ];

  const STATUS_META = {
    pending: { color: '#f39c12', bg: '#f39c1215', label: t('purchases.pending') },
    completed: { color: '#2ecc71', bg: '#2ecc7115', label: t('purchases.completed') },
    cancelled: { color: '#e74c3c', bg: '#e74c3c15', label: t('purchases.cancelled') },
  };

  const paymentMethodOptions = [
    { value: 'cash', label: t('purchases.cash') },
    { value: 'installment', label: t('purchases.installment') },
  ];

  const FILTER_OPTIONS = [
    { value: 'all', label: t('common.all') },
    { value: 'pending', label: t('purchases.pending') },
    { value: 'completed', label: t('purchases.completed') },
    { value: 'cancelled', label: t('purchases.cancelled') },
  ];

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleViewPurchase = (purchase) => {
    handleEdit(purchase);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
              <FaShoppingCart size={24} className="sm:size-26 md:size-28" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {t('purchases.title')}
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium">
                {summary.total_purchases} {t('purchases.totalPurchases')} · تتبع طلبات الشراء والمدفوعات
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-white text-amber-600 hover:bg-white/90 font-semibold shadow-lg w-full sm:w-auto"
            >
              <FaPlus size={12} className="sm:size-13 mr-2" />
              {t('purchases.addPurchase')}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-4 sm:mb-6">
          <ShadcnCard className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  {t('purchases.totalPurchases')}
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20">
                  <FaBoxOpen size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
                {summary.total_purchases}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">سجل نشط</p>
            </CardContent>
          </ShadcnCard>

          <ShadcnCard className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  {t('purchases.totalAmount')}
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20">
                  <FaShoppingCart size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 drop-shadow-sm">
                {formatCurrency(summary.total_amount)}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">إجمالي المشتريات</p>
            </CardContent>
          </ShadcnCard>

          <ShadcnCard className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  {t('purchases.totalPaid')}
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                  <FaCheckCircle size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
                {formatCurrency(summary.total_paid)}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">إجمالي المدفوع</p>
            </CardContent>
          </ShadcnCard>

          <ShadcnCard className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  {t('purchases.totalRemaining')}
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 ring-1 ring-red-500/20">
                  <FaExclamationCircle size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400 drop-shadow-sm">
                {formatCurrency(summary.total_remaining)}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">المتبقي</p>
            </CardContent>
          </ShadcnCard>
        </div>
      )}

      {/* Add/Edit Form */}
      {isEditing && (
        <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">
              {editingPurchase ? t('purchases.editPurchase') : t('purchases.addPurchase')}
            </h3>
            <form onSubmit={handleSave} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <FormField
                  label={t('purchases.supplierName')}
                  name="supplier_name"
                  type="text"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  required
                  clearable
                  placeholder={t('purchases.supplierNamePlaceholder')}
                />
                <FormField
                  label={t('purchases.totalAmount')}
                  name="total_amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
                <FormField
                  label={t('purchases.paidAmount')}
                  name="paid_amount"
                  type="number"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                  placeholder="0.00"
                />
                <FormField
                  label={t('purchases.paymentMethod')}
                  name="payment_method"
                  type="select"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  options={paymentMethodOptions}
                />
                <FormField
                  label={t('purchases.purchaseDate')}
                  name="purchase_date"
                  type="datetime-local"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  required
                />
                <FormField
                  label={t('purchases.description')}
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('purchases.descriptionPlaceholder')}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving} className="text-xs sm:text-sm">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" loading={isSaving} className="text-xs sm:text-sm">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </ShadcnCard>
      )}

      {/* Filter Bar */}
      {!isEditing && (
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
              className={cn(
                filter === option.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                'whitespace-nowrap text-xs sm:text-sm'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}

      {/* Purchases Table */}
      {!isEditing && (
        <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
          <CardContent className="pt-4 sm:pt-6">
            {loading ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground text-xs sm:text-sm">...</div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 items-center justify-center rounded-xl bg-muted text-muted-foreground text-xl sm:text-2xl">
                  <FaShoppingCart aria-hidden="true" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">{t('purchases.noPurchases')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{t('purchases.addFirstPurchase')}</p>
                <Button size="sm" onClick={handleAdd} className="text-xs sm:text-sm">
                  <FaPlus size={11} className="sm:size-12 mr-1" aria-hidden="true" /> {t('purchases.addPurchase')}
                </Button>
              </div>
            ) : (
              <Table
                columns={columns}
                data={purchases}
                onRowClick={handleViewPurchase}
                emptyMessage={t('purchases.noPurchases')}
              />
            )}
          </CardContent>
        </ShadcnCard>
      )}
    </div>
  );
};

export default Purchases;
