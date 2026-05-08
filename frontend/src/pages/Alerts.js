import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import ConfirmDialog from '../components/common/ConfirmDialog';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaBell, FaExclamationCircle, FaCheckCircle, FaPlus } from 'react-icons/fa';
import { Card as ShadcnCard, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const Alerts = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    item_id: '',
    alert_type: 'low_stock',
    message: '',
    is_active: true,
  });

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAlerts();
      setAlerts(data);
    } catch (error) {
      addToast('خطأ في تحميل التنبيهات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingAlert) {
        await apiService.updateAlert(editingAlert.id, formData);
        addToast('تم تحديث التنبيه بنجاح', 'success');
      } else {
        await apiService.createAlert(formData);
        addToast('تم إضافة التنبيه بنجاح', 'success');
      }
      setIsEditing(false);
      setEditingAlert(null);
      setFormData({ item_id: '', alert_type: 'low_stock', message: '', is_active: true });
      loadAlerts();
    } catch (error) {
      addToast('خطأ: ' + error.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiService.deleteAlert(confirmDeleteId);
      addToast('تم حذف التنبيه بنجاح', 'success');
      setConfirmDeleteId(null);
      loadAlerts();
    } catch (error) {
      addToast('خطأ: ' + error.message, 'error');
    }
  };

  const columns = [
    { header: 'الصنف', accessor: 'item_name' },
    {
      header: 'نوع التنبيه',
      accessor: 'alert_type',
      render: (row) => (
        <span
          style={{
            padding: '0.375rem 0.875rem',
            borderRadius: '9999px',
            background:
              row.alert_type === 'low_stock'
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {row.alert_type === 'low_stock' ? 'منخفض المخزون' : 'نفذ المخزون'}
        </span>
      ),
    },
    { header: 'الرسالة', accessor: 'message' },
    {
      header: 'الحالة',
      accessor: 'is_active',
      render: (row) => (
        <span
          style={{
            padding: '0.375rem 0.875rem',
            borderRadius: '9999px',
            background: row.is_active
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {row.is_active ? 'نشط' : 'معطل'}
        </span>
      ),
    },
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              setEditingAlert(row);
              setFormData(row);
              setIsEditing(true);
            }}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-light)',
              cursor: 'pointer',
            }}
          >
            تعديل
          </button>
          <button
            onClick={() => setConfirmDeleteId(row.id)}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              background: '#ef444415',
              border: '1px solid #ef444430',
              color: '#ef4444',
              cursor: 'pointer',
            }}
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg text-2xl">
              <FaBell />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                التنبيهات
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium">
                إدارة تنبيهات المخزون
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              size="sm"
              onClick={() => {
                setEditingAlert(null);
                setFormData({ item_id: '', alert_type: 'low_stock', message: '', is_active: true });
                setIsEditing(true);
              }}
              className="bg-white text-orange-600 hover:bg-white/90 font-semibold shadow-lg w-full sm:w-auto"
            >
              <FaPlus size={12} className="sm:size-13 mr-2" />
              إضافة تنبيه
            </Button>
          )}
        </div>
      </div>

      {isEditing && (
        <ShadcnCard className="border-orange-500/30 shadow-lg shadow-orange-500/5">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 sm:mb-6">
              {editingAlert ? 'تعديل التنبيه' : 'إضافة تنبيه جديد'}
            </h3>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1.5 sm:mb-2 block">
                    الصنف
                  </label>
                  <input
                    type="text"
                    value={formData.item_id}
                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-border bg-muted text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1.5 sm:mb-2 block">
                    نوع التنبيه
                  </label>
                  <select
                    value={formData.alert_type}
                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-border bg-muted text-xs sm:text-sm cursor-pointer"
                  >
                    <option value="low_stock">منخفض المخزون</option>
                    <option value="out_of_stock">نفذ المخزون</option>
                  </select>
                </div>
              </div>
              <div className="mb-3 sm:mb-4">
                <label className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1.5 sm:mb-2 block">
                  الرسالة
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-border bg-muted text-xs sm:text-sm resize-vertical"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingAlert(null);
                    setFormData({ item_id: '', alert_type: 'low_stock', message: '', is_active: true });
                  }}
                  className="text-xs sm:text-sm"
                >
                  إلغاء
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm">
                  حفظ
                </Button>
              </div>
            </form>
          </CardContent>
        </ShadcnCard>
      )}

      <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
        <CardContent className="p-6 sm:p-8 md:p-10">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem sm:3rem' }} className="text-xs sm:text-sm">جاري التحميل...</div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem sm:4rem' }}>
            <FaExclamationCircle size={36} className="sm:size-48" style={{ color: '#f59e0b', marginBottom: '0.75rem sm:1rem' }} />
            <h3 className="text-sm sm:text-base">لا توجد تنبيهات</h3>
          </div>
        ) : (
          <Table columns={columns} data={alerts} />
        )}
        </CardContent>
      </ShadcnCard>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="حذف التنبيه"
        message="هل أنت متأكد من حذف هذا التنبيه؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default Alerts;
