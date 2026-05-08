import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaBox, FaExclamationTriangle, FaBell, FaDollarSign, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

const StatCard = ({ title, value, icon, iconClassName, valueClassName, trend, trendPositive }) => (
  <Card className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <CardContent className="relative p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 space-y-2 sm:space-y-3">
          <p className="text-[11px] sm:text-sm font-semibold text-muted-foreground tracking-wide uppercase">{title}</p>
          <p className={cn('text-xl sm:text-2xl md:text-3xl font-bold tabular-nums tracking-tight text-foreground drop-shadow-sm', valueClassName)}>
            {value}
          </p>
          {trend && (
            <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold tracking-wide', trendPositive ? 'bg-green-50 text-green-700 border border-green-200/80 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' : 'bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50')}>
              {trendPositive ? <FaArrowUp style={{ fontSize: '10px' }} className="sm:text-[11px]" /> : <FaArrowDown style={{ fontSize: '10px' }} className="sm:text-[11px]" />}
              {trend}
            </div>
          )}
        </div>
        <div className="relative group/icon shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
          <div className={cn('relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl text-base sm:text-lg shadow-sm ring-1 ring-border/50', iconClassName)}>
            {icon}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatCards = ({ stats, formatCurrency }) => {
  const { t } = useTranslation();
  const netPosition = stats.totalPaid - stats.totalDebt;

  const cards = [
    {
      title: t('dashboard.totalItems'),
      value: stats.totalItems,
      icon: <FaBox />,
      iconClassName: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      trend: '+5%',
      trendPositive: true,
    },
    {
      title: t('dashboard.lowStock'),
      value: stats.lowStock,
      icon: <FaExclamationTriangle />,
      iconClassName: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      valueClassName: stats.lowStock > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400',
      trend: stats.lowStock > 5 ? '+2%' : '-10%',
      trendPositive: stats.lowStock <= 5,
    },
    {
      title: t('dashboard.activeAlerts'),
      value: stats.activeAlerts,
      icon: <FaBell />,
      iconClassName: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
      valueClassName: stats.activeAlerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
      trend: stats.activeAlerts > 3 ? '+15%' : '-20%',
      trendPositive: stats.activeAlerts <= 3,
    },
    {
      title: t('dashboard.totalPaid'),
      value: formatCurrency(stats.totalPaid),
      icon: <FaDollarSign />,
      iconClassName: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400',
      valueClassName: 'text-green-600 dark:text-green-400',
      trend: '+12%',
      trendPositive: true,
    },
    {
      title: t('dashboard.totalDebt'),
      value: formatCurrency(stats.totalDebt),
      icon: <FaDollarSign />,
      iconClassName: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      valueClassName: 'text-amber-600 dark:text-amber-400',
      trend: '-8%',
      trendPositive: true,
    },
    {
      title: t('dashboard.netPosition'),
      value: formatCurrency(netPosition),
      icon: <FaChartLine />,
      iconClassName: netPosition >= 0
        ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
        : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
      valueClassName: netPosition >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      trend: netPosition >= 0 ? '+18%' : '-5%',
      trendPositive: netPosition >= 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default StatCards;
