import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import { FaBell, FaExclamationTriangle, FaStar, FaMedkit, FaShoppingCart } from 'react-icons/fa';
import apiService from '../../services/apiService';
import { Card as ShadcnCard, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

const RANK_COLORS = ['#f39c12', '#a0aec0', '#cd7f32'];

const EmptyRow = ({ text, success }) => (
  <div className="text-center py-8 text-sm font-semibold">
    <span className={cn(success ? 'text-emerald-600' : 'text-muted-foreground')}>
      {text}
    </span>
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
        stockLevels.forEach((i) => {
          itemMap[i.id] = i.name;
        });

        // Active alerts with stock data
        setAlerts(
          alertsData
            .filter((a) => a.is_active)
            .slice(0, 5)
            .map((a) => {
              const item = stockLevels.find((i) => i.id === a.item_id);
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
            .filter((i) => i.current_stock <= i.min_stock_level)
            .sort((a, b) => a.current_stock - b.current_stock)
            .slice(0, 5)
        );

        // Top moving items — ranked by total movement count
        const moveCounts = {};
        movementsData.forEach((m) => {
          moveCounts[m.item_id] = (moveCounts[m.item_id] || 0) + 1;
        });
        const topNames = Object.entries(moveCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([id]) => itemMap[Number(id)])
          .filter(Boolean);
        setTopItems(topNames.length > 0 ? topNames : stockLevels.slice(0, 5).map((i) => i.name));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {/* Active Alerts */}
      <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <FaBell style={{ fontSize: '14px' }} className="sm:text-[16px]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">{t('dashboard.insights.activeAlerts')}</h3>
          </div>
          {loading ? (
            <EmptyRow text="..." />
          ) : alerts.length === 0 ? (
            <EmptyRow text="✓ لا توجد تنبيهات نشطة" success />
          ) : (
            <div className="flex flex-col gap-2 sm:gap-2.5">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex justify-between items-center p-2.5 sm:p-3.5 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn(
                      'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg',
                      alert.alert_type === 'out_of_stock' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                    )}>
                      <FaBell style={{ fontSize: '13px' }} className="sm:text-[15px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                        {alert.itemName}
                      </div>
                      <div className={cn(
                        'text-[10px] sm:text-xs font-medium',
                        alert.alert_type === 'out_of_stock' ? 'text-red-600' : 'text-amber-600'
                      )}>
                        {alert.currentStock} / {alert.minStock}{' '}
                        {t('dashboard.insights.unitsRemaining')}
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    'px-1.5 sm:px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold',
                    alert.alert_type === 'out_of_stock' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                  )}>
                    {alert.alert_type === 'out_of_stock' ? 'نفاد المخزون' : 'مخزون منخفض'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ShadcnCard>

      {/* Critical low stock */}
      <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
              <FaExclamationTriangle style={{ fontSize: '14px' }} className="sm:text-[16px]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">{t('dashboard.insights.criticalLowStock')}</h3>
          </div>
          {loading ? (
            <EmptyRow text="..." />
          ) : criticalItems.length === 0 ? (
            <EmptyRow text="✓ جميع المنتجات ضمن المستوى الطبيعي" success />
          ) : (
            <div className="flex flex-col gap-2 sm:gap-2.5">
              {criticalItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                      <FaMedkit style={{ fontSize: '13px' }} className="sm:text-[15px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] sm:text-xs font-medium text-red-600">
                        {item.current_stock} {t('dashboard.insights.unitsRemaining')}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="text-[10px] sm:text-xs w-full sm:w-auto">
                    <FaShoppingCart style={{ fontSize: '10px' }} className="sm:text-[11px] mr-1" />
                    {t('dashboard.insights.quickReorder')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ShadcnCard>

      {/* Top moving items */}
      <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <FaStar style={{ fontSize: '14px' }} className="text-amber-500 sm:text-[16px]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">{t('dashboard.insights.topMovingItems')}</h3>
          </div>
          {loading ? (
            <EmptyRow text="..." />
          ) : topItems.length === 0 ? (
            <EmptyRow text="لا توجد بيانات حركة" />
          ) : (
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {topItems.map((item, i) => (
                <div
                  key={`top-${item}`}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg border border-border"
                >
                  <div
                    className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg text-[10px] sm:text-xs font-bold text-white"
                    style={{ background: RANK_COLORS[i] ?? 'hsl(var(--border))' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs sm:text-sm text-foreground truncate">
                      {item}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      أعلى أداء في الفترة الحالية
                    </div>
                  </div>
                  {i < 3 && (
                    <FaStar className="text-amber-500 text-xs sm:text-sm shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ShadcnCard>
    </div>
  );
};

export default ActionableInsights;
