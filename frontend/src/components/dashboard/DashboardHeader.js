import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import { FaSync, FaChartPie, FaCalendarAlt } from 'react-icons/fa';

const DashboardHeader = ({ onRefresh, loading }) => {
  const { t, i18n } = useTranslation();
  const formattedDate = new Date().toLocaleDateString(
    i18n.language === 'ar' ? 'ar-SA' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="dashboard-hero">
      <div className="dashboard-hero-content">
        <div className="dashboard-hero-icon">
          <FaChartPie />
        </div>
        <div>
          <h1 className="dashboard-hero-title">{t('nav.dashboard')}</h1>
          <p className="dashboard-hero-subtitle">{t('dashboard.welcome')}</p>
          <div className="dashboard-hero-status">
            <span className="dashboard-status-dot" />
            <span>جميع الأنظمة تعمل بشكل طبيعي</span>
          </div>
          <div className="dashboard-hero-date">
            <FaCalendarAlt size={11} />
            {formattedDate}
          </div>
        </div>
      </div>
      <Button
        onClick={onRefresh}
        loading={loading}
        className="btn-outline dashboard-hero-btn"
      >
        <FaSync size={13} />
        {t('dashboard.refreshData')}
      </Button>
    </div>
  );
};

export default DashboardHeader;
