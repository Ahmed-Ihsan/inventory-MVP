import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaShoppingCart, FaBox, FaBarcode, FaReceipt, FaFileInvoice } from 'react-icons/fa';
import { cn } from '../../lib/utils';

const QuickAccessCards = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: FaReceipt,
      label: 'فاتورة سريعة',
      path: '/quick-invoice',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      icon: FaShoppingCart,
      label: 'بيع بالأقساط',
      path: '/installment-sales',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: FaBox,
      label: 'إضافة صنف',
      path: '/items/new',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    },
    {
      icon: FaBarcode,
      label: 'مسح الباركود',
      path: '/scan',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    {
      icon: FaFileInvoice,
      label: 'فاتورة بيع',
      path: '/sales-invoice',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
  ];

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">
        وصول سريع
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-none cursor-pointer flex flex-col items-center gap-2 sm:gap-3 transition-all duration-200 shadow-lg hover:-translate-y-1 hover:shadow-xl"
            style={{ background: action.gradient, color: '#fff' }}
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-white/25 text-white">
              <action.icon style={{ fontSize: '20px' }} className="sm:text-[24px]" />
            </div>
            <span className="text-[11px] sm:text-xs md:text-sm font-semibold">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessCards;
