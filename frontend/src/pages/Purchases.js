import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import FormField from '../components/common/FormField';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { StatusBadge } from '../components/common/StatusBadge';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaShoppingCart, FaPlus, FaBoxOpen, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Purchases = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState({ total_purchases: 0, total_amount: 0, total_paid: 0, total_remaining: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeletePaymentId, setConfirmDeletePaymentId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [installmentPayments, setInstallmentPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    customer_name: '',
    customer_phone: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  const [formData, setFormData] = useState({
    supplier_name: '',
    total_amount: '',
    paid_amount: '',
    payment_method: 'cash',
    description: '',
    purchase_date: new Date().toISOString().slice(0, 16),
    items: []
  });

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { status: filter } : {};
      const [purchasesData, summaryData] = await Promise.all([
        apiService.getPurchases(filters),
        apiService.getPurchaseSummary()
      ]);
      setPurchases(purchasesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, [filter]);

  const loadInstallmentPayments = async (purchaseId) => {
    try {
      const payments = await apiService.getInstallmentPayments(purchaseId);
      setInstallmentPayments(payments);
    } catch (error) {
      console.error('Error loading installment payments:', error);
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
      items: []
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
      purchase_date: purchase.purchase_date ? new Date(purchase.purchase_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      items: purchase.items || []
    });
    setIsEditing(true);
  };

  const handleViewPayments = (purchase) => {
    setSelectedPurchase(purchase);
    loadInstallmentPayments(purchase.id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const submissionData = {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        paid_amount: parseFloat(formData.paid_amount) || 0,
        remaining_amount: parseFloat(formData.total_amount) - (parseFloat(formData.paid_amount) || 0),
        purchase_date: new Date(formData.purchase_date).toISOString(),
        status: 'pending'
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

  const handleMakePayment = async (e) => {
    e.preventDefault();
    if (!selectedPurchase) return;

    try {
      const paymentData = {
        purchase_id: selectedPurchase.id,
        customer_name: paymentFormData.customer_name || selectedPurchase.supplier_name,
        customer_phone: paymentFormData.customer_phone,
        amount: parseFloat(paymentFormData.amount),
        payment_method: paymentFormData.payment_method,
        reference_number: paymentFormData.reference_number,
        notes: paymentFormData.notes
      };

      await apiService.createInstallmentPayment(paymentData);
      addToast('تم تسجيل الدفعة بنجاح', 'success');
      setShowPaymentForm(false);
      setPaymentFormData({
        customer_name: '',
        customer_phone: '',
        amount: '',
        payment_method: 'cash',
        reference_number: '',
        notes: ''
      });
      loadInstallmentPayments(selectedPurchase.id);
      loadPurchases();
    } catch (error) {
      console.error('Error making payment:', error);
      addToast('فشل تسجيل الدفعة: ' + error.message, 'error');
    }
  };

  const handleDeletePayment = async () => {
    if (!confirmDeletePaymentId) return;
    setIsDeleting(true);
    try {
      await apiService.deleteInstallmentPayment(confirmDeletePaymentId);
      addToast('تم حذف الدفعة بنجاح', 'success');
      if (selectedPurchase) loadInstallmentPayments(selectedPurchase.id);
      loadPurchases();
    } catch (error) {
      console.error('Error deleting payment:', error);
    } finally {
      setIsDeleting(false);
      setConfirmDeletePaymentId(null);
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
      console.error('Error deleting purchase:', error);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      completed: 'success',
      cancelled: 'danger'
    };
    return <StatusBadge status={statusMap[status] || 'info'} />;
  };

  const getPaymentMethodBadge = (method) => {
    return method === 'cash' ? (
      <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>{t('purchases.cash')}</span>
    ) : (
      <span style={{ color: 'var(--color-warning)', fontWeight: '600' }}>{t('purchases.installment')}</span>
    );
  };

  const columns = [
    {
      header: t('purchases.supplier'),
      accessor: 'supplier_name'
    },
    {
      header: t('purchases.date'),
      accessor: 'purchase_date',
      render: (row) => new Date(row.purchase_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')
    },
    {
      header: t('purchases.total'),
      accessor: 'total_amount',
      render: (row) => formatCurrency(row.total_amount)
    },
    {
      header: t('purchases.paid'),
      accessor: 'paid_amount',
      render: (row) => formatCurrency(row.paid_amount)
    },
    {
      header: t('purchases.remaining'),
      accessor: 'remaining_amount',
      render: (row) => (
        <span style={{ color: row.remaining_amount > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: '600' }}>
          {formatCurrency(row.remaining_amount)}
        </span>
      )
    },
    {
      header: t('purchases.paymentMethod'),
      accessor: 'payment_method',
      render: (row) => getPaymentMethodBadge(row.payment_method)
    },
    {
      header: t('purchases.status'),
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: t('common.actions'),
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {row.payment_method === 'installment' && (
            <Button
              onClick={() => handleViewPayments(row)}
              className="btn-info"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
            >
              {t('purchases.paymentHistory')}
            </Button>
          )}
          {row.remaining_amount > 0 && row.status === 'pending' && (
            <Button
              onClick={() => {
                setSelectedPurchase(row);
                setShowPaymentForm(true);
                setPaymentFormData({ ...paymentFormData, customer_name: row.supplier_name });
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

  const paymentHistoryColumns = [
    {
      header: t('purchases.paymentDate'),
      accessor: 'payment_date',
      render: (row) => new Date(row.payment_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')
    },
    {
      header: t('purchases.customerName'),
      accessor: 'customer_name'
    },
    {
      header: t('purchases.amount'),
      accessor: 'amount',
      render: (row) => formatCurrency(row.amount)
    },
    {
      header: t('purchases.paymentMethod'),
      accessor: 'payment_method'
    },
    {
      header: t('purchases.reference'),
      accessor: 'reference_number',
      render: (row) => row.reference_number || '-'
    },
    {
      header: t('common.actions'),
      accessor: 'actions',
      render: (row) => (
        <Button
          onClick={() => setConfirmDeletePaymentId(row.id)}
          className="btn-danger"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
        >
          {t('common.delete')}
        </Button>
      ),
    },
  ];

  const STATUS_META = {
    pending:   { color: '#f39c12', bg: '#f39c1215', label: t('purchases.pending') },
    completed: { color: '#2ecc71', bg: '#2ecc7115', label: t('purchases.completed') },
    cancelled: { color: '#e74c3c', bg: '#e74c3c15', label: t('purchases.cancelled') },
  };

  return (
    <div className="page">

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
        borderRadius: '20px', padding: 'clamp(1.5rem,4vw,2.5rem)',
        marginBottom: '1.75rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        boxShadow: '0 8px 32px rgba(243,156,18,0.28)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
            <FaShoppingCart />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('purchases.title')}</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {summary.total_purchases} {t('purchases.totalPurchases')} · تتبع طلبات الشراء والمدفوعات
            </p>
          </div>
        </div>
        {!isEditing && (
          <button onClick={handleAdd} style={{ background: '#fff', border: 'none', color: '#f39c12', padding: '0.6rem 1.4rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <FaPlus size={13} /> {t('purchases.addPurchase')}
          </button>
        )}
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: t('purchases.totalPurchases'), value: summary.total_purchases, color: '#7c3aed', bg: '#7c3aed15', icon: <FaBoxOpen /> },
          { label: t('purchases.totalAmount'),    value: formatCurrency(summary.total_amount),    color: '#f39c12', bg: '#f39c1215', icon: <FaShoppingCart /> },
          { label: t('purchases.totalPaid'),      value: formatCurrency(summary.total_paid),      color: '#2ecc71', bg: '#2ecc7115', icon: <FaCheckCircle /> },
          { label: t('purchases.totalRemaining'), value: formatCurrency(summary.total_remaining), color: '#e74c3c', bg: '#e74c3c15', icon: <FaExclamationCircle /> },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} style={{ background: 'var(--color-card-background)', borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Form ── */}
      {isEditing && (
        <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '2px solid #f39c1240', boxShadow: '0 4px 24px rgba(243,156,18,0.1)', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#f39c1218', color: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {editingPurchase ? <FaShoppingCart size={14} /> : <FaPlus size={14} />}
            </div>
            <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>
              {editingPurchase ? 'تعديل سجل الشراء' : 'إضافة مشتريات جديدة'}
            </h3>
          </div>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <FormField label={t('purchases.supplier')} name="supplier_name" type="text" value={formData.supplier_name} onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })} required />
              <FormField label={t('purchases.date')} name="purchase_date" type="datetime-local" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} required />
              <FormField label={t('purchases.total')} name="total_amount" type="number" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })} required min="0" step="0.01" />
              <FormField label={t('purchases.paid')} name="paid_amount" type="number" value={formData.paid_amount} onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })} min="0" step="0.01" />
              <FormField label={t('purchases.paymentMethod')} name="payment_method" type="select" value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} required>
                <option value="cash">{t('purchases.cash')}</option>
                <option value="installment">{t('purchases.installment')}</option>
              </FormField>
              <FormField label={t('purchases.description')} name="description" type="textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button type="button" onClick={resetForm} className="btn-secondary" disabled={isSaving}>{t('common.cancel')}</Button>
              <Button type="submit" className="btn-primary" loading={isSaving}>{t('common.save')}</Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Payment History Panel ── */}
      {selectedPurchase && !isEditing && (
        <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '2px solid #2ecc7140', boxShadow: '0 4px 24px rgba(46,204,113,0.08)', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#2ecc7118', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheckCircle size={14} /></div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>{t('purchases.paymentHistory')}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {selectedPurchase.supplier_name} · {t('purchases.remaining')}: <span style={{ color: '#e74c3c', fontWeight: 600 }}>{formatCurrency(selectedPurchase.remaining_amount)}</span>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedPurchase.remaining_amount > 0 && !showPaymentForm && (
                <button onClick={() => setShowPaymentForm(true)} style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '0.5rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaPlus size={11} /> {t('purchases.addPayment')}
                </button>
              )}
              {showPaymentForm && (
                <button onClick={() => setShowPaymentForm(false)} style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-light)', padding: '0.5rem 1.1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  {t('common.cancel')}
                </button>
              )}
              <button onClick={() => { setSelectedPurchase(null); setInstallmentPayments([]); setShowPaymentForm(false); }} style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-light)', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>✕</button>
            </div>
          </div>

          {showPaymentForm && (
            <form onSubmit={handleMakePayment} style={{ marginBottom: '1.25rem', padding: '1.25rem', background: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <FormField label={t('purchases.customerName')} name="customer_name" type="text" value={paymentFormData.customer_name} onChange={(e) => setPaymentFormData({ ...paymentFormData, customer_name: e.target.value })} required />
                <FormField label={t('purchases.customerPhone')} name="customer_phone" type="text" value={paymentFormData.customer_phone} onChange={(e) => setPaymentFormData({ ...paymentFormData, customer_phone: e.target.value })} />
                <FormField label={t('purchases.amount')} name="amount" type="number" value={paymentFormData.amount} onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })} required min="0" step="0.01" help={t('purchases.remaining') + ': ' + formatCurrency(selectedPurchase.remaining_amount)} />
                <FormField label={t('purchases.paymentMethod')} name="payment_method" type="select" value={paymentFormData.payment_method} onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}>
                  <option value="cash">{t('purchases.cash')}</option>
                  <option value="bank_transfer">{t('purchases.bankTransfer')}</option>
                </FormField>
                <FormField label={t('purchases.reference')} name="reference_number" type="text" value={paymentFormData.reference_number} onChange={(e) => setPaymentFormData({ ...paymentFormData, reference_number: e.target.value })} />
                <FormField label={t('purchases.notes')} name="notes" type="textarea" value={paymentFormData.notes} onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })} rows={2} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '0.55rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>{t('purchases.addPayment')}</button>
              </div>
            </form>
          )}

          {installmentPayments.length === 0 && !showPaymentForm ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('purchases.noPayments')}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {installmentPayments.map((pay) => (
                <div key={pay.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border-light)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#2ecc7115', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FaCheckCircle size={14} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{pay.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(pay.payment_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')} · {pay.payment_method}
                      {pay.reference_number && ` · #${pay.reference_number}`}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#2ecc71', fontSize: '1rem', flexShrink: 0 }}>{formatCurrency(pay.amount)}</div>
                  <button onClick={() => setConfirmDeletePaymentId(pay.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: '#e74c3c12', border: '1px solid #e74c3c30', color: '#e74c3c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Purchases Table ── */}
      <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {/* Filter Bar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all',       color: 'var(--color-primary)', label: t('common.all') },
            { key: 'pending',   color: '#f39c12',              label: t('purchases.pending') },
            { key: 'completed', color: '#2ecc71',              label: t('purchases.completed') },
            { key: 'cancelled', color: '#e74c3c',              label: t('purchases.cancelled') },
          ].map(({ key, color, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: filter === key ? `2px solid ${color}` : '2px solid var(--color-border-light)',
              background: filter === key ? color + '18' : 'transparent',
              color: filter === key ? color : 'var(--color-text-muted)',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>{t('common.loading')}</div>
        ) : purchases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '18px', background: '#f39c1212', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#f39c12', margin: '0 auto 1.25rem' }}><FaShoppingCart /></div>
            <h3 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem' }}>{t('purchases.noPurchases')}</h3>
            <button onClick={handleAdd} style={{ background: '#f39c12', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <FaPlus size={12} /> {t('purchases.addPurchase')}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  {[t('purchases.supplier'), t('purchases.date'), t('purchases.total'), t('purchases.paid'), t('purchases.remaining'), t('purchases.paymentMethod'), t('purchases.status'), t('common.actions')].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'start', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchases.map((row) => {
                  const sm = STATUS_META[row.status] || STATUS_META.pending;
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9rem' }}>{row.supplier_name}</div>
                        {row.description && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</div>}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(row.purchase_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{formatCurrency(row.total_amount)}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#2ecc71', whiteSpace: 'nowrap' }}>{formatCurrency(row.paid_amount)}</td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: row.remaining_amount > 0 ? '#e74c3c' : '#2ecc71', whiteSpace: 'nowrap' }}>{formatCurrency(row.remaining_amount)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: row.payment_method === 'cash' ? '#2ecc7115' : '#f39c1215', color: row.payment_method === 'cash' ? '#2ecc71' : '#f39c12' }}>
                          {row.payment_method === 'cash' ? t('purchases.cash') : t('purchases.installment')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: sm.bg, color: sm.color }}>{sm.label}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap' }}>
                          {row.payment_method === 'installment' && (
                            <button onClick={() => handleViewPayments(row)} style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', background: '#3498db15', color: '#3498db', border: '1px solid #3498db30', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {t('purchases.paymentHistory')}
                            </button>
                          )}
                          {row.remaining_amount > 0 && row.status === 'pending' && (
                            <button onClick={() => { setSelectedPurchase(row); setShowPaymentForm(true); setPaymentFormData({ ...paymentFormData, customer_name: row.supplier_name }); }} style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', background: '#2ecc7115', color: '#2ecc71', border: '1px solid #2ecc7130', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
                              {t('purchases.pay')}
                            </button>
                          )}
                          <button onClick={() => handleEdit(row)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✏️</button>
                          <button onClick={() => setConfirmDeleteId(row.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: '#e74c3c12', color: '#e74c3c', border: '1px solid #e74c3c30', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog isOpen={!!confirmDeleteId} title="حذف سجل المشتريات" message="هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء." confirmLabel="حذف" cancelLabel={t('common.cancel')} variant="danger" loading={isDeleting} onConfirm={handleDelete} onCancel={() => setConfirmDeleteId(null)} />
      <ConfirmDialog isOpen={!!confirmDeletePaymentId} title="حذف الدفعة" message="هل أنت متأكد من حذف هذه الدفعة؟ لا يمكن التراجع عن هذا الإجراء." confirmLabel="حذف" cancelLabel={t('common.cancel')} variant="danger" loading={isDeleting} onConfirm={handleDeletePayment} onCancel={() => setConfirmDeletePaymentId(null)} />
    </div>
  );
};

export default Purchases;