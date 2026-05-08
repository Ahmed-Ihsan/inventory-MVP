import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import StockList from '../components/stock/StockList';
import { FaPrint, FaSync, FaWarehouse } from 'react-icons/fa';

const StockTracking = () => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/30 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-44 h-44 rounded-full bg-white/6 translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <FaWarehouse size={24} />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-white text-2xl sm:text-3xl">{t('stock.tracking')}</CardTitle>
              <p className="text-emerald-50 text-sm sm:text-base">
                تتبع مستويات المخزون والحركة للأصناف
              </p>
            </div>
          </div>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            <FaPrint size={13} className="mr-2" /> {t('common.print')}
          </Button>
        </CardHeader>
      </Card>
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <StockList />
        </CardContent>
      </Card>
    </div>
  );
};

export default StockTracking;
