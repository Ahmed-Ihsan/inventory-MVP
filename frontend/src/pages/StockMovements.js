import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import Table from '../components/common/Table';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaExchangeAlt, FaArrowUp, FaArrowDown, FaPrint } from 'react-icons/fa';

const StockMovements = () => {
  const { addToast } = useToast();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStockMovements();
      setMovements(data);
    } catch (error) {
      addToast('خطأ في تحميل حركات المخزون', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredMovements =
    filter === 'all' ? movements : movements.filter((m) => m.reason === filter);

  const handlePrintMovements = () => {
    window.print();
  };

  const columns = [
    {
      header: 'التاريخ',
      accessor: 'timestamp',
      render: (row) => new Date(row.timestamp).toLocaleDateString('ar-SA'),
    },
    { header: 'الصنف', accessor: 'item_name' },
    {
      header: 'نوع الحركة',
      accessor: 'reason',
      render: (row) => (
        <Badge
          className={row.reason === 'inbound'
            ? 'bg-emerald-500 hover:bg-emerald-600 gap-1.5'
            : 'bg-red-500 hover:bg-red-600 gap-1.5'
          }
        >
          {row.reason === 'inbound' ? <FaArrowDown size={12} /> : <FaArrowUp size={12} />}
          {row.reason === 'inbound' ? 'إدخال' : row.reason === 'outbound' ? 'إخراج' : 'تعديل'}
        </Badge>
      ),
    },
    { header: 'الكمية', accessor: 'quantity_change' },
    { header: 'الملاحظات', accessor: 'notes', render: (row) => row.notes || '-' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0 shadow-lg shadow-violet-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <FaExchangeAlt size={24} />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-white text-2xl sm:text-3xl">حركات المخزون</CardTitle>
              <p className="text-violet-50 text-sm sm:text-base">
                تتبع جميع عمليات إدخال وإخراج المخزون
              </p>
            </div>
          </div>
          <Button
            onClick={handlePrintMovements}
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            <FaPrint size={13} className="mr-2" /> طباعة
          </Button>
        </CardHeader>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'الكل', color: 'bg-primary' },
              { key: 'inbound', label: 'إدخال', color: 'bg-emerald-500' },
              { key: 'outbound', label: 'إخراج', color: 'bg-red-500' },
              { key: 'adjustment', label: 'تعديل', color: 'bg-amber-500' },
            ].map(({ key, label, color }) => (
              <Button
                key={key}
                onClick={() => setFilter(key)}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                className={filter === key ? color : ''}
              >
                {label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold text-foreground">
                لا توجد حركات مخزون
              </h3>
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredMovements.map((m, index) => ({
                ...m,
                _uniqueId: m.id || `movement-${m.timestamp}-${m.item_id}-${index}`,
              }))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovements;
