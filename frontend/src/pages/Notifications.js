import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import ConfirmDialog from '../components/common/ConfirmDialog';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaBell, FaCheck, FaTrash, FaSync } from 'react-icons/fa';

const Notifications = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotifications();
      setNotifications(data);
    } catch (error) {
      addToast('خطأ في تحميل الإشعارات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleMarkAsRead = async (id) => {
    try {
      await apiService.markNotificationAsRead(id);
      loadNotifications();
    } catch (error) {
      addToast('خطأ: ' + error.message, 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      addToast('تم تحديد الكل كمقروء', 'success');
      loadNotifications();
    } catch (error) {
      addToast('خطأ: ' + error.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiService.deleteNotification(confirmDeleteId);
      addToast('تم حذف الإشعار', 'success');
      setConfirmDeleteId(null);
      loadNotifications();
    } catch (error) {
      addToast('خطأ: ' + error.message, 'error');
    }
  };

  const handleCheckDuePayments = async () => {
    try {
      await apiService.checkDuePayments();
      addToast('تم فحص المدفوعات المستحقة', 'success');
      loadNotifications();
    } catch (error) {
      addToast('خطأ: ' + error.message, 'error');
    }
  };

  const handleCheckOverduePayments = async () => {
    try {
      await apiService.checkOverduePayments();
      addToast('تم فحص المدفوعات المتأخرة', 'success');
      loadNotifications();
    } catch (error) {
      addToast('خطأ: ' + error.message, 'error');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="page">
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
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: '#fff' }}>
            <FaBell />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800 }}>الإشعارات</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              {notifications.length} إشعار · {unreadCount} غير مقروء
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleCheckDuePayments} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaSync size={13} /> فحص المستحق
          </button>
          <button onClick={handleCheckOverduePayments} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaSync size={13} /> فحص المتأخر
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} style={{ background: '#fff', border: 'none', color: '#667eea', padding: '0.6rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCheck size={13} /> تحديد الكل كمقروء
            </button>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--color-card-background)', borderRadius: '28px', border: '1px solid var(--color-border-light)', padding: '2.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>جاري التحميل...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <FaBell size={48} style={{ color: '#667eea', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem' }}>لا توجد إشعارات</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '16px',
                  background: notification.is_read ? 'var(--color-surface)' : 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  border: notification.is_read ? '1px solid var(--color-border-light)' : '2px solid #667eea40',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: notification.notification_type === 'payment_due' ? '#f59e0b20' : '#ef444420', color: notification.notification_type === 'payment_due' ? '#f59e0b' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {notification.notification_type === 'payment_due' ? <FaBell size={18} /> : <FaBell size={18} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {notification.notification_type === 'payment_due' ? 'دفعة مستحقة' : 'دفعة متأخرة'}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    {notification.message}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {new Date(notification.created_at).toLocaleString('ar-SA')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!notification.is_read && (
                    <button onClick={() => handleMarkAsRead(notification.id)} style={{ width: 36, height: 36, borderRadius: '8px', background: '#667eea15', border: '1px solid #667eea30', color: '#667eea', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaCheck size={14} />
                    </button>
                  )}
                  <button onClick={() => setConfirmDeleteId(notification.id)} style={{ width: 36, height: 36, borderRadius: '8px', background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="حذف الإشعار"
        message="هل أنت متأكد من حذف هذا الإشعار؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default Notifications;
