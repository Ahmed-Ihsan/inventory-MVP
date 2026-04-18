import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import PaymentForm from '../components/payments/PaymentForm';
import { StatusBadge } from '../components/common/StatusBadge';
import apiService from '../services/apiService';
import { FaPlus, FaPrint, FaFilter } from 'react-icons/fa';

const Payments = () => {
  const { t, i18n } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalDebt: 0, totalPaid: 0, overdueCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = filter !== 'all' ? { payment_type: filter } : {};
      const [paymentsData, debtSummary, paidSummary] = await Promise.all([
        apiService.getPayments(filters),
        apiService.getTotalDebt(),
        apiService.getTotalPaid()
      ]);
      setPayments(paymentsData);
      setSummary({
        totalDebt: debtSummary.total_debt,
        totalPaid: paidSummary.total_paid,
        overdueCount: paymentsData.filter(p => p.status === 'overdue').length
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const formatCurrency = (amount) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePayment = async (paymentData) => {
    try {
      await apiService.createPayment(paymentData);
      setModalOpen(false);
      loadPayments();
    } catch (error) {
      alert('Failed to save payment: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      completed: 'success',
      overdue: 'danger'
    };
    return <StatusBadge status={statusMap[status] || 'warning'} />;
  };

  const getPaymentTypeBadge = (type) => {
    const typeMap = {
      paid: 'success',
      debt: 'danger',
      credit: 'info'
    };
    return <StatusBadge status={typeMap[type] || 'info'} />;
  };

  const columns = [
    {
      header: t('payments.date'),
      accessor: 'transaction_date',
      render: (row) => new Date(row.transaction_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')
    },
    { header: t('payments.amount'), accessor: 'amount', render: (row) => formatCurrency(row.amount) },
    {
      header: t('payments.type'),
      accessor: 'payment_type',
      render: (row) => getPaymentTypeBadge(row.payment_type)
    },
    { header: t('payments.description'), accessor: 'description' },
    {
      header: t('payments.status'),
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    }
  ];

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{t('payments.title')}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={handlePrint} className="btn-secondary">
            <FaPrint style={{ marginRight: '0.5rem' }} />
            {t('common.print')}
          </Button>
          <Button onClick={() => setModalOpen(true)} className="btn-primary">
            <FaPlus style={{ marginRight: '0.5rem' }} />
            {t('payments.addPayment')}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card className="text-center" style={{ padding: '1.5rem' }}>
          <h3>{t('payments.totalDebt')}</h3>
          <p style={{ fontSize: '1.5rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>{formatCurrency(summary.totalDebt)}</p>
        </Card>
        <Card className="text-center" style={{ padding: '1.5rem' }}>
          <h3>{t('payments.totalPaid')}</h3>
          <p style={{ fontSize: '1.5rem', color: 'var(--color-success)', fontWeight: 'bold' }}>{formatCurrency(summary.totalPaid)}</p>
        </Card>
        <Card className="text-center" style={{ padding: '1.5rem' }}>
          <h3>{t('payments.overdue')}</h3>
          <p style={{ fontSize: '1.5rem', color: 'var(--color-warning)', fontWeight: 'bold' }}>{summary.overdueCount}</p>
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <Button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
          >
            <FaFilter style={{ marginRight: '0.5rem' }} />
            {t('common.all')}
          </Button>
          <Button
            onClick={() => setFilter('paid')}
            className={filter === 'paid' ? 'btn-primary' : 'btn-secondary'}
          >
            {t('payments.paid')}
          </Button>
          <Button
            onClick={() => setFilter('debt')}
            className={filter === 'debt' ? 'btn-primary' : 'btn-secondary'}
          >
            {t('payments.debt')}
          </Button>
          <Button
            onClick={() => setFilter('credit')}
            className={filter === 'credit' ? 'btn-primary' : 'btn-secondary'}
          >
            {t('payments.credit')}
          </Button>
        </div>

        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <Table columns={columns} data={payments} />
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('payments.addPayment')}>
        <PaymentForm
          onSave={handleSavePayment}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Payments;