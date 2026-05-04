import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import ConfirmDialog from '../components/common/ConfirmDialog';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaBell, FaExclamationCircle, FaCheckCircle, FaPlus } from 'react-icons/fa';

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
    { header: 'نوع التنبيه', accessor: 'alert_type', render: (row) => (
      <span style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', background: row.alert_type === 'low_stock' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
        {row.alert_type === 'low_stock' ? 'منخفض المخزون' : 'نفذ المخزون'}
      </span>
    )},
    { header: 'الرسالة', accessor: 'message' },
    { header: 'الحالة', accessor: 'is_active', render: (row) => (
      <span style={{ padding: '0.375rem 0.875rem', borderRadius: '9999px', background: row.is_active ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
        {row.is_active ? 'نشط' : 'معطل'}
      </span>
    )},
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => { setEditingAlert(row); setFormData(row); setIsEditing(true); }} style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', cursor: 'pointer' }}>
            تعديل
          </button>
          <button onClick={() => setConfirmDeleteId(row.id)} style={{ padding: '0.25rem 0.5rem', borderRadius: '8px', background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', cursor: 'pointer' }}>
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '24px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 20px 60px rgba(245,158,11,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: '#fff' }}>
            <FaBell />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800 }}>التنبيهات</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>إدارة تنبيهات المخزون</p>
          </div>
        </div>
        {!isEditing && (
          <button onClick={() => { setEditingAlert(null); setFormData({ item_id: '', alert_type: 'low_stock', message: '', is_active: true }); setIsEditing(true); }} style={{ background: '#fff', border: 'none', color: '#f59e0b', padding: '0.6rem 1.4rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaPlus size={13} /> إضافة تنبيه
          </button>
        )}
      </div>

      {isEditing && (
        <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '2px solid #f59e0b40', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontWeight: 700 }}>{editingAlert ? 'تعديل تنبيه' : 'إضافة تنبيه جديد'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>الصنف</label>
                <select value={formData.item_id} onChange={(e) => setFormData({ ...formData, item_id: e.target.value })} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                  <option value="">اختر الصنف</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>نوع التنبيه</label>
                <select value={formData.alert_type} onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                  <option value="low_stock">منخفض المخزون</option>
                  <option value="out_of_stock">نفذ المخزون</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>الرسالة</label>
                <input type="text" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)' }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                  نشط
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => { setIsEditing(false); setEditingAlert(null); }} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', cursor: 'pointer' }}>
                إلغاء
              </button>
              <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#f59e0b', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                حفظ
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--color-card-background)', borderRadius: '28px', border: '1px solid var(--color-border-light)', padding: '2.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>جاري التحميل...</div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <FaExclamationCircle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
            <h3>لا توجد تنبيهات</h3>
          </div>
        ) : (
          <Table columns={columns} data={alerts} />
        )}
      </div>

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
