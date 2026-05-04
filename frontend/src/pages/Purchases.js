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
  const [isDeleting, setIsDeleting] = useState(false);

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
        remaining_amount: parseFloat(formData.total_amount) - (parseFloat(formData.paid_amount) || 0),
        purchase_date: new Date(formData.purchase_date).toISOString(),
        status: editingPurchase ? editingPurchase.status : 'pending'
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
                          {row.remaining_amount > 0 && row.status === 'pending' && (
                            <button onClick={() => { const amount = prompt('أدخل مبلغ الدفعة:', row.remaining_amount); if (amount) handleMakePayment(row.id, parseFloat(amount)); }} style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', background: '#2ecc7115', color: '#2ecc71', border: '1px solid #2ecc7130', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
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
    </div>
  );
};

export default Purchases;