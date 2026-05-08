import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import {
  FaCreditCard,
  FaBell,
  FaClock,
  FaPlus,
  FaExclamationTriangle,
  FaFileAlt,
} from 'react-icons/fa';
import apiService from '../../services/apiService';
import { Card as ShadcnCard, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

const relativeTime = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'منذ لحظات';
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
        stockLevels.forEach((i) => {
          itemMap[i.id] = i.name;
        });
        const recentMoves = [...movements]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5)
          .map((m, index) => ({
            id: m.id || `movement-${m.item_id}-${m.timestamp}-${index}`,
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
    <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FaBell style={{ fontSize: '14px' }} className="sm:text-[16px]" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-foreground">{t('dashboard.financials.quickActions')}</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-4 sm:mb-6">
          <Button onClick={() => navigate('/items/new')} className="text-[10px] sm:text-xs">
            <FaPlus style={{ fontSize: '12px' }} className="sm:text-[13px] mr-1" />
            {t('dashboard.financials.addNewDrug')}
          </Button>
          <Button onClick={() => navigate('/stock')} variant="warning" className="text-[10px] sm:text-xs">
            <FaExclamationTriangle style={{ fontSize: '12px' }} className="sm:text-[13px] mr-1" />
            {t('dashboard.financials.viewAlerts')}
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="text-[10px] sm:text-xs col-span-2">
            <FaFileAlt style={{ fontSize: '12px' }} className="sm:text-[13px] mr-1" />
            {t('dashboard.financials.generateReport')}
          </Button>
        </div>

        <div className="border-t border-border pt-4 sm:pt-5">
          <div className="flex items-center gap-2 mb-2 sm:mb-3.5">
            <FaClock className="text-muted-foreground text-xs sm:text-sm" />
            <h4 className="text-sm sm:text-base font-bold text-foreground">
              {t('dashboard.financials.activityLog')}
            </h4>
          </div>
          {loading ? (
            <div className="text-xs sm:text-sm text-muted-foreground">...</div>
          ) : activityLog.length === 0 ? (
            <div className="text-xs sm:text-sm text-muted-foreground text-center py-3 sm:py-4">
              لا توجد حركات مخزون
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {activityLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-muted rounded-lg border border-border"
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0',
                      entry.positive ? 'bg-emerald-600' : 'bg-amber-600'
                    )}
                  />
                  <span className="flex-1 text-[10px] sm:text-xs text-secondary-foreground truncate">
                    {entry.text}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                    {entry.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </ShadcnCard>
  );
};

export default FinancialSummary;
