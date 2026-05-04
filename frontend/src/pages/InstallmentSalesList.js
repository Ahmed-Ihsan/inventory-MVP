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
import PaymentDetailsModal from '../components/installments/PaymentDetailsModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const InstallmentSalesList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

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
        filters.overdue_only = true;
      } else if (statusFilter) {
        filters.status = statusFilter;
      }
      
      const salesData = await apiService.getInstallmentSales(filters);
      
      // Calculate correct values for each sale
      const salesWithCalculations = salesData.map(sale => {
        const itemsTotal = sale.items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
        const correctTotal = itemsTotal > 0 ? itemsTotal : sale.total_amount || 0;
        const correctDownPayment = sale.down_payment || 0;
        const totalPaid = sale.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
        const rawRemaining = correctTotal - correctDownPayment - totalPaid;
        const correctRemaining = Math.max(0, Math.round(rawRemaining));
        const correctStatus = correctRemaining === 0 ? 'completed' : sale.status;
        
        return {
          ...sale,
          _correctTotal: correctTotal,
          _correctDownPayment: correctDownPayment,
          _correctRemaining: correctRemaining,
          _correctStatus: correctStatus
        };
      });
      
      setSales(salesWithCalculations);
    } catch (error) {
      addToast('خطأ في تحميل بيانات الأقساط', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setPaymentAmount(0);
    setPaymentNotes('');
    setShowPaymentModal(true);
    checkItemStock(sale);
  };

  const checkItemStock = async (sale) => {
    try {
      const itemsWithStock = await Promise.all(
        (sale.items || []).map(async (item) => {
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

    if (paymentAmount > selectedSale._correctRemaining) {
      addToast('المبلغ المدخل أكبر من المبلغ المتبقي', 'error');
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

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteSale = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiService.deleteInstallmentSale(confirmDeleteId);
      addToast('تم حذف البيع بنجاح', 'success');
      setConfirmDeleteId(null);
      loadSales();
    } catch (error) {
      addToast('خطأ في حذف البيع: ' + error.message, 'error');
    }
  };

  const handleExportPayments = async (saleId) => {
    try {
      const blob = await apiService.exportPaymentHistory(saleId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_history_${saleId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('تم تصدير سجل المدفوعات', 'success');
    } catch (error) {
      addToast('خطأ في تصدير المدفوعات: ' + error.message, 'error');
    }
  };

  const getStatusBadge = (sale) => {
    const status = sale._correctStatus !== undefined ? sale._correctStatus : sale.status;
    const statusStyles = {
      active: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' },
      completed: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff' },
      cancelled: { background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', color: '#fff' },
      overdue: { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff' },
    };
    const style = statusStyles[status] || statusStyles.active;
    
    return (
      <span style={{
        ...style,
        padding: '0.375rem 0.875rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {status === 'active' ? 'نشط' : status === 'completed' ? 'مكتمل' : status === 'cancelled' ? 'ملغي' : status === 'overdue' ? 'متأخر' : status}
      </span>
    );
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer_phone && sale.customer_phone.includes(searchTerm));
    
    if (statusFilter === 'overdue') {
      // Check if status is overdue OR if it's active with past due date
      const isOverdue = sale.status === 'overdue' || 
                       (sale.status === 'active' && sale.next_payment_date && new Date(sale.next_payment_date) < new Date());
      return matchesSearch && isOverdue;
    }
    
    if (statusFilter && statusFilter !== 'overdue') {
      return matchesSearch && (sale._correctStatus || sale.status) === statusFilter;
    }
    
    return matchesSearch;
  });

  const overdueSales = sales.filter(sale => 
    sale.status === 'overdue' || (sale.status === 'active' && sale.next_payment_date && new Date(sale.next_payment_date) < new Date())
  );

  const columns = [
    { header: 'العميل', accessor: 'customer_name', sortable: true },
    { header: 'الهاتف', accessor: 'customer_phone', sortable: true },
    { header: 'الإجمالي (د.ع.)', accessor: 'total_amount', sortable: true, render: (sale) => formatCurrency(sale._correctTotal || 0) },
    { header: 'المتبقي (د.ع.)', accessor: 'remaining_amount', sortable: true, render: (sale) => formatCurrency(sale._correctRemaining || 0) },
    { header: 'القسط الشهري (د.ع.)', accessor: 'monthly_payment', sortable: true, render: (sale) => {
      const correctRemaining = sale._correctRemaining !== undefined ? sale._correctRemaining : (sale.total_amount - (sale.down_payment || 0));
      const remainingMonths = sale.total_months - sale.paid_months;
      const correctMonthly = remainingMonths > 0 ? Math.round(correctRemaining / remainingMonths) : 0;
      return formatCurrency(correctMonthly);
    }},
    { header: 'الأقساط المدفوعة', accessor: 'paid_months', sortable: true, render: (sale) => `${sale.paid_months}/${sale.total_months}` },
    { header: 'الدفعة القادمة', accessor: 'next_payment_date', sortable: true, render: (sale) => sale.next_payment_date ? new Date(sale.next_payment_date).toLocaleDateString('ar-SA') : '-' },
    { header: 'الحالة', accessor: 'status', sortable: true, render: (sale) => getStatusBadge(sale) },
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (sale) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button onClick={() => handleViewDetails(sale)} size="sm">
            <FaEye size={12} style={{ marginLeft: '0.25rem' }} /> عرض
          </Button>
          <Button onClick={() => handleExportPayments(sale.id)} size="sm" variant="secondary">
            <FaReceipt size={12} style={{ marginLeft: '0.25rem' }} /> تصدير
          </Button>
          <Button onClick={() => setConfirmDeleteId(sale.id)} size="sm" variant="danger">
            حذف
          </Button>
        </div>
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
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{sales.filter(s => s._correctStatus === 'active').length}</div>
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
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{sales.filter(s => s._correctStatus === 'completed').length}</div>
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
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{overdueSales.length}</div>
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
        <PaymentDetailsModal
          sale={selectedSale}
          onClose={() => setShowPaymentModal(false)}
          onMakePayment={handleMakePayment}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentNotes={paymentNotes}
          setPaymentNotes={setPaymentNotes}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="حذف البيع بالأقساط"
        message="هل أنت متأكد من حذف هذا البيع بالأقساط؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleDeleteSale}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default InstallmentSalesList;
