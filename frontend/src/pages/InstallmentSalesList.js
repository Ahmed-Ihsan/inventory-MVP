import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUser,
  FaEye,
  FaCheck,
  FaClock,
  FaExclamationCircle,
  FaPlus,
  FaFilter,
  FaReceipt,
  FaBox,
  FaHistory,
  FaPrint,
} from 'react-icons/fa';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import PaymentDetailsModal from '../components/installments/PaymentDetailsModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const InstallmentSalesList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadSales();
  }, [statusFilter]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter === 'overdue') {
        filters.overdue_only = true;
      } else if (statusFilter) {
        filters.status = statusFilter;
      }

      const salesData = await apiService.getInstallmentSales(filters);

      // Calculate correct values for each sale
      const salesWithCalculations = salesData.map((sale) => {
        const itemsTotal = sale.items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
        const correctTotal = itemsTotal > 0 ? itemsTotal : sale.total_amount || 0;
        const correctDownPayment = sale.down_payment || 0;
        const totalPaid =
          sale.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
        const rawRemaining = correctTotal - correctDownPayment - totalPaid;
        const correctRemaining = Math.max(0, Math.round(rawRemaining));
        const correctStatus = correctRemaining === 0 ? 'completed' : sale.status;

        return {
          ...sale,
          _correctTotal: correctTotal,
          _correctDownPayment: correctDownPayment,
          _correctRemaining: correctRemaining,
          _correctStatus: correctStatus,
        };
      });

      setSales(salesWithCalculations);
    } catch (error) {
      addToast('خطأ في تحميل بيانات الأقساط', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setPaymentAmount(0);
    setPaymentNotes('');
    setShowPaymentModal(true);
    checkItemStock(sale);
  };

  const checkItemStock = async (sale) => {
    try {
      const itemsWithStock = await Promise.all(
        (sale.items || []).map(async (item) => {
          try {
            const itemDetails = await apiService.getItem(item.item_id);
            return { ...item, current_stock: itemDetails.current_stock };
          } catch {
            return { ...item, current_stock: 0 };
          }
        })
      );
      setSelectedSale({ ...sale, items: itemsWithStock });
    } catch (error) {
      console.error('Error checking stock:', error);
    }
  };

  const handleMakePayment = async () => {
    if (!selectedSale || paymentAmount <= 0) {
      addToast('يرجى إدخال مبلغ صحيح', 'error');
      return;
    }

    if (paymentAmount > selectedSale._correctRemaining) {
      addToast('المبلغ المدخل أكبر من المبلغ المتبقي', 'error');
      return;
    }

    try {
      const paymentData = {
        payment_date: new Date().toISOString(),
        amount: paymentAmount,
        month_number: selectedSale.paid_months + 1,
        notes: paymentNotes,
      };

      await apiService.createInstallmentSalePayment(selectedSale.id, paymentData);
      addToast('تم تسجيل الدفعة بنجاح', 'success');
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setPaymentNotes('');
      loadSales();
    } catch (error) {
      addToast('خطأ في تسجيل الدفعة', 'error');
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteSale = async () => {
    if (!confirmDeleteId) return;
    try {
      await apiService.deleteInstallmentSale(confirmDeleteId);
      addToast('تم حذف البيع بنجاح', 'success');
      setConfirmDeleteId(null);
      loadSales();
    } catch (error) {
      addToast('خطأ في حذف البيع: ' + error.message, 'error');
    }
  };

  const handleExportPayments = async (saleId) => {
    try {
      const sale = sales.find(s => s.id === saleId);
      if (!sale) {
        addToast('لم يتم العثور على البيع', 'error');
        return;
      }

      const correctRemaining = sale._correctRemaining !== undefined ? sale._correctRemaining : sale.total_amount - (sale.down_payment || 0);
      const remainingMonths = sale.total_months - sale.paid_months;
      const correctMonthly = remainingMonths > 0 ? Math.round(correctRemaining / remainingMonths) : 0;

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ['ملخص خطة الأقساط'],
        [],
        ['معلومات الخطة'],
        ['رقم الخطة', sale.id],
        ['الحالة', sale._correctStatus || sale.status === 'active' ? 'نشط' : sale.status === 'completed' ? 'مكتمل' : sale.status === 'cancelled' ? 'ملغي' : 'متأخر'],
        ['تاريخ البدء', new Date(sale.start_date).toLocaleDateString('ar-SA')],
        ['تاريخ الانتهاء المتوقع', new Date(new Date(sale.start_date).setMonth(new Date(sale.start_date).getMonth() + sale.total_months)).toLocaleDateString('ar-SA')],
        [],
        ['معلومات العميل'],
        ['اسم العميل', sale.customer_name],
        ['رقم الهاتف', sale.customer_phone || '-'],
        [],
        ['تفاصيل الأصناف'],
      ];

      // Add items to summary
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item, index) => {
          summaryData.push([`الصنف ${index + 1}`, item.item_name]);
          summaryData.push(['الكمية', item.quantity]);
          summaryData.push(['السعر', formatCurrency(item.total_price)]);
          summaryData.push([]);
        });
      } else {
        summaryData.push(['لا توجد أصناف']);
        summaryData.push([]);
      }

      summaryData.push(
        ['ملخص الأقساط'],
        ['الإجمالي الكلي', formatCurrency(sale._correctTotal || sale.total_amount)],
        ['الدفعة الأولى', formatCurrency(sale.down_payment)],
        ['المبلغ المتبقي', formatCurrency(correctRemaining)],
        ['عدد الأشهر', sale.total_months],
        ['الأقساط المدفوعة', `${sale.paid_months}/${sale.total_months}`],
        ['القسط الشهري', formatCurrency(correctMonthly)],
        ['طريقة الدفع', 'آجل'],
        [],
        ['معلومات الدفع القادم'],
        ['تاريخ الدفعة القادمة', sale.next_payment_date ? new Date(sale.next_payment_date).toLocaleDateString('ar-SA') : '-'],
        ['المبلغ المتبقي للسداد', formatCurrency(correctRemaining)],
        ['عدد الأقساط المتبقية', remainingMonths]
      );

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

      // Style summary sheet
      const summaryRange = XLSX.utils.decode_range(summaryWs['!ref']);
      for (let R = summaryRange.s.r; R <= summaryRange.e.r; ++R) {
        for (let C = summaryRange.s.c; C <= summaryRange.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!summaryWs[cellAddress]) continue;
          
          // Header row styling
          if (R === 0) {
            summaryWs[cellAddress].s = {
              font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
              fill: { fgColor: { rgb: '667eea' } },
              alignment: { horizontal: 'center', vertical: 'center' },
            };
          }
          // Label column styling
          else if (C === 0) {
            summaryWs[cellAddress].s = {
              font: { bold: true, sz: 12, color: { rgb: '333333' } },
              fill: { fgColor: { rgb: 'F3F4F6' } },
            };
          }
          // Value column styling
          else {
            summaryWs[cellAddress].s = {
              font: { sz: 12, color: { rgb: '333333' } },
              alignment: { horizontal: 'left' },
            };
          }
        }
      }

      // Set column widths
      summaryWs['!cols'] = [
        { wch: 20 },
        { wch: 25 },
      ];

      XLSX.utils.book_append_sheet(wb, summaryWs, 'ملخص');

      // Payments sheet
      const paymentHeaders = ['رقم', 'التاريخ', 'المبلغ (د.ع.)', 'رقم القسط', 'الحالة', 'الملاحظات'];
      const paymentRows = sale.payments && sale.payments.length > 0 
        ? sale.payments.map((payment, index) => [
            index + 1,
            new Date(payment.payment_date).toLocaleDateString('ar-SA'),
            formatCurrency(payment.amount),
            payment.month_number,
            payment.status || 'مدفوع',
            payment.notes || '-'
          ])
        : [['لا توجد مدفوعات']];

      const paymentData = [paymentHeaders, ...paymentRows];
      const paymentWs = XLSX.utils.aoa_to_sheet(paymentData);

      // Style payments sheet
      const paymentRange = XLSX.utils.decode_range(paymentWs['!ref']);
      for (let R = paymentRange.s.r; R <= paymentRange.e.r; ++R) {
        for (let C = paymentRange.s.c; C <= paymentRange.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!paymentWs[cellAddress]) continue;
          
          // Header row styling
          if (R === 0) {
            paymentWs[cellAddress].s = {
              font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
              fill: { fgColor: { rgb: '10b981' } },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } },
              },
            };
          }
          // Data rows
          else {
            paymentWs[cellAddress].s = {
              font: { sz: 11, color: { rgb: '333333' } },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                right: { style: 'thin', color: { rgb: 'E0E0E0' } },
              },
            };
          }
        }
      }

      // Set column widths for payments
      paymentWs['!cols'] = [
        { wch: 8 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 25 },
      ];

      XLSX.utils.book_append_sheet(wb, paymentWs, 'المدفوعات');

      // Payment schedule sheet
      const scheduleHeaders = ['رقم القسط', 'تاريخ الاستحقاق', 'المبلغ (د.ع.)', 'الحالة', 'تاريخ الدفع', 'الملاحظات'];
      const scheduleRows = [];
      
      for (let i = 1; i <= sale.total_months; i++) {
        const dueDate = new Date(sale.start_date);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        const payment = sale.payments && sale.payments.find(p => p.month_number === i);
        const isPaid = payment !== undefined;
        
        scheduleRows.push([
          i,
          dueDate.toLocaleDateString('ar-SA'),
          formatCurrency(correctMonthly),
          isPaid ? 'مدفوع' : 'غير مدفوع',
          isPaid ? new Date(payment.payment_date).toLocaleDateString('ar-SA') : '-',
          isPaid ? (payment.notes || '') : ''
        ]);
      }

      const scheduleData = [scheduleHeaders, ...scheduleRows];
      const scheduleWs = XLSX.utils.aoa_to_sheet(scheduleData);

      // Style schedule sheet
      const scheduleRange = XLSX.utils.decode_range(scheduleWs['!ref']);
      for (let R = scheduleRange.s.r; R <= scheduleRange.e.r; ++R) {
        for (let C = scheduleRange.s.c; C <= scheduleRange.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!scheduleWs[cellAddress]) continue;
          
          // Header row styling
          if (R === 0) {
            scheduleWs[cellAddress].s = {
              font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
              fill: { fgColor: { rgb: 'f59e0b' } },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } },
              },
            };
          }
          // Paid rows styling
          else if (scheduleRows[R - 1][3] === 'مدفوع') {
            scheduleWs[cellAddress].s = {
              font: { sz: 11, color: { rgb: '10b981' } },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                right: { style: 'thin', color: { rgb: 'E0E0E0' } },
              },
            };
          }
          // Unpaid rows styling
          else {
            scheduleWs[cellAddress].s = {
              font: { sz: 11, color: { rgb: '333333' } },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                right: { style: 'thin', color: { rgb: 'E0E0E0' } },
              },
            };
          }
        }
      }

      // Set column widths for schedule
      scheduleWs['!cols'] = [
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 20 },
      ];

      XLSX.utils.book_append_sheet(wb, scheduleWs, 'جدول الأقساط');

      // Generate and download file
      XLSX.writeFile(wb, `payment_history_${sale.id}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      addToast('تم تصدير سجل المدفوعات بنجاح', 'success');
    } catch (error) {
      addToast('خطأ في تصدير المدفوعات: ' + error.message, 'error');
    }
  };

  const getStatusBadge = (sale) => {
    const status = sale._correctStatus !== undefined ? sale._correctStatus : sale.status;
    const statusStyles = {
      active: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' },
      completed: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff' },
      cancelled: { background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', color: '#fff' },
      overdue: { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff' },
    };
    const style = statusStyles[status] || statusStyles.active;

    return (
      <span
        style={{
          ...style,
          padding: '0.375rem 0.875rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {status === 'active'
          ? 'نشط'
          : status === 'completed'
            ? 'مكتمل'
            : status === 'cancelled'
              ? 'ملغي'
              : status === 'overdue'
                ? 'متأخر'
                : status}
      </span>
    );
  };

  const handlePrintPlan = (sale) => {
    const correctRemaining = sale._correctRemaining !== undefined ? sale._correctRemaining : sale.total_amount - (sale.down_payment || 0);
    const remainingMonths = sale.total_months - sale.paid_months;
    const correctMonthly = remainingMonths > 0 ? Math.round(correctRemaining / remainingMonths) : 0;
    const printContent = `
      <html dir="${i18n.language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <title>خطة الأقساط #${sale.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          @page {
            size: A4;
            margin: 8mm;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Cairo', Arial, sans-serif; 
            padding: 3mm;
            background: white;
            color: #1a1a1a;
            line-height: 1.3;
            font-size: 10px;
          }
          .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            border: 1px solid #e0e0e0;
            overflow: hidden;
            page-break-inside: avoid;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 5mm;
            text-align: center;
          }
          .title { 
            font-size: 16px; 
            font-weight: 700; 
            margin-bottom: 2px;
          }
          .subtitle {
            font-size: 9px;
            opacity: 0.9;
          }
          .invoice-number {
            background: rgba(255,255,255,0.2);
            padding: 2px 8px;
            border-radius: 12px;
            display: inline-block;
            margin-top: 3px;
            font-size: 9px;
            font-weight: 600;
          }
          .content {
            padding: 3mm;
          }
          .section {
            margin-bottom: 3mm;
            padding: 3mm;
            background: #f8f9fa;
            border-radius: 3px;
            border-left: 2px solid #667eea;
            page-break-inside: avoid;
          }
          .section-title { 
            font-size: 11px; 
            font-weight: 700; 
            color: #667eea;
            margin-bottom: 2mm;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3mm;
          }
          .info-item {
            background: white;
            padding: 3mm;
            border-radius: 3px;
            border: 1px solid #e0e0e0;
          }
          .info-label {
            font-size: 9px;
            color: #666;
            margin-bottom: 1mm;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .info-value {
            font-size: 11px;
            font-weight: 600;
            color: #1a1a1a;
          }
          .items-list {
            margin-top: 3mm;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            padding: 2mm 3mm;
            background: white;
            border-radius: 3px;
            margin-bottom: 2mm;
            border: 1px solid #e0e0e0;
          }
          .item-name {
            font-weight: 600;
            color: #1a1a1a;
            font-size: 11px;
          }
          .item-details {
            text-align: right;
            color: #666;
            font-size: 10px;
          }
          .summary-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4mm;
            border-radius: 4px;
            margin-top: 3mm;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 2mm 0;
            border-bottom: 1px solid rgba(255,255,255,0.2);
          }
          .summary-row:last-child {
            border-bottom: none;
          }
          .summary-label {
            font-size: 10px;
            opacity: 0.9;
          }
          .summary-value {
            font-size: 12px;
            font-weight: 700;
          }
          .highlight {
            background: rgba(255,255,255,0.2);
            padding: 3mm 5mm;
            border-radius: 4px;
            margin-top: 3mm;
            text-align: center;
          }
          .highlight-value {
            font-size: 16px;
            font-weight: 700;
            color: #10b981;
          }
          .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 3mm;
            background: white;
            border-radius: 3px;
            overflow: hidden;
          }
          .payment-table th {
            background: #667eea;
            color: white;
            padding: 2mm;
            text-align: center;
            font-weight: 600;
            font-size: 9px;
          }
          .payment-table td {
            padding: 2mm;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
            font-size: 10px;
          }
          .payment-table tr:last-child td {
            border-bottom: none;
          }
          .payment-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          .footer {
            text-align: center;
            padding: 3mm;
            color: #666;
            font-size: 9px;
            border-top: 1px solid #e0e0e0;
            margin-top: 3mm;
          }
          @media print {
            body { padding: 0; background: white; }
            .container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">خطة الأقساط</div>
            <div class="subtitle">نظام إدارة المخزون</div>
            <div class="invoice-number">رقم الخطة: #${sale.id}</div>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">معلومات العميل</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">اسم العميل</div>
                  <div class="info-value">${sale.customer_name}</div>
                </div>
                ${sale.customer_phone ? `
                <div class="info-item">
                  <div class="info-label">رقم الهاتف</div>
                  <div class="info-value">${sale.customer_phone}</div>
                </div>
                ` : ''}
                <div class="info-item">
                  <div class="info-label">تاريخ البدء</div>
                  <div class="info-value">${new Date(sale.start_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">الحالة</div>
                  <div class="info-value" style="color: #10b981;">نشط</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">الأصناف المشتراة</div>
              <div class="items-list">
                ${sale.items && sale.items.length > 0 ? sale.items.map(item => `
                  <div class="item-row">
                    <div class="item-name">${item.item_name}</div>
                    <div class="item-details">
                      الكمية: ${item.quantity} | السعر: ${formatCurrency(item.total_price)}
                    </div>
                  </div>
                `).join('') : '<div class="info-item"><div class="info-value">لا توجد أصناف</div></div>'}
              </div>
            </div>

            <div class="section">
              <div class="section-title">ملخص الأقساط</div>
              <div class="summary-box">
                <div class="summary-row">
                  <span class="summary-label">الإجمالي الكلي</span>
                  <span class="summary-value">${formatCurrency(sale._correctTotal || sale.total_amount)}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">الدفعة الأولى</span>
                  <span class="summary-value">${formatCurrency(sale.down_payment)}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">المبلغ المتبقي</span>
                  <span class="summary-value">${formatCurrency(correctRemaining)}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">عدد الأشهر</span>
                  <span class="summary-value">${sale.total_months} شهر</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">الأقساط المدفوعة</span>
                  <span class="summary-value">${sale.paid_months}/${sale.total_months}</span>
                </div>
                <div class="highlight">
                  <div class="summary-label" style="color: white; margin-bottom: 2mm;">القسط الشهري</div>
                  <div class="highlight-value" style="color: white;">${formatCurrency(correctMonthly)}</div>
                </div>
              </div>
            </div>

            ${sale.payments && sale.payments.length > 0 ? `
            <div class="section">
              <div class="section-title">سجل المدفوعات</div>
              <table class="payment-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                    <th>رقم القسط</th>
                  </tr>
                </thead>
                <tbody>
                  ${sale.payments.map(payment => `
                    <tr>
                      <td>${new Date(payment.payment_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</td>
                      <td>${formatCurrency(payment.amount)}</td>
                      <td>${payment.month_number}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <p>تم إصدار هذه الوثيقة في ${new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}</p>
            <p>نظام إدارة المخزون - جميع الحقوق محفوظة</p>
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

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer_phone && sale.customer_phone.includes(searchTerm));

    if (statusFilter === 'overdue') {
      // Check if status is overdue OR if it's active with past due date
      const isOverdue =
        sale.status === 'overdue' ||
        (sale.status === 'active' &&
          sale.next_payment_date &&
          new Date(sale.next_payment_date) < new Date());
      return matchesSearch && isOverdue;
    }

    if (statusFilter && statusFilter !== 'overdue') {
      return matchesSearch && (sale._correctStatus || sale.status) === statusFilter;
    }

    return matchesSearch;
  });

  const overdueSales = sales.filter(
    (sale) =>
      sale.status === 'overdue' ||
      (sale.status === 'active' &&
        sale.next_payment_date &&
        new Date(sale.next_payment_date) < new Date())
  );

  const columns = [
    { header: 'العميل', accessor: 'customer_name', sortable: true },
    { header: 'الهاتف', accessor: 'customer_phone', sortable: true },
    {
      header: 'الإجمالي (د.ع.)',
      accessor: 'total_amount',
      sortable: true,
      render: (sale) => formatCurrency(sale._correctTotal || 0),
    },
    {
      header: 'المتبقي (د.ع.)',
      accessor: 'remaining_amount',
      sortable: true,
      render: (sale) => formatCurrency(sale._correctRemaining || 0),
    },
    {
      header: 'القسط الشهري (د.ع.)',
      accessor: 'monthly_payment',
      sortable: true,
      render: (sale) => {
        const correctRemaining =
          sale._correctRemaining !== undefined
            ? sale._correctRemaining
            : sale.total_amount - (sale.down_payment || 0);
        const remainingMonths = sale.total_months - sale.paid_months;
        const correctMonthly =
          remainingMonths > 0 ? Math.round(correctRemaining / remainingMonths) : 0;
        return formatCurrency(correctMonthly);
      },
    },
    {
      header: 'الأقساط المدفوعة',
      accessor: 'paid_months',
      sortable: true,
      render: (sale) => `${sale.paid_months}/${sale.total_months}`,
    },
    {
      header: 'الدفعة القادمة',
      accessor: 'next_payment_date',
      sortable: true,
      render: (sale) =>
        sale.next_payment_date ? new Date(sale.next_payment_date).toLocaleDateString('ar-SA') : '-',
    },
    {
      header: 'الحالة',
      accessor: 'status',
      sortable: true,
      render: (sale) => getStatusBadge(sale),
    },
    {
      header: 'الإجراءات',
      accessor: 'actions',
      render: (sale) => (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Button
            onClick={() => handlePrintPlan(sale)}
            size="sm"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
            }}
          >
            <FaPrint size={10} style={{ marginLeft: '0.2rem' }} /> طباعة
          </Button>
          <Button
            onClick={() => handleViewDetails(sale)}
            size="sm"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
            }}
          >
            <FaEye size={10} style={{ marginLeft: '0.2rem' }} /> عرض
          </Button>
          <Button
            onClick={() => handleExportPayments(sale.id)}
            size="sm"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
            }}
          >
            <FaReceipt size={10} style={{ marginLeft: '0.2rem' }} /> تصدير
          </Button>
          <Button
            onClick={() => setConfirmDeleteId(sale.id)}
            size="sm"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
            }}
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="page">
      {/* Header Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 20px 60px rgba(102,126,234,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 1 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              color: '#fff',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <FaCalendarAlt />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                color: '#fff',
                fontSize: 'clamp(1.5rem,3vw,2rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                textShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              سجل الأقساط
            </h1>
            <p
              style={{
                margin: 0,
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.95rem',
                marginTop: '0.35rem',
                fontWeight: 500,
              }}
            >
              عرض وإدارة جميع مبيعات الأقساط
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/installment-sales')}
          style={{
            padding: '0.875rem 1.75rem',
            borderRadius: '14px',
            background: '#fff',
            color: '#667eea',
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
          }}
          className="hover:-translate-y-0.5 hover:shadow-lg"
        >
          <FaPlus size={14} style={{ marginLeft: '0.5rem' }} /> إضافة قسط جديد
        </Button>
      </div>

      {/* Overdue Alert */}
      {overdueSales.length > 0 && (
        <div
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 12px 40px rgba(239,68,68,0.3)',
            animation: 'pulse 2s infinite',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FaExclamationCircle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              تنبيه: {overdueSales.length} زبون متأخر عن السداد
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.95 }}>
              يرجى متابعة الزبائن المتأخرين لاستلام الأقساط المستحقة
            </p>
          </div>
          <Button
            onClick={() => setStatusFilter('overdue')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              padding: '0.625rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              backdropFilter: 'blur(4px)',
            }}
          >
            عرض المتأخرين
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.75rem',
          marginBottom: '2.5rem',
        }}
      >
        <div
          style={{
            padding: '2rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            boxShadow: '0 20px 60px rgba(16,185,129,0.35)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                opacity: 0.95,
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              إجمالي الأقساط
            </span>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <FaCheck size={20} style={{ opacity: 0.9 }} />
            </div>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            {sales.length}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>سجل نشط</div>
        </div>

        <div
          style={{
            padding: '2rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#fff',
            boxShadow: '0 20px 60px rgba(59,130,246,0.35)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                opacity: 0.95,
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              نشط
            </span>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <FaClock size={20} style={{ opacity: 0.9 }} />
            </div>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            {sales.filter((s) => s._correctStatus === 'active').length}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>قسط جاري</div>
        </div>

        <div
          style={{
            padding: '2rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            boxShadow: '0 20px 60px rgba(139,92,246,0.35)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                opacity: 0.95,
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              مكتمل
            </span>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <FaCheck size={20} style={{ opacity: 0.9 }} />
            </div>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            {sales.filter((s) => s._correctStatus === 'completed').length}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>دفعة مكتملة</div>
        </div>

        <div
          style={{
            padding: '2rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            boxShadow: '0 20px 60px rgba(245,158,11,0.35)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                opacity: 0.95,
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              متأخر
            </span>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <FaExclamationCircle size={20} style={{ opacity: 0.9 }} />
            </div>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            {overdueSales.length}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>قسط متأخر</div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          background: 'var(--color-card-background)',
          borderRadius: '28px',
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          padding: '2.5rem',
        }}
      >
        {/* Filter Section */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            padding: '1.75rem',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Input
              placeholder="بحث باسم العميل أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 500,
                border: '2px solid #e5e7eb',
                transition: 'all 0.2s',
                background: '#f9fafb',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <FaFilter
              size={14}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '14px',
              border: '1px solid var(--color-border-light)',
              background: 'var(--color-card-background)',
              fontSize: '1rem',
              color: 'var(--color-text)',
              cursor: 'pointer',
              minWidth: '200px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
            }}
          >
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
            <option value="overdue">متأخر</option>
          </select>
        </div>

        {filteredSales.length === 0 ? (
          <EmptyState type="no-results" onAction={() => setSearchTerm('')} />
        ) : (
          <Table columns={columns} data={filteredSales} />
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedSale && (
        <PaymentDetailsModal
          sale={selectedSale}
          onClose={() => setShowPaymentModal(false)}
          onMakePayment={handleMakePayment}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentNotes={paymentNotes}
          setPaymentNotes={setPaymentNotes}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="حذف البيع بالأقساط"
        message="هل أنت متأكد من حذف هذا البيع بالأقساط؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        variant="danger"
        onConfirm={handleDeleteSale}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default InstallmentSalesList;
