import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Scanner from '../components/scanning/Scanner';
import ScanResult from '../components/scanning/ScanResult';
import { FaBarcode } from 'react-icons/fa';

const Scanning = () => {
  const { t } = useTranslation();
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (result) => {
    setScanResult(result);
  };

  return (
    <div className="page">
      <div style={{
        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 8px 32px rgba(52,152,219,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
          <FaBarcode />
        </div>
        <div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('scanning.title')}</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>امسح باركود الصنف للبحث السريع وعرض المعلومات</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: scanResult ? '1fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', padding: '1.5rem' }}>
          <Scanner onScan={handleScan} />
        </div>
        {scanResult && (
          <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', padding: '1.5rem' }}>
            <ScanResult result={scanResult} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanning;