import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { FaPlus, FaReceipt, FaEdit, FaBolt, FaTimes, FaPrint } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { Card as ShadcnCard, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { cn } from '../lib/utils';

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
    items: [
      {
        item_id: '',
        item_name: '',
        quantity: 1,
        cost_price: 0,
        selling_price: 0,
        profit_margin: 0,
      },
    ],
    total_amount: 0,
    paid_amount: 0,
    payment_method: 'cash',
    notes: '',
  });

  const loadInvoices = useCallback(async () => {
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
  }, [addToast, t]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setFormData({
      customer_name: '',
      customer_phone: '',
      items: [
        {
          item_id: '',
          item_name: '',
          quantity: 1,
          cost_price: 0,
          selling_price: 0,
          profit_margin: 0,
        },
      ],
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
      items:
        invoice.items && invoice.items.length > 0
          ? invoice.items
          : [
              {
                item_id: '',
                item_name: '',
                quantity: 1,
                cost_price: 0,
                selling_price: 0,
                profit_margin: 0,
              },
            ],
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

  const handlePrintInvoice = (invoice) => {
    const printContent = `
      <html dir="${i18n.language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <title>Invoice #${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
          .invoice-title { font-size: 24px; font-weight: bold; color: #10b981; }
          .invoice-info { margin: 10px 0; }
          .customer-info { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .items-table th { background: #10b981; color: white; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { font-size: 18px; font-weight: bold; margin: 5px 0; }
          .status { padding: 5px 15px; border-radius: 20px; display: inline-block; margin-top: 10px; }
          .paid { background: #10b981; color: white; }
          .partial { background: #f59e0b; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="invoice-title">فاتورة مبيعات #${invoice.id}</div>
          <div class="invoice-info">التاريخ: ${new Date(invoice.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</div>
        </div>
        <div class="customer-info">
          <strong>العميل:</strong> ${invoice.customer_name}<br>
          ${invoice.customer_phone ? `<strong>الهاتف:</strong> ${invoice.customer_phone}<br>` : ''}
        </div>
        <table class="items-table">
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>سعر البيع</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items && invoice.items.length > 0 ? invoice.items.map(item => `
              <tr>
                <td>${item.item_name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.selling_price)}</td>
                <td>${formatCurrency(item.selling_price * item.quantity)}</td>
              </tr>
            `).join('') : '<tr><td colspan="4">لا توجد أصناف</td></tr>'}
          </tbody>
        </table>
        <div class="totals">
          <div class="total-row">الإجمالي: ${formatCurrency(invoice.total_amount)}</div>
          <div class="total-row">المدفوع: ${formatCurrency(invoice.paid_amount)}</div>
          <div class="total-row">المتبقي: ${formatCurrency(invoice.total_amount - invoice.paid_amount)}</div>
          <div class="status ${invoice.paid_amount >= invoice.total_amount ? 'paid' : 'partial'}">
            ${invoice.paid_amount >= invoice.total_amount ? 'مدفوع بالكامل' : 'مدفوع جزئياً'}
          </div>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          item_id: '',
          item_name: '',
          quantity: 1,
          cost_price: 0,
          selling_price: 0,
          profit_margin: 0,
        },
      ],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items:
        newItems.length > 0
          ? newItems
          : [
              {
                item_id: '',
                item_name: '',
                quantity: 1,
                cost_price: 0,
                selling_price: 0,
                profit_margin: 0,
              },
            ],
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-calculate profit margin when cost_price or selling_price changes
    if (field === 'cost_price' || field === 'selling_price') {
      const costPrice = parseFloat(newItems[index].cost_price) || 0;
      const sellingPrice = parseFloat(newItems[index].selling_price) || 0;
      const margin =
        sellingPrice > 0 ? (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(2) : 0;
      newItems[index].profit_margin = parseFloat(margin);
    }

    // Auto-select item name when item_id is selected
    if (field === 'item_id') {
      const selectedItem = items.find((i) => String(i.id) === String(value));
      if (selectedItem) {
        newItems[index].item_name = selectedItem.name;
        newItems[index].cost_price = selectedItem.price || 0;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
              <FaReceipt size={24} className="sm:size-26 md:size-28" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {t('salesInvoice.title')}
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium">
                {invoices.length} فاتورة · {t('salesInvoice.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/quick-invoice')}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm flex-1 sm:flex-none"
            >
              <FaBolt size={12} className="sm:size-13 mr-2" />
              <span className="hidden sm:inline">فاتورة سريعة</span>
            </Button>
            <Button
              size="sm"
              onClick={handleAddInvoice}
              className="bg-white text-emerald-600 hover:bg-white/90 font-semibold shadow-lg flex-1 sm:flex-none"
            >
              <FaPlus size={12} className="sm:size-13 mr-2" />
              {t('salesInvoice.newInvoice')}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-4 sm:mb-6">
          <ShadcnCard className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  إجمالي الفواتير
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                  <FaReceipt size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
                {invoices.length}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">فاتورة مسجلة</p>
            </CardContent>
          </ShadcnCard>

          <ShadcnCard className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  إجمالي المبيعات
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
                  <FaPlus size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 drop-shadow-sm">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0))}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">إجمالي الإيرادات</p>
            </CardContent>
          </ShadcnCard>

          <ShadcnCard className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  المبلغ المدفوع
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                  <FaPlus size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0))}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">تم تحصيله</p>
            </CardContent>
          </ShadcnCard>

          <ShadcnCard className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  المتبقي
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 ring-1 ring-red-500/20">
                  <FaPlus size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400 drop-shadow-sm">
                {formatCurrency(
                  invoices.reduce(
                    (sum, inv) => sum + ((inv.total_amount || 0) - (inv.paid_amount || 0)),
                    0
                  )
                )}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">ديون معلقة</p>
            </CardContent>
          </ShadcnCard>
        </div>
      )}

      {/* Invoices Table */}
      <ShadcnCard className="border-border/60 shadow-lg shadow-black/5 overflow-hidden">
        {loading ? (
          <div className="text-center p-8 sm:p-12 text-muted-foreground text-xs sm:text-sm">
            {t('common.loading')}
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center p-8 sm:p-16">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 text-xl sm:text-2xl mx-auto mb-3 sm:mb-5">
              <FaReceipt />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
              {t('salesInvoice.noInvoices')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              {t('salesInvoice.noInvoicesDesc')}
            </p>
            <Button onClick={handleAddInvoice} className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm">
              <FaPlus size={11} className="sm:size-12 mr-1" />
              {t('salesInvoice.newInvoice')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {[
                    t('salesInvoice.invoiceNumber'),
                    t('salesInvoice.customer'),
                    t('salesInvoice.date'),
                    t('salesInvoice.items'),
                    t('salesInvoice.total'),
                    t('salesInvoice.paid'),
                    t('salesInvoice.status'),
                    t('common.actions'),
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-muted-foreground whitespace-nowrap uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr
                    key={invoice.id || `invoice-${invoice.created_at}-${index}`}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-4 font-bold text-foreground whitespace-nowrap">
                      #{invoice.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-sm text-foreground">
                        {invoice.customer_name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {invoice.customer_phone}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(invoice.created_at).toLocaleDateString(
                        i18n.language === 'ar' ? 'ar-SA' : 'en-US'
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs max-w-[200px]">
                        {invoice.items && invoice.items.length > 0 ? (
                          invoice.items.map((item, idx) => (
                            <div
                              key={item.id || `invoice-item-${invoice.id}-${idx}`}
                              className="mb-1 px-2.5 py-1.5 bg-muted rounded-lg border border-border"
                            >
                              <div className="font-semibold text-xs text-foreground">
                                {item.item_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.quantity}x {formatCurrency(item.selling_price)} · هامش:{' '}
                                <span className={cn('font-semibold', item.profit_margin >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                                  {item.profit_margin}%
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(invoice.paid_amount)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-semibold',
                          invoice.paid_amount >= invoice.total_amount
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        )}
                      >
                        {invoice.paid_amount >= invoice.total_amount
                          ? t('salesInvoice.fullyPaid')
                          : t('salesInvoice.partial')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 flex-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePrintInvoice(invoice)}
                          title={t('common.print')}
                        >
                          <FaPrint size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditInvoice(invoice)}
                        >
                          <FaEdit size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                        >
                          <FaPlus size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ShadcnCard>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                {editingInvoice ? <FaEdit size={16} /> : <FaPlus size={16} />}
              </div>
              <DialogTitle className="text-lg font-bold">
                {editingInvoice ? t('salesInvoice.editInvoice') : t('salesInvoice.newInvoice')}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  {t('salesInvoice.customerName')}
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder={t('salesInvoice.customerNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  {t('salesInvoice.customerPhone')}
                </label>
                <input
                  type="text"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder={t('salesInvoice.customerPhonePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  {t('salesInvoice.items')}
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/items/new')}
                  className="text-xs"
                >
                  <FaPlus size={10} className="mr-1" />
                  {t('items.addNewItem')}
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {formData.items.map((item, index) => (
                  <div
                    key={item.item_id || `form-item-${index}`}
                    className="relative p-4 bg-muted rounded-xl border border-border"
                  >
                    {formData.items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(index)}
                      >
                        <FaTimes size={10} />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                          {t('salesInvoice.item')}
                        </label>
                        <select
                          value={item.item_id}
                          onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm cursor-pointer"
                        >
                          <option value="">اختر الصنف</option>
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                          الكمية
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          min="1"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                          سعر التكلفة
                        </label>
                        <input
                          type="number"
                          value={item.cost_price}
                          onChange={(e) => updateItem(index, 'cost_price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                          سعر البيع
                        </label>
                        <input
                          type="number"
                          value={item.selling_price}
                          onChange={(e) => updateItem(index, 'selling_price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={addItem}
                className="w-full border-dashed"
              >
                <FaPlus size={12} className="mr-2" />
                إضافة صنف آخر
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  طريقة الدفع
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted text-sm cursor-pointer"
                >
                  <option value="cash">نقداً</option>
                  <option value="installment">آجل</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  ملاحظات
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات اختيارية"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted text-sm"
                />
              </div>
            </div>

            <div className="p-4 bg-muted rounded-xl border border-border flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">
                  الإجمالي:
                </span>
                <span className="text-xl font-bold ml-2 text-emerald-600">
                  {formatCurrency(
                    formData.items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0)
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSaveInvoice} className="bg-emerald-600 hover:bg-emerald-700">
                {t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesInvoice;
