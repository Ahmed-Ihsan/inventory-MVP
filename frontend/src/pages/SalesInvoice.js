import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import apiService from '../services/apiService';
import { FaPlus, FaPrint, FaReceipt, FaTrash, FaEdit, FaBolt } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const SalesInvoice = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    items: [{ item_id: '', item_name: '', quantity: 1, cost_price: 0, selling_price: 0, profit_margin: 0 }],
    total_amount: 0,
    paid_amount: 0,
    payment_method: 'cash',
    notes: '',
  });

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const [invoicesData, itemsData] = await Promise.all([
        apiService.getSalesInvoices(),
        apiService.getStockLevels(),
      ]);
      setInvoices(invoicesData);
      setItems(itemsData);
    } catch (error) {
      addToast(t('salesInvoice.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setFormData({
      customer_name: '',
      customer_phone: '',
      items: [{ item_id: '', item_name: '', quantity: 1, cost_price: 0, selling_price: 0, profit_margin: 0 }],
      total_amount: 0,
      paid_amount: 0,
      payment_method: 'cash',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customer_name: invoice.customer_name,
      customer_phone: invoice.customer_phone,
      items: invoice.items && invoice.items.length > 0 ? invoice.items : [{ item_id: '', item_name: '', quantity: 1, cost_price: 0, selling_price: 0, profit_margin: 0 }],
      total_amount: invoice.total_amount,
      paid_amount: invoice.paid_amount,
      payment_method: invoice.payment_method,
      notes: invoice.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveInvoice = async () => {
    try {
      if (editingInvoice) {
        await apiService.updateSalesInvoice(editingInvoice.id, formData);
        addToast(t('salesInvoice.updated'), 'success');
      } else {
        await apiService.createSalesInvoice(formData);
        addToast(t('salesInvoice.created'), 'success');
      }
      setModalOpen(false);
      loadInvoices();
    } catch (error) {
      addToast(t('salesInvoice.errorSaving'), 'error');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm(t('salesInvoice.confirmDelete'))) {
      try {
        await apiService.deleteSalesInvoice(id);
        addToast(t('salesInvoice.deleted'), 'success');
        loadInvoices();
      } catch (error) {
        addToast(t('salesInvoice.errorDeleting'), 'error');
      }
    }
  };

  const formatCurrency = (amount) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      numberingSystem: 'latn',
    }).format(amount);
  };

  const formatCurrencyInput = (value) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      numberingSystem: 'latn',
    }).format(value);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: '', item_name: '', quantity: 1, cost_price: 0, selling_price: 0, profit_margin: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems.length > 0 ? newItems : [{ item_id: '', item_name: '', quantity: 1, cost_price: 0, selling_price: 0, profit_margin: 0 }] });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-calculate profit margin when cost_price or selling_price changes
    if (field === 'cost_price' || field === 'selling_price') {
      const costPrice = parseFloat(newItems[index].cost_price) || 0;
      const sellingPrice = parseFloat(newItems[index].selling_price) || 0;
      const margin = sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice * 100).toFixed(2) : 0;
      newItems[index].profit_margin = parseFloat(margin);
    }

    // Auto-select item name when item_id is selected
    if (field === 'item_id') {
      const selectedItem = items.find(i => String(i.id) === String(value));
      if (selectedItem) {
        newItems[index].item_name = selectedItem.name;
        newItems[index].cost_price = selectedItem.price || 0;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="page">

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 8px 32px rgba(16,185,129,0.28)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
            <FaReceipt />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.25rem,3vw,1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('salesInvoice.title')}</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {invoices.length} فاتورة · {t('salesInvoice.subtitle')}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate('/quick-invoice')} 
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: '1px solid rgba(255,255,255,0.3)', 
              color: '#fff', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontWeight: 600, 
              backdropFilter: 'blur(4px)', 
              fontSize: '0.875rem',
            }}
          >
            <FaBolt size={13} /> فاتورة سريعة
          </button>
          <button onClick={handleAddInvoice} style={{ background: '#fff', border: 'none', color: '#10b981', padding: '0.6rem 1.4rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <FaPlus size={13} /> {t('salesInvoice.newInvoice')}
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'إجمالي الفواتير', value: invoices.length, color: '#10b981', bg: '#10b98115', icon: <FaReceipt /> },
          { label: 'إجمالي المبيعات', value: formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)), color: '#3b82f6', bg: '#3b82f615', icon: <FaPlus /> },
          { label: 'المبلغ المدفوع', value: formatCurrency(invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0)), color: '#10b981', bg: '#10b98115', icon: <FaPlus /> },
          { label: 'المتبقي', value: formatCurrency(invoices.reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.paid_amount || 0)), 0)), color: '#ef4444', bg: '#ef444415', icon: <FaPlus /> },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} style={{ background: 'var(--color-card-background)', borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Invoices Table ── */}
      <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>{t('common.loading')}</div>
        ) : invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: '18px', background: '#10b98112', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#10b981', margin: '0 auto 1.25rem' }}><FaReceipt /></div>
            <h3 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem' }}>{t('salesInvoice.noInvoices')}</h3>
            <p style={{ color: 'var(--color-text-muted)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>{t('salesInvoice.noInvoicesDesc')}</p>
            <button onClick={handleAddInvoice} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaPlus size={12} /> {t('salesInvoice.newInvoice')}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  {[t('salesInvoice.invoiceNumber'), t('salesInvoice.customer'), t('salesInvoice.date'), t('salesInvoice.items'), t('salesInvoice.total'), t('salesInvoice.paid'), t('salesInvoice.status'), t('common.actions')].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'start', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>#{invoice.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>{invoice.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{invoice.customer_phone}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(invoice.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', maxWidth: 200 }}>
                        {invoice.items && invoice.items.length > 0 ? (
                          invoice.items.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '0.2rem', padding: '0.35rem 0.6rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text)' }}>{item.item_name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                {item.quantity}x {formatCurrency(item.selling_price)} · هامش: <span style={{ color: item.profit_margin >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{item.profit_margin}%</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{formatCurrency(invoice.total_amount)}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#10b981', whiteSpace: 'nowrap' }}>{formatCurrency(invoice.paid_amount)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: invoice.paid_amount >= invoice.total_amount ? '#10b98115' : '#f59e0b15', color: invoice.paid_amount >= invoice.total_amount ? '#10b981' : '#f59e0b' }}>
                        {invoice.paid_amount >= invoice.total_amount ? t('salesInvoice.fullyPaid') : t('salesInvoice.partial')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap' }}>
                        <button onClick={() => handleEditInvoice(invoice)} style={{ width: 30, height: 30, borderRadius: '8px', background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✏️</button>
                        <button onClick={() => handleDeleteInvoice(invoice.id)} style={{ width: 30, height: 30, borderRadius: '8px', background: '#ef444412', color: '#ef4444', border: '1px solid #ef444430', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--color-border-light)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#10b98118', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editingInvoice ? <FaEdit size={16} /> : <FaPlus size={16} />}
                </div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>
                  {editingInvoice ? t('salesInvoice.editInvoice') : t('salesInvoice.newInvoice')}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>{t('salesInvoice.customerName')}</label>
                  <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} placeholder={t('salesInvoice.customerNamePlaceholder')} style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface)', fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>{t('salesInvoice.customerPhone')}</label>
                  <input type="text" value={formData.customer_phone} onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })} placeholder={t('salesInvoice.customerPhonePlaceholder')} style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface)', fontSize: '0.875rem' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{t('salesInvoice.items')}</label>
                  <button onClick={() => navigate('/items/new')} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FaPlus size={10} /> {t('items.addNewItem')}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.items.map((item, index) => (
                    <div key={index} style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border-light)', position: 'relative' }}>
                      {formData.items.length > 1 && (
                        <button onClick={() => removeItem(index)} style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', width: 26, height: 26, borderRadius: '8px', background: '#ef444412', color: '#ef4444', border: '1px solid #ef444430', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>✕</button>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>{t('salesInvoice.item')}</label>
                          <select value={item.item_id} onChange={(e) => updateItem(index, 'item_id', e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: 'var(--color-card-background)', fontSize: '0.85rem' }}>
                            <option value="">{t('salesInvoice.selectItem')}</option>
                            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>{t('salesInvoice.quantity')}</label>
                          <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} min="1" style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: 'var(--color-card-background)', fontSize: '0.85rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>{t('salesInvoice.costPrice')}</label>
                          <input type="number" value={item.cost_price} onChange={(e) => updateItem(index, 'cost_price', parseFloat(e.target.value) || 0)} placeholder="0" style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: 'var(--color-card-background)', fontSize: '0.85rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>{t('salesInvoice.sellingPrice')}</label>
                          <input type="number" value={item.selling_price} onChange={(e) => updateItem(index, 'selling_price', parseFloat(e.target.value) || 0)} placeholder="0" style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: 'var(--color-card-background)', fontSize: '0.85rem' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>{t('salesInvoice.profitMargin')}</label>
                          <input type="text" value={`${item.profit_margin}%`} readOnly style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface)', fontSize: '0.85rem', color: item.profit_margin >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>{t('salesInvoice.itemTotal')}</label>
                          <input type="text" value={formatCurrency(item.selling_price * item.quantity)} readOnly style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface)', fontSize: '0.85rem', fontWeight: 600 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addItem} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border-light)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <FaPlus size={11} /> {t('salesInvoice.addItem')}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>{t('salesInvoice.totalAmount')}</label>
                  <input type="number" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })} placeholder="0" style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface)', fontSize: '0.875rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>{t('salesInvoice.paidAmount')}</label>
                  <input type="number" value={formData.paid_amount} onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })} placeholder="0" style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface)', fontSize: '0.875rem' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>{t('salesInvoice.paymentMethod')}</label>
                  <select value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface)', fontSize: '0.875rem' }}>
                    <option value="cash">{t('salesInvoice.cash')}</option>
                    <option value="card">{t('salesInvoice.card')}</option>
                    <option value="credit">{t('salesInvoice.credit')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>{t('salesInvoice.notes')}</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder={t('salesInvoice.notesPlaceholder')} rows={3} style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface)', fontSize: '0.875rem', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border-light)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-light)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>{t('common.cancel')}</button>
              <button onClick={handleSaveInvoice} style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoice;
