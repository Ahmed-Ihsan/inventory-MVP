import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { FaChartPie } from 'react-icons/fa';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import apiService from '../../services/apiService';

const chartTooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  color: 'hsl(var(--foreground))',
  fontSize: '0.8125rem',
  padding: '8px 12px',
};

const EmptyState = ({ loading }) => (
  <div className="flex items-center justify-center h-48 sm:h-56 md:h-64 text-muted-foreground text-xs sm:text-sm">
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>{loading}</span>
      </div>
    ) : (
      <span>{'لا توجد بيانات'}</span>
    )}
  </div>
);

const InventoryCharts = () => {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDimensions, setHasDimensions] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          const healthy = stockLevels.filter((i) => i.current_stock > i.min_stock_level).length;
          const low = stockLevels.filter(
            (i) => i.current_stock > 0 && i.current_stock <= i.min_stock_level
          ).length;
          const out = stockLevels.filter((i) => i.current_stock === 0).length;
          setHealthData(
            [
              {
                key: 'healthyStock',
                value: Math.round((healthy / total) * 100),
                color: 'var(--color-success)',
              },
              {
                key: 'lowStockItems',
                value: Math.round((low / total) * 100),
                color: 'var(--color-warning)',
              },
              {
                key: 'outOfStock',
                value: Math.round((out / total) * 100),
                color: 'var(--color-danger)',
              },
            ].filter((d) => d.value > 0)
          );
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
    <Card className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="relative p-4 sm:p-6 md:p-8">
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative group/icon shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/20">
                <FaChartPie style={{ fontSize: '16px' }} className="sm:text-[18px] md:text-[20px]" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {t('dashboard.charts.inventoryHealth')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('dashboard.charts.inventoryHealthDescription')}
              </p>
            </div>
          </div>
        </div>
        <div className="h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 w-full" ref={chartContainerRef}>
          {!loading && healthData.length > 0 && hasDimensions ? (
            <ResponsiveContainer width="100%" height="100%" debounce={0}>
              <PieChart aria-label={t('dashboard.charts.inventoryHealth')} role="img">
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="45%"
                  innerRadius={windowSize.width < 640 ? 35 : windowSize.width < 768 ? 40 : 45}
                  outerRadius={windowSize.width < 640 ? 55 : windowSize.width < 768 ? 65 : 75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {healthData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, '']} />
                <Legend
                  iconType="circle"
                  iconSize={windowSize.width < 640 ? 8 : 10}
                  verticalAlign="bottom"
                  height={windowSize.width < 640 ? 40 : 60}
                  formatter={(value) => (
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                      {t(`dashboard.charts.${value}`)}
                    </span>
                  )}
                  payload={healthData.map((d) => ({
                    value: d.key,
                    color: d.color,
                    type: 'circle',
                  }))}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState loading={loading} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryCharts;
