import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import ConfirmDialog from '../components/common/ConfirmDialog';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaBell, FaCheck, FaTrash, FaSync } from 'react-icons/fa';
import { Card as ShadcnCard, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
              <FaBell size={24} className="sm:size-26 md:size-28" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                الإشعارات
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium">
                {notifications.length} إشعار · {unreadCount} غير مقروء
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckDuePayments}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <FaSync size={12} className="sm:size-13 mr-2" />
              فحص المستحق
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckOverduePayments}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <FaSync size={12} className="sm:size-13 mr-2" />
              فحص المتأخر
            </Button>
            {unreadCount > 0 && (
              <Button
                size="sm"
                onClick={handleMarkAllAsRead}
                className="bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-lg flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <FaCheck size={12} className="sm:size-13 mr-2" />
                تحديد الكل كمقروء
              </Button>
            )}
          </div>
        </div>
      </div>

      <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
        <CardContent className="p-4 sm:p-6 md:p-10">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem sm:3rem' }} className="text-xs sm:text-sm">جاري التحميل...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem sm:4rem' }}>
            <FaBell size={36} className="sm:size-48" style={{ color: '#667eea', marginBottom: '0.75rem sm:1rem', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem' }} className="text-sm sm:text-base">لا توجد إشعارات</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem sm:gap-1rem' }}>
            {notifications.map((notification, index) => (
              <div
                key={notification.id || `notification-${notification.created_at}-${index}`}
                style={{
                  padding: '1rem 1.25rem sm:padding: 1.25rem 1.5rem',
                  borderRadius: '12px sm:rounded-16px',
                  background: notification.is_read
                    ? 'var(--color-surface)'
                    : 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  border: notification.is_read
                    ? '1px solid var(--color-border-light)'
                    : '2px solid #667eea40',
                  display: 'flex',
                  alignItems: 'flex-start sm:items-center',
                  gap: '0.75rem sm:gap-1rem',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    smWidth: 44,
                    smHeight: 44,
                    borderRadius: '10px sm:rounded-12px',
                    background:
                      notification.notification_type === 'payment_due' ? '#f59e0b20' : '#ef444420',
                    color: notification.notification_type === 'payment_due' ? '#f59e0b' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FaBell size={14} className="sm:size-18" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{ margin: '0 0 0.25rem', fontWeight: 700, color: 'var(--color-text)' }}
                    className="text-sm sm:text-base"
                  >
                    {notification.notification_type === 'payment_due'
                      ? 'دفعة مستحقة'
                      : 'دفعة متأخرة'}
                  </h4>
                  <p
                    style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.8rem sm:fontSize: 0.9rem' }}
                  >
                    {notification.message}
                  </p>
                  <p
                    style={{
                      margin: '0.25rem 0 0',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.75rem sm:fontSize: 0.8rem',
                    }}
                  >
                    {new Date(notification.created_at).toLocaleString('ar-SA')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem sm:gap-0.5rem', flexShrink: 0 }}>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        width: 32,
                        height: 32,
                        smWidth: 36,
                        smHeight: 36,
                        borderRadius: '8px',
                        background: '#667eea15',
                        border: '1px solid #667eea30',
                        color: '#667eea',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FaCheck size={12} className="sm:size-14" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDeleteId(notification.id)}
                    style={{
                      width: 32,
                      height: 32,
                      smWidth: 36,
                      smHeight: 36,
                      borderRadius: '8px',
                      background: '#ef444415',
                      border: '1px solid #ef444430',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FaTrash size={12} className="sm:size-14" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </ShadcnCard>

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
