import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import FormField from '../components/common/FormField';
import { StatusBadge } from '../components/common/StatusBadge';
import apiService from '../services/apiService';

const Purchases = () => {
  const { t, i18n } = useTranslation();
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState({ total_purchases: 0, total_amount: 0, total_paid: 0, total_remaining: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
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
      maximumFractionDigits: 0
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
      } else {
        await apiService.createPurchase(submissionData);
      }
      resetForm();
      loadPurchases();
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Failed to save purchase: ' + error.message);
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
      alert('Failed to make payment: ' + error.message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm(t('purchases.confirmDeletePayment'))) return;

    try {
      await apiService.deleteInstallmentPayment(paymentId);
      if (selectedPurchase) {
        loadInstallmentPayments(selectedPurchase.id);
      }
      loadPurchases();
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('purchases.confirmDelete'))) {
      try {
        await apiService.deletePurchase(id);
        loadPurchases();
      } catch (error) {
        console.error('Error deleting purchase:', error);
      }
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
            onClick={() => handleDelete(row.id)}
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
          onClick={() => handleDeletePayment(row.id)}
          className="btn-danger"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
        >
          {t('common.delete')}
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>{t('purchases.title')}</h1>
        {!isEditing && (
          <Button onClick={handleAdd} className="btn-primary">
            {t('purchases.addPurchase')}
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card style={{ padding: '1rem', textAlign: 'center' }}>
          <h4>{t('purchases.totalPurchases')}</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{summary.total_purchases}</p>
        </Card>
        <Card style={{ padding: '1rem', textAlign: 'center' }}>
          <h4>{t('purchases.totalAmount')}</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(summary.total_amount)}</p>
        </Card>
        <Card style={{ padding: '1rem', textAlign: 'center' }}>
          <h4>{t('purchases.totalPaid')}</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{formatCurrency(summary.total_paid)}</p>
        </Card>
        <Card style={{ padding: '1rem', textAlign: 'center' }}>
          <h4>{t('purchases.totalRemaining')}</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-danger)' }}>{formatCurrency(summary.total_remaining)}</p>
        </Card>
      </div>

      {isEditing && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField
                label={t('purchases.supplier')}
                name="supplier_name"
                type="text"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                required
              />
              <FormField
                label={t('purchases.date')}
                name="purchase_date"
                type="datetime-local"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                required
              />
              <FormField
                label={t('purchases.total')}
                name="total_amount"
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                required
                min="0"
                step="0.01"
              />
              <FormField
                label={t('purchases.paid')}
                name="paid_amount"
                type="number"
                value={formData.paid_amount}
                onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                min="0"
                step="0.01"
              />
              <FormField
                label={t('purchases.paymentMethod')}
                name="payment_method"
                type="select"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                required
              >
                <option value="cash">{t('purchases.cash')}</option>
                <option value="installment">{t('purchases.installment')}</option>
              </FormField>
              <FormField
                label={t('purchases.description')}
                name="description"
                type="textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button type="button" onClick={resetForm} className="btn-secondary">
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="btn-primary">
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {selectedPurchase && !isEditing && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>{t('purchases.paymentHistory')} - {selectedPurchase.supplier_name}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {showPaymentForm ? (
                <Button onClick={() => setShowPaymentForm(false)} className="btn-secondary">
                  {t('common.cancel')}
                </Button>
              ) : (
                selectedPurchase.remaining_amount > 0 && (
                  <Button onClick={() => setShowPaymentForm(true)} className="btn-success">
                    {t('purchases.addPayment')}
                  </Button>
                )
              )}
              <Button onClick={() => { setSelectedPurchase(null); setInstallmentPayments([]); }} className="btn-secondary">
                {t('common.close')}
              </Button>
            </div>
          </div>

          {showPaymentForm && (
            <form onSubmit={handleMakePayment} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <FormField
                  label={t('purchases.customerName')}
                  name="customer_name"
                  type="text"
                  value={paymentFormData.customer_name}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, customer_name: e.target.value })}
                  required
                />
                <FormField
                  label={t('purchases.customerPhone')}
                  name="customer_phone"
                  type="text"
                  value={paymentFormData.customer_phone}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, customer_phone: e.target.value })}
                />
                <FormField
                  label={t('purchases.amount')}
                  name="amount"
                  type="number"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  help={t('purchases.remaining') + ': ' + formatCurrency(selectedPurchase.remaining_amount)}
                />
                <FormField
                  label={t('purchases.paymentMethod')}
                  name="payment_method"
                  type="select"
                  value={paymentFormData.payment_method}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
                >
                  <option value="cash">{t('purchases.cash')}</option>
                  <option value="bank_transfer">{t('purchases.bankTransfer')}</option>
                </FormField>
                <FormField
                  label={t('purchases.reference')}
                  name="reference_number"
                  type="text"
                  value={paymentFormData.reference_number}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, reference_number: e.target.value })}
                />
              </div>
              <FormField
                label={t('purchases.notes')}
                name="notes"
                type="textarea"
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                rows={2}
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button type="submit" className="btn-primary">
                  {t('purchases.addPayment')}
                </Button>
              </div>
            </form>
          )}

          <Table columns={paymentHistoryColumns} data={installmentPayments} />

          {installmentPayments.length === 0 && !showPaymentForm && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
              {t('purchases.noPayments')}
            </div>
          )}
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <Button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
          >
            {t('common.all')}
          </Button>
          <Button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'btn-primary' : 'btn-secondary'}
          >
            {t('purchases.pending')}
          </Button>
          <Button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'btn-primary' : 'btn-secondary'}
          >
            {t('purchases.completed')}
          </Button>
          <Button
            onClick={() => setFilter('cancelled')}
            className={filter === 'cancelled' ? 'btn-primary' : 'btn-secondary'}
          >
            {t('purchases.cancelled')}
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>{t('common.loading')}</div>
        ) : purchases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>{t('purchases.noPurchases')}</div>
        ) : (
          <Table columns={columns} data={purchases} />
        )}
      </Card>
    </div>
  );
};

export default Purchases;