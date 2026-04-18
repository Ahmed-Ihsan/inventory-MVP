import React from 'react';
import { useTranslation } from 'react-i18next';

const ScanResult = ({ result }) => {
  const { t } = useTranslation();
  if (!result) return null;

  return (
    <div className="scan-result">
      <h3>{t('scanning.scanResult')}</h3>
      <p>{t('scanning.sku')}: {result.sku}</p>
      <p>{t('scanning.item')}: {result.item}</p>
      <p>{t('scanning.currentStock')}: {result.current_stock}</p>
    </div>
  );
};

export default ScanResult;