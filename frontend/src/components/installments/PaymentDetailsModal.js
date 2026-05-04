import React, { memo } from 'react';
import { FaReceipt, FaBox, FaHistory, FaTimes, FaUser, FaCalendar, FaMoneyBill, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const PaymentDetailsModal = memo(({ sale, onClose, onMakePayment, paymentAmount, setPaymentAmount, paymentNotes, setPaymentNotes }) => {
  if (!sale) return null;

  // Calculate correct values from items
  const itemsTotal = sale.items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
  const correctTotal = itemsTotal > 0 ? itemsTotal : sale.total_amount || 0;
  const correctDownPayment = sale.down_payment || 0;
  const totalPaid = sale.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
  const rawRemaining = correctTotal - correctDownPayment - totalPaid;
  const correctRemaining = rawRemaining < 0.01 ? 0 : Math.round(rawRemaining * 100) / 100;
  const correctStatus = correctRemaining === 0 ? 'completed' : sale.status;

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusBadge = (status) => {
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '24px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
            padding: '2rem',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}>
                <FaReceipt size={24} />
              </div>
              <div>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  تفاصيل الأقساط
                </h2>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
                  معلومات كاملة عن البيع بالأقساط
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Customer Info Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaUser style={{ color: '#9b59b6', fontSize: '1.25rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.125rem' }}>العميل</div>
                  <div style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>{sale.customer_name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaCalendar style={{ color: '#9b59b6', fontSize: '1.25rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.125rem' }}>تاريخ البدء</div>
                  <div style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>{new Date(sale.start_date).toLocaleDateString('ar-SA')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaClock style={{ color: '#9b59b6', fontSize: '1.25rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.125rem' }}>الحالة</div>
                  {getStatusBadge(correctStatus)}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaMoneyBill style={{ color: '#10b981', fontSize: '1.25rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.125rem' }}>الإجمالي</div>
                  <div style={{ fontSize: '1.125rem', color: '#10b981', fontWeight: 700 }}>{formatCurrency(correctTotal)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaCheckCircle style={{ color: '#f59e0b', fontSize: '1.25rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.125rem' }}>الدفعة الأولى</div>
                  <div style={{ fontSize: '1.125rem', color: '#f59e0b', fontWeight: 700 }}>{formatCurrency(correctDownPayment)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaCheckCircle style={{ color: '#3b82f6', fontSize: '1.25rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.125rem' }}>المتبقي</div>
                  <div style={{ fontSize: '1.125rem', color: '#3b82f6', fontWeight: 700 }}>{formatCurrency(correctRemaining)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}>
                <FaBox size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                الأصناف
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sale.items && sale.items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6366f1',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.125rem' }}>
                        {item.item_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        الكمية: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                      {formatCurrency(item.total_price)}
                    </div>
                    {item.current_stock !== undefined && item.current_stock <= 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FaExclamationTriangle size={12} /> غير متوفر
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}>
                <FaHistory size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                سجل الدفعات
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sale.payments && sale.payments.length > 0 ? (
                sale.payments.map((payment, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid #bae6fd',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}>
                          {payment.month_number}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
                            {new Date(payment.payment_date).toLocaleDateString('ar-SA')}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#3b82f6' }}>
                        {formatCurrency(payment.amount)}
                      </div>
                    </div>
                    {payment.notes && (
                      <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, paddingTop: '0.5rem', borderTop: '1px solid #bae6fd' }}>
                        ملاحظات: {payment.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                  لا توجد مدفوعات مسجلة
                </div>
              )}
            </div>
          </div>

          {/* New Payment Form */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #fcd34d',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}>
                <FaMoneyBill size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                تسجيل دفعة جديدة
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#1e293b', fontWeight: 600, marginBottom: '0.5rem' }}>
                  المبلغ (IQD)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="أدخل المبلغ"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #fcd34d',
                    fontSize: '1rem',
                    background: '#fff',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#1e293b', fontWeight: 600, marginBottom: '0.5rem' }}>
                  ملاحظات
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="ملاحظات اختيارية"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #fcd34d',
                    fontSize: '1rem',
                    background: '#fff',
                  }}
                />
              </div>
            </div>
            <button
              onClick={onMakePayment}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              تسجيل الدفعة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PaymentDetailsModal;
