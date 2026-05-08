import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Loading from '../components/common/Loading';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { 
  FaChartLine,
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaDollarSign,
  FaExclamationTriangle,
  FaSync,
  FaPrint 
} from 'react-icons/fa';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCards from '../components/dashboard/StatCards';
import InventoryCharts from '../components/dashboard/InventoryCharts';
import ActionableInsights from '../components/dashboard/ActionableInsights';
import FinancialSummary from '../components/dashboard/FinancialSummary';
import QuickAccessCards from '../components/dashboard/QuickAccessCards';

const INITIAL_STATS = {
  totalItems: 0,
  lowStock: 0,
  activeAlerts: 0,
  totalSales: 0,
  totalCollected: 0,
  totalPaid: 0,
  totalDebt: 0,
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const formatCurrency = useCallback((amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  }, []);

  const loadDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const [stockLevels, alerts, installmentSales] = await Promise.all([
          apiService.getStockLevels(),
          apiService.getAlerts(),
          apiService.getInstallmentSales(),
        ]);

        // Calculate totals from installment sales
        const totalSales = installmentSales.reduce((sum, sale) => sum + sale.total_amount, 0);
        const totalCollected = installmentSales.reduce(
          (sum, sale) => sum + (sale.total_amount - sale.remaining_amount),
          0
        );

        // Calculate total paid and total debt
        const totalPaid = installmentSales.reduce((sum, sale) => {
          const paidAmount = sale.total_amount - sale.remaining_amount;
          return sum + paidAmount;
        }, 0);
        const totalDebt = installmentSales.reduce((sum, sale) => sum + sale.remaining_amount, 0);

        setStats({
          totalItems: stockLevels.length,
          lowStock: stockLevels.filter((i) => i.current_stock <= i.min_stock_level).length,
          activeAlerts: alerts.length,
          totalSales,
          totalCollected,
          totalPaid,
          totalDebt,
        });
      } catch (err) {
        addToast(`${t('dashboard.errorLoading')}: ${err.message}`, 'error');
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [addToast, t]
  );

  const handleRefresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handlePrintDashboard = () => {
    window.print();
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <Card className="text-center">
        <div className="py-12 px-8 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-100 text-red-600 text-2xl dark:bg-red-900 dark:text-red-300">
            <FaExclamationTriangle />
          </div>
          <h3 className="text-lg font-bold text-foreground text-balance">{t('dashboard.errorLoading')}</h3>
          <p className="text-sm text-muted-foreground text-pretty">{error}</p>
          <Button onClick={() => loadDashboardData()} variant="default" size="sm">
            <FaSync size={12} /> {t('common.retry')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader onRefresh={() => loadDashboardData(true)} loading={refreshing} onPrint={handlePrintDashboard} />
      <QuickAccessCards />
      <StatCards stats={stats} formatCurrency={formatCurrency} />
      <InventoryCharts />
      <ActionableInsights />
      <FinancialSummary formatCurrency={formatCurrency} />
    </div>
  );
};

export default Dashboard;
