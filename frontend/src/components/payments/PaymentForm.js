import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';

const PaymentForm = ({ onSave, onCancel, payment = null }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    payment_type: 'paid',
    description: '',
    item_id: '',
    invoice_id: '',
    customer_name: '',
    customer_phone: '',
    transaction_date: new Date().toISOString().slice(0, 16),
    due_date: '',
    status: 'pending',
    reference_number: '',
    payment_method: 'cash',
    bank_name: '',
    check_number: '',
  });
  const initializedRef = useRef(false);

  useEffect(() => {
    loadItems();
    loadInvoices();
    loadCustomers();
  }, []);

  useEffect(() => {
    if (payment && payment.id && !initializedRef.current) {
      setFormData({
        amount: payment.amount || '',
        payment_type: payment.payment_type || 'paid',
        description: payment.description || '',
        item_id: payment.item_id || '',
        invoice_id: payment.invoice_id || '',
        customer_name: payment.customer_name || '',
        customer_phone: payment.customer_phone || '',
        transaction_date: payment.transaction_date ? new Date(payment.transaction_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        due_date: payment.due_date ? new Date(payment.due_date).toISOString().slice(0, 16) : '',
        status: payment.status || 'pending',
        reference_number: payment.reference_number || '',
        payment_method: payment.payment_method || 'cash',
        bank_name: payment.bank_name || '',
        check_number: payment.check_number || '',
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

  const loadInvoices = async () => {
    try {
      const invoicesData = await apiService.getSalesInvoices();
      setInvoices(invoicesData.filter(inv => inv.remaining_amount > 0));
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const invoicesData = await apiService.getSalesInvoices();
      const uniqueCustomers = [...new Set(invoicesData.map(inv => inv.customer_name))];
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate status based on due date
  useEffect(() => {
    if (formData.payment_type === 'debt' && formData.due_date) {
      const due = new Date(formData.due_date);
      const now = new Date();
      const newStatus = due < now ? 'overdue' : 'pending';
      setFormData(prev => ({ ...prev, status: newStatus }));
    } else if (formData.payment_type === 'paid') {
      setFormData(prev => ({ ...prev, status: 'completed' }));
    }
  }, [formData.payment_type, formData.due_date]);

  // Handle invoice selection
  const handleInvoiceChange = (invoiceId) => {
    const selectedInvoice = invoices.find(inv => inv.id === parseInt(invoiceId));
    if (selectedInvoice) {
      setFormData(prev => ({
        ...prev,
        invoice_id: invoiceId,
        customer_name: selectedInvoice.customer_name,
        customer_phone: selectedInvoice.customer_phone || '',
        amount: selectedInvoice.remaining_amount.toString(),
      }));
    } else {
      setFormData(prev => ({ ...prev, invoice_id: invoiceId }));
    }
  };

  // Calculate balance for selected invoice
  const getInvoiceBalance = () => {
    if (!formData.invoice_id) return 0;
    const invoice = invoices.find(inv => inv.id === parseInt(formData.invoice_id));
    return invoice ? invoice.remaining_amount : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }
    
    if (formData.payment_type === 'debt' && !formData.due_date) {
      alert('يرجى إدخال تاريخ الاستحقاق للديون');
      return;
    }
    
    // Check for overpayment
    if (formData.invoice_id) {
      const balance = getInvoiceBalance();
      if (parseFloat(formData.amount) > balance) {
        const confirm = window.confirm(`المبلغ (${formData.amount}) يتجاوز الرصيد المتبقي (${balance}). هل تريد المتابعة؟`);
        if (!confirm) return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        amount: parseFloat(formData.amount),
        item_id: formData.item_id ? parseInt(formData.item_id) : null,
        invoice_id: formData.invoice_id ? parseInt(formData.invoice_id) : null,
        transaction_date: new Date(formData.transaction_date).toISOString(),
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
        label="ربط الفاتورة"
        type="select"
        name="invoice_id"
        value={formData.invoice_id}
        onChange={(e) => handleInvoiceChange(e.target.value)}
      >
        <option value="">بدون ربط فاتورة</option>
        {invoices.map(inv => (
          <option key={inv.id} value={inv.id}>
            فاتورة #{inv.id} - {inv.customer_name} (المتبقي: {inv.remaining_amount})
          </option>
        ))}
      </FormField>

      {formData.invoice_id && (
        <div style={{ padding: '0.75rem', background: '#f0f9ff', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bae6fd' }}>
          <div style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: 600 }}>
            الرصيد المتبقي: {formData.amount}
          </div>
        </div>
      )}

      <FormField
        label="اسم العميل"
        type="text"
        name="customer_name"
        value={formData.customer_name}
        onChange={handleChange}
        list="customers-list"
      />
      <datalist id="customers-list">
        {customers.map((cust, idx) => (
          <option key={idx} value={cust} />
        ))}
      </datalist>

      <FormField
        label="رقم هاتف العميل"
        type="text"
        name="customer_phone"
        value={formData.customer_phone}
        onChange={handleChange}
      />

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
        label={t('payments.description')}
        type="textarea"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={3}
      />

      <FormField
        label="رقم المرجع"
        type="text"
        name="reference_number"
        value={formData.reference_number}
        onChange={handleChange}
        placeholder="مثال: REF-001"
        help="رقم لتتبع الدفعة"
      />

      <FormField
        label="طريقة الدفع"
        type="select"
        name="payment_method"
        value={formData.payment_method}
        onChange={handleChange}
      >
        <option value="cash">نقداً</option>
        <option value="bank_transfer">تحويل بنكي</option>
        <option value="check">شيك</option>
        <option value="card">بطاقة</option>
      </FormField>

      {formData.payment_method === 'bank_transfer' && (
        <FormField
          label="اسم البنك"
          type="text"
          name="bank_name"
          value={formData.bank_name}
          onChange={handleChange}
        />
      )}

      {formData.payment_method === 'check' && (
        <FormField
          label="رقم الشيك"
          type="text"
          name="check_number"
          value={formData.check_number}
          onChange={handleChange}
        />
      )}

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
        required={formData.payment_type === 'debt'}
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
        <Button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="btn-primary" loading={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;