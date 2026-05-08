import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Table from '../components/common/Table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaWarehouse, FaBox, FaExclamationTriangle, FaExclamationCircle, FaPrint } from 'react-icons/fa';

const StockLevels = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStockLevels = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStockLevels();
      setStockLevels(data);
    } catch (error) {
      addToast('خطأ في تحميل مستويات المخزون', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockLevels();
  }, []);

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const columns = [
    { header: 'الصنف', accessor: 'name', sortable: true },
    { header: 'SKU', accessor: 'sku', sortable: true },
    { header: 'الفئة', accessor: 'category_name', sortable: true },
    {
      header: 'السعر',
      accessor: 'price',
      sortable: true,
      render: (row) => formatCurrency(row.price),
    },
    { header: 'المخزون الحالي', accessor: 'current_stock', sortable: true },
    { header: 'الحد الأدنى', accessor: 'min_stock_level', sortable: true },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => {
        const isLowStock = row.current_stock <= row.min_stock_level;
        return isLowStock ? (
          <Badge variant="destructive" className="gap-1.5">
            <FaExclamationCircle size={12} /> منخفض
          </Badge>
        ) : (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1.5">
            متاح
          </Badge>
        );
      },
    },
  ];

  const lowStockCount = stockLevels.filter(
    (item) => item.current_stock <= item.min_stock_level
  ).length;
  const totalItems = stockLevels.length;

  const handlePrintStockLevels = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <FaWarehouse size={24} />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-white text-2xl sm:text-3xl">مستويات المخزون</CardTitle>
              <p className="text-emerald-50 text-sm sm:text-base">
                {totalItems} صنف · {lowStockCount} منخفض المخزون
              </p>
            </div>
          </div>
          <Button
            onClick={handlePrintStockLevels}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            <FaPrint size={13} className="mr-2" /> طباعة
          </Button>
        </CardHeader>
      </Card>

      {lowStockCount > 0 && (
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
              <FaExclamationTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                تنبيه: {lowStockCount} صنف منخفض المخزون
              </h3>
              <p className="text-red-50 text-sm">
                يرجى إعادة تخزين الأصناف المنخفضة
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : stockLevels.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 text-3xl mx-auto mb-5">
                <FaBox />
              </div>
              <h3 className="text-lg font-semibold text-foreground">لا توجد أصناف</h3>
            </div>
          ) : (
            <Table columns={columns} data={stockLevels} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockLevels;
