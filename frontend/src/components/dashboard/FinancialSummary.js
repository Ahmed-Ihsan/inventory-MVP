import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import {
  FaCreditCard, FaBell, FaClock,
  FaPlus, FaExclamationTriangle, FaFileAlt,
} from 'react-icons/fa';
import apiService from '../../services/apiService';

const relativeTime = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return 'منذ لحظات';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
};

const FinancialSummary = ({ formatCurrency }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [movements, stockLevels] = await Promise.all([
          apiService.getStockMovements(),
          apiService.getStockLevels(),
        ]);

        // Activity log: last 5 stock movements with item names
        const itemMap = {};
        stockLevels.forEach(i => { itemMap[i.id] = i.name; });
        const recentMoves = [...movements]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5)
          .map(m => ({
            text: `${m.quantity_change > 0 ? 'إضافة' : 'سحب'} ${Math.abs(m.quantity_change)} وحدة — ${itemMap[m.item_id] || `#${m.item_id}`}`,
            time: relativeTime(m.timestamp),
            positive: m.quantity_change > 0,
          }));
        setActivityLog(recentMoves);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="dashboard-financials-row">
      {/* Quick actions + Activity log */}
      <div className="dashboard-card">
        <div className="card-section-header">
          <div className="card-section-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
            <FaBell />
          </div>
          <h3 className="card-section-title">{t('dashboard.financials.quickActions')}</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.5rem' }}>
          <Button className="btn-primary" onClick={() => navigate('/items/new')}>
            <FaPlus size={13} />
            {t('dashboard.financials.addNewDrug')}
          </Button>
          <Button className="btn-success" onClick={() => navigate('/payments')}>
            <FaCreditCard size={13} />
            {t('dashboard.financials.recordPayment')}
          </Button>
          <Button className="btn-warning" onClick={() => navigate('/stock')}>
            <FaExclamationTriangle size={13} />
            {t('dashboard.financials.viewAlerts')}
          </Button>
          <Button className="btn-secondary" onClick={() => window.print()}>
            <FaFileAlt size={13} />
            {t('dashboard.financials.generateReport')}
          </Button>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <FaClock style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }} />
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {t('dashboard.financials.activityLog')}
            </h4>
          </div>
          {loading ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>...</div>
          ) : activityLog.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
              لا توجد حركات مخزون
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activityLog.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--color-surface)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border-light)' }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: entry.positive ? 'var(--color-success)' : 'var(--color-warning)',
                  }} />
                  <span style={{ flex: 1, fontSize: '0.8375rem', color: 'var(--color-text-secondary)' }}>
                    {entry.text}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {entry.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
