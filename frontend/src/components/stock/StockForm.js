import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';

const StockForm = ({ itemId, itemName, currentStock, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [quantityChange, setQuantityChange] = useState(0);
  const [reason, setReason] = useState('inbound');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'quantity_change') {
      setQuantityChange(parseInt(value) || 0);
    } else {
      setReason(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ item_id: itemId, quantity_change: quantityChange, reason });
  };

  const getNewStock = () => {
    if (reason === 'inbound') {
      return currentStock + quantityChange;
    } else if (reason === 'outbound') {
      return currentStock - quantityChange;
    }
    return currentStock + quantityChange;
  };

  return (
    <form onSubmit={handleSubmit}>
      {itemName && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{itemName}</p>
          <p style={{ margin: '0.5rem 0 0', color: '#6c757d' }}>
            {t('stock.currentStock')}: <strong>{currentStock}</strong>
          </p>
        </div>
      )}

      <FormField
        label={t('stock.quantityChange')}
        name="quantity_change"
        type="number"
        value={quantityChange}
        onChange={handleChange}
        required
        min="1"
        help="أدخل الكمية الموجبة للإضافة أو السالبة للنقصان"
      />

      <FormField
        label={t('stock.reason')}
        name="reason"
        type="select"
        value={reason}
        onChange={handleChange}
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
        <Button type="button" onClick={onCancel} className="btn-secondary">
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="btn-primary">
          {t('stock.updateStock')}
        </Button>
      </div>
    </form>
  );
};

export default StockForm;