import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import ItemList from '../components/items/ItemList';
import Button from '../components/common/Button';
import { FaPrint } from 'react-icons/fa';

const ItemCatalog = () => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{t('items.catalog')}</h1>
        <Button onClick={handlePrint} className="btn-secondary">
          <FaPrint style={{ marginRight: '0.5rem' }} />
          {t('common.print')}
        </Button>
      </div>
      <Card>
        <ItemList />
      </Card>
    </div>
  );
};

export default ItemCatalog;