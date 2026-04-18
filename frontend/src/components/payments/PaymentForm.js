import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';

const PaymentForm = ({ onSave, onCancel, payment = null }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    payment_type: 'debt',
    description: '',
    item_id: '',
    transaction_date: new Date().toISOString().slice(0, 16),
    due_date: '',
    status: 'pending'
  });
  const initializedRef = useRef(false);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (payment && payment.id && !initializedRef.current) {
      setFormData({
        amount: payment.amount || '',
        payment_type: payment.payment_type || 'debt',
        description: payment.description || '',
        item_id: payment.item_id || '',
        transaction_date: payment.transaction_date ? new Date(payment.transaction_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        due_date: payment.due_date || '',
        status: payment.status || 'pending'
      });
      initializedRef.current = true;
    } else if (!payment) {
      initializedRef.current = false;
    }
  }, [payment?.id]);

  const loadItems = async () => {
    try {
      const itemsData = await apiService.getItems();
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      item_id: formData.item_id ? parseInt(formData.item_id) : null,
      transaction_date: new Date(formData.transaction_date).toISOString(),
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
    };
    onSave(submissionData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label={t('payments.amount')}
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleChange}
        required
        min="0"
        step="0.01"
      />

      <FormField
        label={t('payments.type')}
        type="select"
        name="payment_type"
        value={formData.payment_type}
        onChange={handleChange}
        required
      >
        <option value="paid">{t('payments.paid')}</option>
        <option value="debt">{t('payments.debt')}</option>
        <option value="credit">{t('payments.credit')}</option>
      </FormField>

      <FormField
        label={t('payments.description')}
        type="textarea"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={3}
      />

      <FormField
        label={t('items.name')}
        type="select"
        name="item_id"
        value={formData.item_id}
        onChange={handleChange}
      >
        <option value="">{t('common.select')}...</option>
        {items.map(item => (
          <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
        ))}
      </FormField>

      <FormField
        label={t('payments.date')}
        type="datetime-local"
        name="transaction_date"
        value={formData.transaction_date}
        onChange={handleChange}
        required
      />

      <FormField
        label={t('payments.dueDate')}
        type="datetime-local"
        name="due_date"
        value={formData.due_date}
        onChange={handleChange}
      />

      <FormField
        label={t('payments.status')}
        type="select"
        name="status"
        value={formData.status}
        onChange={handleChange}
        required
      >
        <option value="pending">{t('payments.pending')}</option>
        <option value="completed">{t('payments.completed')}</option>
        <option value="overdue">{t('payments.overdue')}</option>
      </FormField>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <Button type="button" onClick={onCancel} className="btn-secondary">
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="btn-primary">
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;