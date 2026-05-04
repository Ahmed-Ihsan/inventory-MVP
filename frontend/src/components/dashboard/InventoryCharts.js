import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import { FaChartPie } from 'react-icons/fa';
import apiService from '../../services/apiService';

const chartTooltipStyle = {
  background: 'var(--color-card-background)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  boxShadow: 'var(--shadow-lg)',
  color: 'var(--color-text)',
  fontSize: '0.8125rem',
};

const EmptyState = ({ loading }) => (
  <div style={{
    height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-text-muted)', fontSize: '0.875rem',
  }}>
    {loading ? '...' : 'لا توجد بيانات'}
  </div>
);

const InventoryCharts = () => {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDimensions, setHasDimensions] = useState(false);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const checkDimensions = () => {
      if (chartContainerRef.current) {
        const { width, height } = chartContainerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setHasDimensions(true);
        }
      }
    };

    checkDimensions();
    const timeoutId = setTimeout(checkDimensions, 100);
    window.addEventListener('resize', checkDimensions);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkDimensions);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const stockLevels = await apiService.getStockLevels();

        // Inventory health: compute real percentages from stock levels
        const total = stockLevels.length;
        if (total > 0) {
          const healthy = stockLevels.filter(i => i.current_stock > i.min_stock_level).length;
          const low = stockLevels.filter(i => i.current_stock > 0 && i.current_stock <= i.min_stock_level).length;
          const out = stockLevels.filter(i => i.current_stock === 0).length;
          setHealthData([
            { key: 'healthyStock',  value: Math.round((healthy / total) * 100), color: 'var(--color-success)' },
            { key: 'lowStockItems', value: Math.round((low    / total) * 100), color: 'var(--color-warning)' },
            { key: 'outOfStock',    value: Math.round((out    / total) * 100), color: 'var(--color-danger)'  },
          ].filter(d => d.value > 0));
        }
      } catch {
        // silent — parent dashboard shows error if needed
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="dashboard-charts-row">
      {/* Inventory health pie chart */}
      <div className="dashboard-card">
        <div className="card-section-header">
          <div className="card-section-icon" style={{ background: 'var(--color-accent-50)', color: 'var(--color-accent)' }}>
            <FaChartPie />
          </div>
          <h3 className="card-section-title">{t('dashboard.charts.inventoryHealth')}</h3>
        </div>
        <div style={{ width: '100%', height: 240, minWidth: 0 }}>
          {!loading && healthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240} debounce={0}>
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%" cy="45%"
                  innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value"
                >
                  {healthData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(v) => [`${v}%`, '']}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      {t(`dashboard.charts.${value}`)}
                    </span>
                  )}
                  payload={healthData.map((d) => ({ value: d.key, color: d.color, type: 'circle' }))}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCharts;
