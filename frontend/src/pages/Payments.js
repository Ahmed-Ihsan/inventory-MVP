import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import PaymentForm from '../components/payments/PaymentForm';
import { StatusBadge } from '../components/common/StatusBadge';
import apiService from '../services/apiService';
import { FaPlus, FaPrint, FaFilter, FaMoneyBillWave } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const Payments = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
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
      maximumFractionDigits: 0,
      numberingSystem: 'latn',
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePayment = async (paymentData) => {
    try {
      await apiService.createPayment(paymentData);
      addToast('تم حفظ الدفعة بنجاح', 'success');
      setModalOpen(false);
      loadPayments();
    } catch (error) {
      addToast('فشل حفظ الدفعة: ' + error.message, 'error');
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

  const FILTERS = ['all', 'paid', 'debt', 'credit'];
  const filterColors = { paid: '#2ecc71', debt: '#e74c3c', credit: '#3498db', all: 'var(--color-primary)' };

  return (
    <div className="page">
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2ecc71 0%, #1abc9c 100%)',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 8px 32px rgba(46,204,113,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
            <FaMoneyBillWave />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('payments.title')}</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>تتبع المدفوعات والديون والمبالغ المستحقة</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handlePrint} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, backdropFilter: 'blur(4px)', fontSize: '0.875rem' }}>
            <FaPrint size={13} /> {t('common.print')}
          </button>
          <button onClick={() => setModalOpen(true)} style={{ background: '#fff', border: 'none', color: '#2ecc71', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <FaPlus size={13} /> {t('payments.addPayment')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: t('payments.totalDebt'), value: formatCurrency(summary.totalDebt), color: '#e74c3c', icon: <FaMoneyBillWave />, bg: '#e74c3c15' },
          { label: t('payments.totalPaid'), value: formatCurrency(summary.totalPaid), color: '#2ecc71', icon: <FaPlus />, bg: '#2ecc7115' },
          { label: t('payments.overdue'), value: summary.overdueCount, color: '#f39c12', icon: <FaFilter />, bg: '#f39c1215' },
        ].map(({ label, value, color, icon, bg }) => (
          <div key={label} style={{ background: 'var(--color-card-background)', borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {/* Filter Bar */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: filter === f ? `2px solid ${filterColors[f]}` : '2px solid var(--color-border-light)',
              background: filter === f ? filterColors[f] + '18' : 'transparent',
              color: filter === f ? filterColors[f] : 'var(--color-text-muted)',
              transition: 'all 0.15s',
            }}>
              {f === 'all' ? t('common.all') : t(`payments.${f}`)}
            </button>
          ))}
        </div>

        <div style={{ padding: '0 0 1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>{t('common.loading')}</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-danger)' }}>{error}</div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: 'var(--color-text-muted)', margin: '0 auto 1rem' }}><FaMoneyBillWave /></div>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>لا توجد مدفوعات</p>
            </div>
          ) : (
            <Table columns={columns} data={payments} />
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('payments.addPayment')}>
        <PaymentForm onSave={handleSavePayment} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Payments;