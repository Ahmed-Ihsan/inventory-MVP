import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaBox,
  FaExclamationTriangle,
  FaBell,
  FaDollarSign,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

const StatCard = ({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  valueColor,
  statColor,
  performance,
  performancePositive,
}) => (
  <div className="stat-card dashboard-stat-card" style={{ '--stat-color': statColor }}>
    <div className="stat-card-top">
      <p className="stat-label">{title}</p>
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
    </div>
    <p className="stat-value" style={valueColor ? { color: valueColor } : {}}>
      {value}
    </p>
    {performance && (
      <div className="stat-card-footer">
        <span className={`stat-trend ${performancePositive ? 'up' : 'down'}`}>
          {performancePositive ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
          {performance}
        </span>
      </div>
    )}
  </div>
);

const StatCards = ({ stats, formatCurrency }) => {
  const { t } = useTranslation();
  const netPosition = stats.totalPaid - stats.totalDebt;

  const cards = [
    {
      title: t('dashboard.totalItems'),
      value: stats.totalItems,
      icon: <FaBox />,
      iconBg: 'var(--color-primary-50)',
      iconColor: 'var(--color-primary)',
      statColor: 'var(--color-primary)',
      performance: '+5%',
      performancePositive: true,
    },
    {
      title: t('dashboard.lowStock'),
      value: stats.lowStock,
      icon: <FaExclamationTriangle />,
      iconBg: 'var(--color-warning-light)',
      iconColor: 'var(--color-warning)',
      valueColor: stats.lowStock > 0 ? 'var(--color-warning)' : 'var(--color-success)',
      statColor: 'var(--color-warning)',
      performance: stats.lowStock > 5 ? '+2%' : '-10%',
      performancePositive: stats.lowStock <= 5,
    },
    {
      title: t('dashboard.activeAlerts'),
      value: stats.activeAlerts,
      icon: <FaBell />,
      iconBg: 'var(--color-danger-light)',
      iconColor: 'var(--color-danger)',
      valueColor: stats.activeAlerts > 0 ? 'var(--color-danger)' : 'var(--color-success)',
      statColor: 'var(--color-danger)',
      performance: stats.activeAlerts > 3 ? '+15%' : '-20%',
      performancePositive: stats.activeAlerts <= 3,
    },
    {
      title: t('dashboard.totalPaid'),
      value: formatCurrency(stats.totalPaid),
      icon: <FaDollarSign />,
      iconBg: 'var(--color-success-light)',
      iconColor: 'var(--color-success)',
      valueColor: 'var(--color-success)',
      statColor: 'var(--color-success)',
      performance: '+12%',
      performancePositive: true,
    },
    {
      title: t('dashboard.totalDebt'),
      value: formatCurrency(stats.totalDebt),
      icon: <FaDollarSign />,
      iconBg: 'var(--color-warning-light)',
      iconColor: 'var(--color-warning)',
      valueColor: 'var(--color-warning)',
      statColor: 'var(--color-warning)',
      performance: '-8%',
      performancePositive: true,
    },
    {
      title: t('dashboard.netPosition'),
      value: formatCurrency(netPosition),
      icon: <FaChartLine />,
      iconBg: netPosition >= 0 ? 'var(--color-success-light)' : 'var(--color-danger-light)',
      iconColor: netPosition >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
      valueColor: netPosition >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
      statColor: netPosition >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
      performance: netPosition >= 0 ? '+18%' : '-5%',
      performancePositive: netPosition >= 0,
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
};

export default StatCards;
