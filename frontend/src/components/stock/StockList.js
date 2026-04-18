import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Table from '../common/Table';
import { StatusBadge } from '../common/StatusBadge';
import Card from '../common/Card';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';

const StockList = () => {
  const { t } = useTranslation();
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityChange, setQuantityChange] = useState(0);
  const [reason, setReason] = useState('inbound');

  const fetchStockLevels = async () => {
    try {
      setLoading(true);
      const data = await apiService.getStockLevels();
      setStockLevels(data);
    } catch (error) {
      console.error('Error fetching stock levels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockLevels();
  }, []);

  const getStockStatus = (current, min) => {
    if (current === 0) return 'out_of_stock';
    if (current <= min) return 'low_stock';
    return 'active';
  };

  const handleAdjustStock = (item) => {
    setSelectedItem(item);
    setQuantityChange(0);
    setReason('inbound');
    setIsEditing(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    try {
      await apiService.createStockMovement({
        item_id: selectedItem.id,
        quantity_change: quantityChange,
        reason: reason
      });
      setIsEditing(false);
      setSelectedItem(null);
      setQuantityChange(0);
      setReason('inbound');
      fetchStockLevels();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Failed to adjust stock: ' + error.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setQuantityChange(0);
    setReason('inbound');
  };

  const getNewStock = () => {
    if (!selectedItem) return 0;
    if (reason === 'inbound') {
      return selectedItem.current_stock + quantityChange;
    } else if (reason === 'outbound') {
      return selectedItem.current_stock - quantityChange;
    }
    return selectedItem.current_stock + quantityChange;
  };

  const columns = [
    { header: t('stock.itemName'), accessor: 'name' },
    { header: t('items.sku'), accessor: 'sku' },
    {
      header: t('stock.currentStock'),
      accessor: 'current_stock',
      render: (row) => {
        const isLowStock = row.current_stock <= row.min_stock_level;
        return (
          <span style={{
            fontWeight: '600',
            color: isLowStock ? 'var(--color-danger)' : 'var(--color-success)'
          }}>
            {row.current_stock}
          </span>
        );
      }
    },
    { header: t('stock.minStockLevel'), accessor: 'min_stock_level' },
    {
      header: t('stock.status'),
      accessor: 'status',
      render: (row) => {
        const status = getStockStatus(row.current_stock, row.min_stock_level);
        return <StatusBadge status={status} />;
      }
    },
    {
      header: t('common.actions'),
      accessor: 'actions',
      render: (row) => (
        <Button
          onClick={() => handleAdjustStock(row)}
          className="btn-primary"
          style={{ padding: '0.5rem 1rem' }}
        >
          {t('stock.adjustStock')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      {isEditing && selectedItem && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={handleSaveAdjustment}>
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedItem.name}</p>
              <p style={{ margin: '0.5rem 0 0', color: '#6c757d' }}>
                {t('stock.currentStock')}: <strong>{selectedItem.current_stock}</strong>
              </p>
            </div>

            <FormField
              label={t('stock.quantityChange')}
              name="quantity_change"
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
              required
              min="1"
            />

            <FormField
              label={t('stock.reason')}
              name="reason"
              type="select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="inbound">{t('stock.inbound')}</option>
              <option value="outbound">{t('stock.outbound')}</option>
              <option value="adjustment">{t('stock.adjustment')}</option>
            </FormField>

            {quantityChange !== 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: quantityChange > 0 ? '#d4edda' : '#f8d7da',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#155724' }}>
                  {t('stock.newStock')}: <strong style={{ fontSize: '1.2rem' }}>{getNewStock()}</strong>
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button type="button" onClick={handleCancel} className="btn-secondary">
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="btn-primary">
                {t('stock.updateStock')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {t('common.loading')}
        </div>
      ) : stockLevels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {t('stock.noItems')}
        </div>
      ) : (
        <Table columns={columns} data={stockLevels} />
      )}
    </div>
  );
};

export default StockList;