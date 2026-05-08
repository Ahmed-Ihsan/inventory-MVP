import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaWarehouse, FaChartLine, FaExchangeAlt } from 'react-icons/fa';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';
import StockTracking from './StockTracking';
import StockLevels from './StockLevels';
import StockMovements from './StockMovements';

const TABS = [
  { id: 'tracking', labelKey: 'stock.tracking', labelFallback: 'Stock Tracking', icon: FaWarehouse },
  { id: 'levels', labelKey: 'stock.levels', labelFallback: 'Stock Levels', icon: FaChartLine },
  { id: 'movements', labelKey: 'stock.movements', labelFallback: 'Stock Movements', icon: FaExchangeAlt },
];

const Stock = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('tracking');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg text-2xl">
              <FaWarehouse />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {t('nav.stock')}
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium">
                {t('stock.description', { defaultValue: 'Manage inventory levels and track movements' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed card */}
      <Card>
        {/* Tab bar */}
        <div
          className="flex gap-1 border-b border-border px-3 sm:px-4 pt-3 sm:pt-4"
          role="tablist"
          aria-label={t('nav.stock')}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const label = t(tab.labelKey, { defaultValue: tab.labelFallback });
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-t-md border-b-2 -mb-px outline-none flex-1 sm:flex-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  active
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <tab.icon className="text-sm" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab panels */}
        <CardContent className="pt-4 sm:pt-6">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`tabpanel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              hidden={activeTab !== tab.id}
            >
              {activeTab === tab.id && (
                tab.id === 'tracking' ? <StockTracking /> :
                tab.id === 'levels' ? <StockLevels /> :
                <StockMovements />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stock;
