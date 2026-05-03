import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaUser, FaEye, FaCheck, FaClock, FaExclamationCircle, FaPlus, FaFilter, FaReceipt, FaBox, FaHistory } from 'react-icons/fa';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';

const InstallmentSalesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadSales();
  }, [statusFilter]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter === 'overdue') {
        // For overdue, we need to get all active sales and filter client-side
        const allSales = await apiService.getInstallmentSales({ status: 'active' });
        setSales(allSales);
      } else if (statusFilter) {
        filters.status = statusFilter;
        const salesData = await apiService.getInstallmentSales(filters);
        setSales(salesData);
      } else {
        const salesData = await apiService.getInstallmentSales(filters);
        setSales(salesData);
      }
    } catch (error) {
      addToast('خطأ في تحميل بيانات الأقساط', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setShowPaymentModal(true);
    checkItemStock(sale);
  };

  const checkItemStock = async (sale) => {
    try {
      const itemsWithStock = await Promise.all(
        sale.items.map(async (item) => {
          try {
            const itemDetails = await apiService.getItem(item.item_id);
            return { ...item, current_stock: itemDetails.current_stock };
          } catch {
            return { ...item, current_stock: 0 };
          }
        })
      );
      setSelectedSale({ ...sale, items: itemsWithStock });
    } catch (error) {
      console.error('Error checking stock:', error);
    }
  };

  const handleMakePayment = async () => {
    if (!selectedSale || paymentAmount <= 0) {
      addToast('يرجى إدخال مبلغ صحيح', 'error');
      return;
    }

    // Check if any items are out of stock
    const outOfStockItems = selectedSale.items.filter(item => item.current_stock <= 0);
    if (outOfStockItems.length > 0) {
      addToast(`لا يمكن الدفع - الأصناف التالية غير متوفرة في المخزون: ${outOfStockItems.map(i => i.item_name).join(', ')}`, 'error');
      return;
    }

    try {
      const paymentData = {
        payment_date: new Date().toISOString(),
        amount: paymentAmount,
        month_number: selectedSale.paid_months + 1,
        notes: paymentNotes,
      };

      await apiService.createInstallmentSalePayment(selectedSale.id, paymentData);
      addToast('تم تسجيل الدفعة بنجاح', 'success');
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setPaymentNotes('');
      loadSales();
    } catch (error) {
      addToast('خطأ في تسجيل الدفعة', 'error');
    }
  };

  const getStatusBadge = (sale) => {
    if (sale.status === 'completed') {
      return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', background: '#10b98120', color: '#fff', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><FaCheck size={10} /> مكتمل</span>;
    } else if (sale.status === 'cancelled') {
      return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', background: '#ef444420', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>ملغي</span>;
    } else if (sale.next_payment_date && new Date(sale.next_payment_date) < new Date()) {
      return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', background: '#f59e0b20', color: '#fff', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><FaExclamationCircle size={10} /> متأخر</span>;
    }
    return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', background: '#3b82f620', color: '#fff', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><FaClock size={10} /> نشط</span>;
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer_phone && sale.customer_phone.includes(searchTerm));
    
    if (statusFilter === 'overdue') {
      return matchesSearch && sale.status === 'active' && sale.next_payment_date && new Date(sale.next_payment_date) < new Date();
    }
    
    if (statusFilter && statusFilter !== 'overdue') {
      return matchesSearch && sale.status === statusFilter;
    }
    
    return matchesSearch;
  });

  const overdueSales = sales.filter(sale => 
    sale.status === 'active' && sale.next_payment_date && new Date(sale.next_payment_date) < new Date()
  );

  const columns = [
    { header: 'العميل', accessor: 'customer_name', sortable: true },
    { header: 'الهاتف', accessor: 'customer_phone', sortable: true },
    { header: 'الإجمالي (د.ع.)', accessor: 'total_amount', sortable: true, render: (sale) => sale.total_amount.toLocaleString() },
    { header: 'القسط الشهري (د.ع.)', accessor: 'monthly_payment', sortable: true, render: (sale) => sale.monthly_payment.toLocaleString() },
    { header: 'الأقساط المدفوعة', accessor: 'paid_months', sortable: true, render: (sale) => `${sale.paid_months}/${sale.total_months}` },
    { header: 'الدفعة القادمة', accessor: 'next_payment_date', sortable: true, render: (sale) => sale.next_payment_date ? new Date(sale.next_payment_date).toLocaleDateString('ar-SA') : '-' },
    { header: 'الحالة', accessor: 'status', sortable: true, render: (sale) => getStatusBadge(sale) },
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (sale) => (
        <Button onClick={() => handleViewDetails(sale)} size="sm">
          <FaEye size={12} style={{ marginLeft: '0.25rem' }} /> عرض
        </Button>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="page">
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 20px 60px rgba(102,126,234,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 1 }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: '20px', 
            background: 'rgba(255,255,255,0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.75rem', 
            color: '#fff', 
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}>
            <FaCalendarAlt />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, letterSpacing: '-0.03em', textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>سجل الأقساط</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', marginTop: '0.35rem', fontWeight: 500 }}>عرض وإدارة جميع مبيعات الأقساط</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/installment-sales')}
          style={{
            padding: '0.875rem 1.75rem',
            borderRadius: '14px',
            background: '#fff',
            color: '#667eea',
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
          }}
          hoverStyle={{
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
          }}
        >
          <FaPlus size={14} style={{ marginLeft: '0.5rem' }} /> إضافة قسط جديد
        </Button>
      </div>

      {/* Overdue Alert */}
      {overdueSales.length > 0 && (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 12px 40px rgba(239,68,68,0.3)',
          animation: 'pulse 2s infinite',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FaExclamationCircle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              تنبيه: {overdueSales.length} زبون متأخر عن السداد
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.95 }}>
              يرجى متابعة الزبائن المتأخرين لاستلام الأقساط المستحقة
            </p>
          </div>
          <Button
            onClick={() => setStatusFilter('overdue')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              padding: '0.625rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              backdropFilter: 'blur(4px)',
            }}
          >
            عرض المتأخرين
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
        <div style={{
          padding: '2rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          boxShadow: '0 20px 60px rgba(16,185,129,0.35)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'default',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: 700, letterSpacing: '0.02em' }}>إجمالي الأقساط</span>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <FaCheck size={20} style={{ opacity: 0.9 }} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{sales.length}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>سجل نشط</div>
        </div>

        <div style={{
          padding: '2rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: '#fff',
          boxShadow: '0 20px 60px rgba(59,130,246,0.35)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'default',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: 700, letterSpacing: '0.02em' }}>نشط</span>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <FaClock size={20} style={{ opacity: 0.9 }} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{sales.filter(s => s.status === 'active').length}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>قسط جاري</div>
        </div>

        <div style={{
          padding: '2rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: '#fff',
          boxShadow: '0 20px 60px rgba(139,92,246,0.35)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'default',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: 700, letterSpacing: '0.02em' }}>مكتمل</span>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <FaCheck size={20} style={{ opacity: 0.9 }} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{sales.filter(s => s.status === 'completed').length}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>دفعة مكتملة</div>
        </div>

        <div style={{
          padding: '2rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#fff',
          boxShadow: '0 20px 60px rgba(245,158,11,0.35)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'default',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.95, fontWeight: 700, letterSpacing: '0.02em' }}>متأخر</span>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <FaExclamationCircle size={20} style={{ opacity: 0.9 }} />
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{sales.filter(s => s.status === 'active' && s.next_payment_date && new Date(s.next_payment_date) < new Date()).length}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>قسط متأخر</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        background: 'var(--color-card-background)', 
        borderRadius: '28px', 
        border: '1px solid var(--color-border-light)', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)', 
        padding: '2.5rem',
      }}>
        {/* Filter Section */}
        <div style={{ 
          display: 'flex', 
          gap: '1.25rem', 
          marginBottom: '2.5rem', 
          flexWrap: 'wrap',
          padding: '1.75rem',
          background: 'var(--color-surface)',
          borderRadius: '20px',
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <Input
            placeholder="بحث باسم العميل أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              flex: 1, 
              minWidth: '280px',
              padding: '1rem 1.5rem',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '14px',
              border: '1px solid var(--color-border-light)',
              background: 'var(--color-card-background)',
              fontSize: '1rem',
              color: 'var(--color-text)',
              cursor: 'pointer',
              minWidth: '200px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
            }}
          >
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
            <option value="overdue">متأخر</option>
          </select>
        </div>

        {filteredSales.length === 0 ? (
          <EmptyState
            type="no-results"
            onAction={() => setSearchTerm('')}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredSales}
          />
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedSale && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'var(--color-card-background)',
            borderRadius: '28px',
            padding: '2.5rem',
            maxWidth: '650px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 32px 96px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease',
          }}>
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--color-border-light)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(102,126,234,0.35)',
                }}>
                  <FaReceipt size={24} style={{ color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>تفاصيل الأقساط</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>عرض وتسجيل دفعات الأقساط</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{ 
                  background: 'var(--color-surface)', 
                  border: '1px solid var(--color-border-light)', 
                  fontSize: '1.25rem', 
                  cursor: 'pointer', 
                  color: 'var(--color-text-muted)', 
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-border-light)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-surface)';
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
              >
                ×
              </button>
            </div>

            {/* Customer Info Card */}
            <div style={{ marginBottom: '2rem', padding: '1.75rem', background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', borderRadius: '20px', border: '1px solid #667eea25' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#667eea', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>العميل</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.25rem' }}>{selectedSale.customer_name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#667eea', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>الحالة</span>
                  <div style={{ marginTop: '0.25rem' }}>{getStatusBadge(selectedSale)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#667eea', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>الإجمالي</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>{selectedSale.total_amount.toLocaleString()} د.ع.</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#667eea', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>المتبقي</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444', marginTop: '0.25rem' }}>{selectedSale.remaining_amount.toLocaleString()} د.ع.</div>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaBox size={16} style={{ color: '#fff' }} />
                </div>
                الأصناف
              </h3>
              {selectedSale.items && selectedSale.items.length > 0 ? (
                <>
                  <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedSale.items.map((item, index) => (
                      <div key={index} style={{
                        padding: '1.25rem',
                        borderRadius: '16px',
                        background: item.current_stock <= 0 ? '#ef444410' : 'var(--color-surface)',
                        border: item.current_stock <= 0 ? '1px solid #ef4444' : '1px solid var(--color-border-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: item.current_stock <= 0 ? '0 4px 16px rgba(239,68,68,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                      }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: item.current_stock <= 0 ? '#ef4444' : 'var(--color-text)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item.item_name}
                            {item.current_stock <= 0 && (
                              <span style={{ fontSize: '0.7rem', background: '#ef4444', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 600, letterSpacing: '0.02em' }}>
                                غير متوفر
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            الكمية: {item.quantity} × {item.selling_price.toLocaleString()} د.ع. · المخزون: {item.current_stock}
                          </div>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#667eea', background: '#667eea10', padding: '0.5rem 1rem', borderRadius: '10px' }}>
                          {item.total_price.toLocaleString()} د.ع.
                        </div>
                      </div>
                    ))}
                  </div>
                {selectedSale.items.some(item => item.current_stock <= 0) && (
                  <div style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ef444415 0%, #dc262615 100%)',
                    border: '1px solid #ef444430',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaExclamationCircle size={20} style={{ color: '#fff' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ef4444' }}>
                        لا يمكن تسجيل الدفعة
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        بعض الأصناف غير متوفرة في المخزون
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1.5rem', borderRadius: '16px', background: 'var(--color-surface)', border: '1px dashed var(--color-border-light)' }}>
                لا توجد أصناف
              </div>
            )}
            </div>

            {/* Payment History Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaHistory size={16} style={{ color: '#fff' }} />
                </div>
                سجل الدفعات
              </h3>
              {selectedSale.payments && selectedSale.payments.length > 0 ? (
                <div style={{ marginBottom: '1.5rem', maxHeight: '200px', overflow: 'auto', padding: '0.5rem' }}>
                  {selectedSale.payments.map((payment) => (
                    <div key={payment.id} style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b98110 0%, #05966910 100%)',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      border: '1px solid #10b98125',
                      transition: 'all 0.2s ease',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginBottom: '0.25rem' }}>القسط {payment.month_number}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{new Date(payment.payment_date).toLocaleDateString('ar-SA')}</div>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                          {payment.amount.toLocaleString()} د.ع.
                        </div>
                      </div>
                      {payment.notes && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500, paddingTop: '0.5rem', borderTop: '1px solid #10b98120' }}>
                          ملاحظات: {payment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', borderRadius: '16px', background: 'var(--color-surface)', border: '1px dashed var(--color-border-light)' }}>
                  لا توجد دفعات مسجلة
                </div>
              )}
            </div>

            {selectedSale.status === 'active' && selectedSale.paid_months < selectedSale.total_months && (
              <div style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)', borderRadius: '20px', border: '1px solid #667eea25' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaMoneyBillWave size={16} style={{ color: '#fff' }} />
                  </div>
                  تسجيل دفعة جديدة
                </h3>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                    المبلغ (IQD)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    placeholder={selectedSale.monthly_payment}
                    disabled={selectedSale.items.some(item => item.current_stock <= 0)}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '14px',
                      border: '1px solid var(--color-border-light)',
                      background: 'var(--color-card-background)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      opacity: selectedSale.items.some(item => item.current_stock <= 0) ? 0.6 : 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                    ملاحظات
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="ملاحظات اختيارية"
                    disabled={selectedSale.items.some(item => item.current_stock <= 0)}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '14px',
                      border: '1px solid var(--color-border-light)',
                      background: 'var(--color-card-background)',
                      fontSize: '1rem',
                      color: 'var(--color-text)',
                      opacity: selectedSale.items.some(item => item.current_stock <= 0) ? 0.6 : 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>
                <Button
                  onClick={handleMakePayment}
                  disabled={selectedSale.items.some(item => item.current_stock <= 0)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
                    opacity: selectedSale.items.some(item => item.current_stock <= 0) ? 0.6 : 1,
                    cursor: selectedSale.items.some(item => item.current_stock <= 0) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  تسجيل الدفعة
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallmentSalesList;
