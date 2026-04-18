import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import StockList from '../components/stock/StockList';
import Button from '../components/common/Button';
import { FaPrint, FaSync } from 'react-icons/fa';

const StockTracking = () => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t('stock.tracking')}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={handlePrint} className="btn-secondary">
            <FaPrint style={{ marginRight: '0.5rem' }} />
            {t('common.print')}
          </Button>
        </div>
      </div>
      <Card>
        <StockList />
      </Card>
    </div>
  );
};

export default StockTracking;