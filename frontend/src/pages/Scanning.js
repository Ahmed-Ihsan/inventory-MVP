import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Scanner from '../components/scanning/Scanner';
import ScanResult from '../components/scanning/ScanResult';

const Scanning = () => {
  const { t } = useTranslation();
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (result) => {
    setScanResult(result);
  };

  return (
    <div className="page">
      <Card>
        <h1>{t('scanning.title')}</h1>
        <Scanner onScan={handleScan} />
        {scanResult && <ScanResult result={scanResult} />}
      </Card>
    </div>
  );
};

export default Scanning;