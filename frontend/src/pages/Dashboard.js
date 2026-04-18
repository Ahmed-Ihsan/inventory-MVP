import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import apiService from '../services/apiService';
import {
  FaExclamationTriangle,
  FaBox,
  FaDollarSign,
  FaSync,
  FaChartLine,
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaCreditCard,
  FaBell,
  FaFileAlt,
  FaArrowUp,
  FaArrowDown,
  FaShoppingCart,
  FaStar,
  FaMedkit,
  FaChartBar,
  FaChartPie
} from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    activeAlerts: 0,
    totalDebt: 0,
    totalPaid: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for new components
  const revenueDebtData = [
    { date: '2024-04-01', paid: 45000, debt: 25000 },
    { date: '2024-04-02', paid: 52000, debt: 28000 },
    { date: '2024-04-03', paid: 48000, debt: 27000 },
    { date: '2024-04-04', paid: 55000, debt: 26000 },
    { date: '2024-04-05', paid: 60000, debt: 24000 },
    { date: '2024-04-06', paid: 58000, debt: 23000 },
    { date: '2024-04-07', paid: 62000, debt: 22000 },
    { date: '2024-04-08', paid: 59000, debt: 21000 },
    { date: '2024-04-09', paid: 64000, debt: 20000 },
    { date: '2024-04-10', paid: 61000, debt: 19000 },
    { date: '2024-04-11', paid: 67000, debt: 18000 },
    { date: '2024-04-12', paid: 65000, debt: 17000 },
    { date: '2024-04-13', paid: 69000, debt: 16000 },
    { date: '2024-04-14', paid: 68000, debt: 15000 },
    { date: '2024-04-15', paid: 72000, debt: 14000 },
    { date: '2024-04-16', paid: 70000, debt: 13000 },
    { date: '2024-04-17', paid: 74000, debt: 12000 },
    { date: '2024-04-18', paid: 73000, debt: 11000 },
    { date: '2024-04-19', paid: 76000, debt: 10000 },
    { date: '2024-04-20', paid: 75000, debt: 9500 },
    { date: '2024-04-21', paid: 78000, debt: 9000 },
    { date: '2024-04-22', paid: 77000, debt: 8500 },
    { date: '2024-04-23', paid: 80000, debt: 8000 },
    { date: '2024-04-24', paid: 79000, debt: 7500 },
    { date: '2024-04-25', paid: 82000, debt: 7000 },
    { date: '2024-04-26', paid: 81000, debt: 6500 },
    { date: '2024-04-27', paid: 84000, debt: 6000 },
    { date: '2024-04-28', paid: 83000, debt: 5500 },
    { date: '2024-04-29', paid: 86000, debt: 5000 },
    { date: '2024-04-30', paid: 85000, debt: 4500 },
  ];

  const inventoryHealthData = [
    { name: t('dashboard.charts.healthyStock'), value: 65, color: 'var(--success-green)', key: 'healthyStock' },
    { name: t('dashboard.charts.lowStockItems'), value: 25, color: 'var(--warning-orange)', key: 'lowStockItems' },
    { name: t('dashboard.charts.outOfStock'), value: 10, color: 'var(--danger-red)', key: 'outOfStock' },
  ];

  const expiringItems = [
    { name: 'Paracetamol 500mg', batch: 'BATCH-2024-001', expiry: '2024-05-15', status: 'warning' },
    { name: 'Amoxicillin 250mg', batch: 'BATCH-2024-002', expiry: '2024-05-20', status: 'warning' },
    { name: 'Ibuprofen 200mg', batch: 'BATCH-2024-003', expiry: '2024-05-25', status: 'warning' },
    { name: 'Aspirin 100mg', batch: 'BATCH-2024-004', expiry: '2024-06-01', status: 'info' },
    { name: 'Ciprofloxacin 500mg', batch: 'BATCH-2024-005', expiry: '2024-06-05', status: 'info' },
  ];

  const criticalLowStock = [
    { name: 'Insulin Injection', stock: 5 },
    { name: 'Morphine Sulfate', stock: 3 },
    { name: 'Epinephrine Auto-Injector', stock: 2 },
    { name: 'Warfarin Tablets', stock: 7 },
    { name: 'Heparin Solution', stock: 4 },
  ];

  const topMovingItems = [
    'Paracetamol 500mg',
    'Amoxicillin 250mg',
    'Ibuprofen 200mg',
    'Aspirin 100mg',
    'Omeprazole 20mg',
  ];

  const recentTransactions = [
    { date: '2024-04-18', description: 'Payment from Pharmacy A', amount: 15000, type: 'payment' },
    { date: '2024-04-17', description: 'Purchase Order #1234', amount: -8500, type: 'purchase' },
    { date: '2024-04-16', description: 'Payment from Pharmacy B', amount: 22000, type: 'payment' },
    { date: '2024-04-15', description: 'Supplier Invoice #5678', amount: -12000, type: 'purchase' },
    { date: '2024-04-14', description: 'Payment from Hospital C', amount: 18000, type: 'payment' },
  ];

  const activityLog = [
    'User Admin updated stock for Paracetamol',
    'System backup completed successfully',
    'New user registered: Dr. Smith',
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stockLevels, alerts, debtSummary, paidSummary] = await Promise.all([
        apiService.getStockLevels(),
        apiService.getAlerts(),
        apiService.getTotalDebt(),
        apiService.getTotalPaid()
      ]);

      const lowStockItems = stockLevels.filter(item =>
        item.current_stock <= item.min_stock_level
      ).length;

      setStats({
        totalItems: stockLevels.length,
        lowStock: lowStockItems,
        activeAlerts: alerts.length,
        totalDebt: debtSummary.total_debt,
        totalPaid: paidSummary.total_paid
      });

    } catch (error) {
      addToast(`Error loading dashboard data: ${error.message}`, 'error');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="page">
        <Card style={{ textAlign: 'center' }}>
          <div style={{ padding: '3rem 2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'var(--danger-red-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.75rem',
              color: 'var(--danger-red)',
            }}>
              <FaExclamationTriangle />
            </div>
            <h3 style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '700', 
              fontSize: '1.25rem',
              marginBottom: '0.5rem',
            }}>
              {t('dashboard.errorLoading')}
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginBottom: '1.5rem',
              maxWidth: '400px',
              margin: '0 auto 1.5rem',
              lineHeight: '1.6',
            }}>
              {error}
            </p>
            <Button onClick={loadDashboardData} className="btn-primary">
              <FaSync style={{ marginRight: '0.5rem' }} />
              {t('common.retry')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const netPosition = stats.totalPaid - stats.totalDebt;

  // Internal Components
  const ChartsSection = () => (
    <div className="dashboard-charts-row">
      <div className="dashboard-card" style={{
        background: 'white',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          background: 'var(--primary-blue-light)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <FaChartBar style={{ color: 'var(--primary-blue)', fontSize: '1.25rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {t('dashboard.charts.revenueVsDebt')}
          </h3>
        </div>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer>
            <LineChart data={revenueDebtData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-elevated)',
                  color: 'var(--text-primary)'
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Line
                type="monotone"
                dataKey="paid"
                stroke="var(--success-green)"
                strokeWidth={3}
                name={t('dashboard.totalPaid')}
                dot={{ fill: 'var(--success-green)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--success-green)', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="debt"
                stroke="var(--danger-red)"
                strokeWidth={3}
                name={t('dashboard.totalDebt')}
                dot={{ fill: 'var(--danger-red)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--danger-red)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="dashboard-card" style={{
        background: 'var(--surface)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          background: 'var(--primary-blue)',
          color: 'white',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaChartPie style={{ fontSize: '1.25rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
            {t('dashboard.charts.inventoryHealth')}
          </h3>
        </div>
        <div style={{ width: '100%', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="70%">
            <PieChart>
              <Pie
                data={inventoryHealthData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {inventoryHealthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)'
                }}
                formatter={(value) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {inventoryHealthData.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: '14px', height: '14px', background: item.color, borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                  {t(`dashboard.charts.${item.key}`)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ActionableInsights = () => (
    <div className="dashboard-insights-row">
      <div className="dashboard-card" style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--primary-blue-light) 100%)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          background: 'var(--primary-blue)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <FaClock style={{ color: 'white', fontSize: '1.25rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'white' }}>
            {t('dashboard.insights.expiringItems')}
          </h3>
        </div>
        <div className="dashboard-table" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <div className="dashboard-table-header">
            <div>{t('dashboard.insights.itemName')}</div>
            <div>{t('dashboard.insights.batchNo')}</div>
            <div>{t('dashboard.insights.expiryDate')}</div>
            <div>{t('dashboard.insights.status')}</div>
          </div>
          {expiringItems.map((item, index) => (
            <div key={index} className="dashboard-table-row">
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{item.name}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.batch}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.expiry}</div>
              <div>
                <span className={`badge badge-${item.status}`} style={{
                  background: item.status === 'warning' ? 'var(--warning-orange-light)' : 'var(--success-green-light)',
                  color: item.status === 'warning' ? 'var(--warning-orange)' : 'var(--success-green)'
                }}>
                  {item.status === 'warning' ? t('dashboard.insights.expiringSoon') : t('dashboard.insights.monitor')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dashboard-card" style={{
        background: 'var(--surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          background: 'var(--danger-red-light)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <FaExclamationTriangle style={{ color: 'var(--danger-red)', fontSize: '1.25rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {t('dashboard.insights.criticalLowStock')}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {criticalLowStock.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--danger-red-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--danger-red)'
                }}>
                  <FaMedkit size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--danger-red)', fontWeight: '500' }}>
                    {item.stock} {t('dashboard.insights.unitsRemaining')}
                  </div>
                </div>
              </div>
              <Button className="btn-sm btn-warning" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: 'var(--warning-orange)', color: 'white' }}>
                <FaShoppingCart style={{ marginRight: '0.25rem' }} />
                {t('dashboard.insights.quickReorder')}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="dashboard-card" style={{
        background: 'var(--surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          background: 'var(--success-green-light)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <FaStar style={{ color: 'var(--warning-orange)', fontSize: '1.25rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {t('dashboard.insights.topMovingItems')}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {topMovingItems.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: index === 0 ? 'var(--warning-orange)' :
                           index === 1 ? 'var(--text-tertiary)' :
                           'var(--warning-orange)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: '700',
                boxShadow: 'var(--shadow-soft)'
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.125rem' }}>{item}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Top performing item
                </div>
              </div>
              {index < 3 && (
                <FaStar style={{ color: 'var(--warning-orange)', fontSize: '0.9rem' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const FinancialsActivity = () => (
    <div className="dashboard-financials-row">
      <div className="dashboard-card" style={{
        background: 'var(--surface)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          background: 'var(--success-green)',
          color: 'white',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaCreditCard style={{ fontSize: '1.25rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
            {t('dashboard.financials.recentTransactions')}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recentTransactions.map((transaction, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ marginLeft: '1rem', flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {transaction.description}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <FaCalendarAlt size={12} />
                  {transaction.date}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  color: transaction.type === 'payment' ? 'var(--success-green)' : 'var(--danger-red)',
                  marginBottom: '0.125rem'
                }}>
                  {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  background: transaction.type === 'payment' ? 'var(--success-green-light)' : 'var(--danger-red-light)',
                  color: transaction.type === 'payment' ? 'var(--success-green)' : 'var(--danger-red)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '12px',
                  display: 'inline-block'
                }}>
                  {t(`dashboard.financials.${transaction.type}`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dashboard-card" style={{
        background: 'var(--surface)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          background: 'var(--primary-blue)',
          color: 'white',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaBell style={{ fontSize: '1.25rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
            {t('dashboard.financials.quickActions')}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <Button className="btn-accent" style={{ fontSize: '0.875rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--primary-blue)', color: 'white' }}>
              <FaPlus style={{ marginRight: '0.375rem' }} />
              {t('dashboard.financials.addNewDrug')}
            </Button>
            <Button className="btn-success" style={{ fontSize: '0.875rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--success-green)', color: 'white' }}>
              <FaCreditCard style={{ marginRight: '0.375rem' }} />
              {t('dashboard.financials.recordPayment')}
            </Button>
            <Button className="btn-warning" style={{ fontSize: '0.875rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--warning-orange)', color: 'white' }}>
              <FaExclamationTriangle style={{ marginRight: '0.375rem' }} />
              {t('dashboard.financials.viewAlerts')}
            </Button>
            <Button className="btn-info" style={{ fontSize: '0.875rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--primary-blue)', color: 'white' }}>
              <FaFileAlt style={{ marginRight: '0.375rem' }} />
              {t('dashboard.financials.generateReport')}
            </Button>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <FaClock style={{ color: 'var(--text-secondary)', fontSize: '1rem' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {t('dashboard.financials.activityLog')}
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {activityLog.map((activity, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: index === 0 ? 'var(--success-green)' : 'var(--primary-blue)',
                    flexShrink: 0
                  }}></div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1 }}>
                    {activity}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {index === 0 ? '2m ago' : index === 1 ? '15m ago' : '1h ago'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const statCards = [
    {
      title: t('dashboard.totalItems'),
      value: stats.totalItems,
      icon: <FaBox />,
      iconClass: 'primary',
      gradient: 'var(--primary-card-gradient)',
      performance: '+5%',
      performanceColor: 'var(--success-green)',
      cardGradient: 'white',
    },
    {
      title: t('dashboard.lowStock'),
      value: stats.lowStock,
      icon: <FaExclamationTriangle />,
      iconClass: 'warning',
      valueColor: stats.lowStock > 0 ? 'var(--warning-orange)' : 'var(--success-green)',
      gradient: 'var(--warning-card-gradient)',
      performance: stats.lowStock > 5 ? '+2%' : '-10%',
      performanceColor: stats.lowStock > 5 ? 'var(--danger-red)' : 'var(--success-green)',
      cardGradient: 'white',
    },
    {
      title: t('dashboard.activeAlerts'),
      value: stats.activeAlerts,
      icon: <FaExclamationTriangle />,
      iconClass: 'danger',
      valueColor: stats.activeAlerts > 0 ? 'var(--danger-red)' : 'var(--success-green)',
      gradient: 'var(--danger-card-gradient)',
      performance: stats.activeAlerts > 3 ? '+15%' : '-20%',
      performanceColor: stats.activeAlerts > 3 ? 'var(--danger-red)' : 'var(--success-green)',
      cardGradient: 'white',
    },
    {
      title: t('dashboard.totalPaid'),
      value: formatCurrency(stats.totalPaid),
      icon: <FaDollarSign />,
      iconClass: 'success',
      valueColor: 'var(--success-green)',
      valueSize: '1.5rem',
      gradient: 'var(--success-card-gradient)',
      performance: '+12%',
      performanceColor: 'var(--success-green)',
      cardGradient: 'white',
    },
    {
      title: t('dashboard.totalDebt'),
      value: formatCurrency(stats.totalDebt),
      icon: <FaDollarSign />,
      iconClass: 'warning',
      valueColor: 'var(--warning-orange)',
      valueSize: '1.5rem',
      gradient: 'var(--warning-card-gradient)',
      performance: '-8%',
      performanceColor: 'var(--success-green)',
      cardGradient: 'white',
    },
    {
      title: t('dashboard.netPosition'),
      value: formatCurrency(netPosition),
      icon: <FaChartLine />,
      iconClass: netPosition >= 0 ? 'success' : 'danger',
      valueColor: netPosition >= 0 ? 'var(--success-green)' : 'var(--danger-red)',
      valueSize: '1.5rem',
      gradient: netPosition >= 0
        ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
        : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      performance: netPosition >= 0 ? '+18%' : '-5%',
      performanceColor: netPosition >= 0 ? 'var(--success-green)' : 'var(--danger-red)',
      cardGradient: 'white',
    },
  ];

  return (
    <div className="page" style={{
      background: 'var(--background)',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div className="page-header" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-elevated)',
        padding: '3rem',
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-title" style={{
            color: 'white',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '800',
            marginBottom: '0.5rem'
          }}>
            {t('nav.dashboard')}
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: '0.25rem 0 0 0',
            fontSize: '1rem',
            fontWeight: '500',
            opacity: 0.8
          }}>
            {t('dashboard.welcome')}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.75rem',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--success-green)',
              animation: 'pulse-ring 2s infinite'
            }}></div>
            <span style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              fontWeight: '500'
            }}>
              All systems operational
            </span>
          </div>
        </div>
        <Button onClick={loadDashboardData} className="btn-secondary" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <FaSync style={{ fontSize: '0.875rem' }} />
          {t('dashboard.refreshData')}
        </Button>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="stat-card"
            style={{
              background: card.cardGradient,
              color: 'white',
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="stat-card-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="stat-card-title">{card.title}</div>
                <div
                  className="stat-card-value"
                  style={{
                    color: card.valueColor || 'var(--text-primary)',
                    fontSize: card.valueSize || '2rem',
                    marginTop: '0.5rem',
                  }}
                >
                  {card.value}
                  {card.performance && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginLeft: '0.75rem',
                        padding: '0.3rem 0.6rem',
                        background: card.performanceColor === 'var(--success-green)' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: card.performanceColor,
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        verticalAlign: 'middle',
                        border: `1px solid ${card.performanceColor === 'var(--success-green)' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      }}
                    >
                      {card.performance.startsWith('+') ? (
                        <FaArrowUp size={10} />
                      ) : (
                        <FaArrowDown size={10} />
                      )}
                      <span>{card.performance} {t('dashboard.financials.fromYesterday')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div
                className={`stat-card-icon ${card.iconClass}`}
                style={{
                  borderRadius: '12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--primary-blue)'
                }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ChartsSection />
      <ActionableInsights />
      <FinancialsActivity />
    </div>
  );
};

export default Dashboard;