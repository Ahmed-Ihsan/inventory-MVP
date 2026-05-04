import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaWarehouse, FaChartLine, FaExchangeAlt } from 'react-icons/fa';
import Card from '../components/common/Card';
import StockTracking from './StockTracking';
import StockLevels from './StockLevels';
import StockMovements from './StockMovements';

const Stock = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('tracking');

  const tabs = [
    { id: 'tracking', label: 'تتبع المخزون', icon: FaWarehouse },
    { id: 'levels', label: 'مستويات المخزون', icon: FaChartLine },
    { id: 'movements', label: 'حركات المخزون', icon: FaExchangeAlt },
  ];

  return (
    <div className="page">
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '2rem',
        borderRadius: '20px',
        marginBottom: '2rem',
        boxShadow: '0 20px 60px rgba(102,126,234,0.3)',
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          المخزون
        </h1>
        <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>
          إدارة المخزون وتتبع الحركات
        </p>
      </div>

      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--color-surface)',
                color: activeTab === tab.id ? '#fff' : 'var(--color-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'var(--color-border-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'var(--color-surface)';
                }
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: '1.5rem' }}>
          {activeTab === 'tracking' && <StockTracking />}
          {activeTab === 'levels' && <StockLevels />}
          {activeTab === 'movements' && <StockMovements />}
        </div>
      </Card>
    </div>
  );
};

export default Stock;
