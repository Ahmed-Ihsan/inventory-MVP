import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Scanner from '../components/scanning/Scanner';
import ScanResult from '../components/scanning/ScanResult';
import { FaBarcode } from 'react-icons/fa';
import { Card as ShadcnCard, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';

const Scanning = () => {
  const { t } = useTranslation();
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (result) => {
    setScanResult(result);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex items-center gap-3 sm:gap-5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
            <FaBarcode size={24} className="sm:size-26 md:size-28" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              {t('scanning.title')}
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              امسح باركود الصنف للبحث السريع وعرض المعلومات
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
          <CardContent className="p-4 sm:p-6">
            <Scanner onScan={handleScan} />
          </CardContent>
        </ShadcnCard>
        {scanResult && (
          <ShadcnCard className="border-border/60 shadow-lg shadow-black/5">
            <CardContent className="p-4 sm:p-6">
              <ScanResult result={scanResult} />
            </CardContent>
          </ShadcnCard>
        )}
      </div>
    </div>
  );
};

export default Scanning;
