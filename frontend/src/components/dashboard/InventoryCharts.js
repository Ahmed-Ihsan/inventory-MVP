import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import { FaChartBar, FaChartPie } from 'react-icons/fa';
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
  const [chartData, setChartData] = useState([]);
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
        const [payments, stockLevels] = await Promise.all([
          apiService.getPayments(),
          apiService.getStockLevels(),
        ]);

        // Revenue vs Debt: group payments by calendar date
        const byDate = {};
        payments.forEach((p) => {
          const d = new Date(p.transaction_date);
          const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
          if (!byDate[key]) byDate[key] = { date: key, paid: 0, debt: 0, _ts: d.getTime() };
          if (p.payment_type === 'paid' || p.payment_type === 'credit') {
            byDate[key].paid += p.amount;
          } else if (p.payment_type === 'debt') {
            byDate[key].debt += p.amount;
          }
        });
        setChartData(
          Object.values(byDate)
            .sort((a, b) => a._ts - b._ts)
            .map(({ _ts, ...rest }) => rest)
        );

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
      {/* Revenue vs Debt line chart */}
      <div className="dashboard-card">
        <div className="card-section-header">
          <div className="card-section-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
            <FaChartBar />
          </div>
          <h3 className="card-section-title">{t('dashboard.charts.revenueVsDebt')}</h3>
        </div>
        <div style={{ width: '100%', height: 240, minWidth: 0 }}>
          {!loading && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240} debounce={0}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  labelStyle={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}
                />
                <Line
                  type="monotone" dataKey="paid"
                  stroke="var(--color-success)" strokeWidth={2.5}
                  name={t('dashboard.totalPaid')}
                  dot={false}
                  activeDot={{ r: 5, stroke: 'var(--color-success)', strokeWidth: 2 }}
                />
                <Line
                  type="monotone" dataKey="debt"
                  stroke="var(--color-danger)" strokeWidth={2.5}
                  name={t('dashboard.totalDebt')}
                  dot={false}
                  activeDot={{ r: 5, stroke: 'var(--color-danger)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState loading={loading} />
          )}
        </div>
      </div>

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
