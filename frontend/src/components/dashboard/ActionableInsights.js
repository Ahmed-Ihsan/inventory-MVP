import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import {
  FaBell, FaExclamationTriangle, FaStar,
  FaMedkit, FaShoppingCart,
} from 'react-icons/fa';
import apiService from '../../services/apiService';

const RANK_COLORS = ['#f39c12', '#a0aec0', '#cd7f32'];

const rowStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '0.875rem 1rem',
  background: 'var(--color-surface)',
  borderRadius: 'var(--border-radius-lg)',
  border: '1px solid var(--color-border-light)',
};

const EmptyRow = ({ text, success }) => (
  <div style={{
    textAlign: 'center', padding: '2rem 0',
    color: success ? 'var(--color-success)' : 'var(--color-text-muted)',
    fontSize: '0.875rem', fontWeight: 600,
  }}>
    {text}
  </div>
);

const ActionableInsights = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [criticalItems, setCriticalItems] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stockLevels, alertsData, movementsData] = await Promise.all([
          apiService.getStockLevels(),
          apiService.getAlerts(),
          apiService.getStockMovements(),
        ]);

        const itemMap = {};
        stockLevels.forEach(i => { itemMap[i.id] = i.name; });

        // Active alerts with stock data
        setAlerts(
          alertsData.filter(a => a.is_active).slice(0, 5)
            .map(a => {
              const item = stockLevels.find(i => i.id === a.item_id);
              return {
                ...a,
                itemName: itemMap[a.item_id] || `#${a.item_id}`,
                currentStock: item ? item.current_stock : '-',
                minStock: item ? item.min_stock_level : '-',
              };
            })
        );

        // Critical low stock — items at or below min level, sorted by lowest stock
        setCriticalItems(
          stockLevels
            .filter(i => i.current_stock <= i.min_stock_level)
            .sort((a, b) => a.current_stock - b.current_stock)
            .slice(0, 5)
        );

        // Top moving items — ranked by total movement count
        const moveCounts = {};
        movementsData.forEach(m => {
          moveCounts[m.item_id] = (moveCounts[m.item_id] || 0) + 1;
        });
        const topNames = Object.entries(moveCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([id]) => itemMap[Number(id)])
          .filter(Boolean);
        setTopItems(topNames.length > 0 ? topNames : stockLevels.slice(0, 5).map(i => i.name));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="dashboard-insights-row">
      {/* Active Alerts */}
      <div className="dashboard-card">
        <div className="card-section-header">
          <div className="card-section-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <FaBell />
          </div>
          <h3 className="card-section-title">{t('dashboard.insights.activeAlerts')}</h3>
        </div>
        {loading ? <EmptyRow text="..." /> : alerts.length === 0 ? (
          <EmptyRow text="✓ لا توجد تنبيهات نشطة" success />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {alerts.map((alert, i) => (
              <div key={i} style={rowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '10px',
                    background: alert.alert_type === 'out_of_stock' ? 'var(--color-danger-light)' : 'var(--color-warning-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: alert.alert_type === 'out_of_stock' ? 'var(--color-danger)' : 'var(--color-warning)',
                    flexShrink: 0,
                  }}>
                    <FaBell size={15} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                      {alert.itemName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: alert.alert_type === 'out_of_stock' ? 'var(--color-danger)' : 'var(--color-warning)', fontWeight: 500 }}>
                      {alert.currentStock} / {alert.minStock} {t('dashboard.insights.unitsRemaining')}
                    </div>
                  </div>
                </div>
                <span className={`badge badge-${alert.alert_type === 'out_of_stock' ? 'danger' : 'warning'}`}>
                  {alert.alert_type === 'out_of_stock' ? 'نفاد المخزون' : 'مخزون منخفض'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Critical low stock */}
      <div className="dashboard-card">
        <div className="card-section-header">
          <div className="card-section-icon" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
            <FaExclamationTriangle />
          </div>
          <h3 className="card-section-title">{t('dashboard.insights.criticalLowStock')}</h3>
        </div>
        {loading ? <EmptyRow text="..." /> : criticalItems.length === 0 ? (
          <EmptyRow text="✓ جميع المنتجات ضمن المستوى الطبيعي" success />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {criticalItems.map((item, i) => (
              <div key={i} style={rowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '10px',
                    background: 'var(--color-danger-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-danger)', flexShrink: 0,
                  }}>
                    <FaMedkit size={15} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                      {item.current_stock} {t('dashboard.insights.unitsRemaining')}
                    </div>
                  </div>
                </div>
                <Button className="btn-sm btn-warning">
                  <FaShoppingCart size={11} />
                  {t('dashboard.insights.quickReorder')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top moving items */}
      <div className="dashboard-card">
        <div className="card-section-header">
          <div className="card-section-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <FaStar style={{ color: 'var(--color-warning)' }} />
          </div>
          <h3 className="card-section-title">{t('dashboard.insights.topMovingItems')}</h3>
        </div>
        {loading ? <EmptyRow text="..." /> : topItems.length === 0 ? (
          <EmptyRow text="لا توجد بيانات حركة" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--color-surface)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border-light)' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '8px',
                  background: RANK_COLORS[i] ?? 'var(--color-border)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    أعلى أداء في الفترة الحالية
                  </div>
                </div>
                {i < 3 && <FaStar style={{ color: 'var(--color-warning)', fontSize: '0.85rem', flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionableInsights;
