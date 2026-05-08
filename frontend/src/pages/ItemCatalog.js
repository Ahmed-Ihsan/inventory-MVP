import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ItemList from '../components/items/ItemList';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { FaPrint, FaBoxes, FaPlus, FaBox, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import apiService from '../services/apiService';
import { cn } from '../lib/utils';

const ItemCatalog = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0, healthy: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stockLevels = await apiService.getStockLevels();
        const total = stockLevels.length;
        const healthy = stockLevels.filter((i) => i.current_stock > i.min_stock_level).length;
        const lowStock = stockLevels.filter((i) => i.current_stock > 0 && i.current_stock <= i.min_stock_level).length;
        const outOfStock = stockLevels.filter((i) => i.current_stock === 0).length;
        setStats({ total, lowStock, outOfStock, healthy });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg text-2xl">
              <FaBoxes />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {t('items.catalog')}
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium">
                {t('items.catalogDescription', { defaultValue: 'Browse and manage all items in your inventory' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm flex-1 sm:flex-none"
            >
              <FaPrint size={12} className="sm:size-13 mr-2" />
              <span className="hidden sm:inline">{t('common.print')}</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/items/new')}
              className="bg-white text-sky-600 hover:bg-white/90 font-semibold shadow-lg flex-1 sm:flex-none"
            >
              <FaPlus size={12} className="sm:size-13 mr-2" />
              {t('items.addNewItem')}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-4 sm:mb-6">
          <Card className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  {t('dashboard.totalItems')}
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20">
                  <FaBox size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
                {stats.total}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">إجمالي العناصر</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  مخزون صحي
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                  <FaCheckCircle size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
                {stats.healthy}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">حالة جيدة</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  {t('dashboard.lowStock')}
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20">
                  <FaExclamationTriangle size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 drop-shadow-sm">
                {stats.lowStock}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">منخفض المخزون</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  نفد المخزون
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 ring-1 ring-red-500/20">
                  <FaExclamationTriangle size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400 drop-shadow-sm">
                {stats.outOfStock}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">غير متوفر</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low Stock Alert */}
      {!loading && stats.lowStock > 0 && (
        <div className="relative overflow-hidden rounded-xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white">
              <FaExclamationTriangle size={18} className="sm:size-22" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-0.5 sm:mb-1">
                تنبيه: {stats.lowStock} عنصر بمخزون منخفض
              </h3>
              <p className="text-xs sm:text-sm text-white/90">
                يرجى مراجعة العناصر ذات المخزون المنخفض وإعادة الطلب
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <Card className="border-border/60 shadow-lg shadow-black/5">
        <CardContent className="pt-4 sm:pt-6">
          <ItemList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemCatalog;
