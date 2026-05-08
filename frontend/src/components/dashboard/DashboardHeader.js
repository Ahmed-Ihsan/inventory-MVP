import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import { FaSync, FaChartPie, FaCalendarAlt, FaPrint } from 'react-icons/fa';

const DashboardHeader = ({ onRefresh, loading, onPrint }) => {
  const { t, i18n } = useTranslation();
  const formattedDate = new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-8">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/20">
              <FaChartPie style={{ fontSize: '20px' }} className="sm:text-[22px]" />
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
              {t('nav.dashboard')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-blue-100/90 font-medium tracking-wide">
              {t('dashboard.welcome')}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
              <span className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 text-[10px] sm:text-xs font-semibold tracking-wide border border-emerald-500/30 shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                {i18n.language === 'ar' ? 'جميع الأنظمة تعمل بشكل طبيعي' : 'All systems operational'}
              </span>
              <span className="text-blue-200/50 font-light hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 text-blue-100 text-[10px] sm:text-xs font-medium border border-white/20 backdrop-blur-sm">
                <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-md bg-blue-500/20 text-blue-300">
                  <FaCalendarAlt style={{ fontSize: '9px' }} className="sm:text-[11px]" />
                </div>
                <span className="hidden sm:inline">{formattedDate}</span>
                <span className="sm:hidden">{new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short' })}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          {onPrint && (
            <Button
              onClick={onPrint}
              variant="outline"
              size="sm"
              className="h-9 sm:h-10 px-3 sm:px-5 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 shadow-lg transition-all duration-300 font-medium backdrop-blur-sm"
              aria-label={t('common.print')}
            >
              <FaPrint size={14} />
              <span className="mr-2 hidden sm:inline">{t('common.print')}</span>
            </Button>
          )}
          <Button
            onClick={onRefresh}
            loading={loading}
            variant="outline"
            size="sm"
            className="h-9 sm:h-10 px-3 sm:px-5 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 shadow-lg transition-all duration-300 font-medium backdrop-blur-sm"
            aria-label={t('dashboard.refreshData')}
          >
            <FaSync size={14} className={loading ? 'animate-spin' : 'transition-transform duration-300 hover:rotate-180'} />
            <span className="mr-2 hidden sm:inline">{t('dashboard.refreshData')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
