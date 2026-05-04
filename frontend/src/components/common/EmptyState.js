import React, { memo } from 'react';
import Button from './Button';
import { FaBoxOpen, FaSearch, FaExclamationTriangle, FaInbox, FaFileInvoice, FaCalendar, FaBox } from 'react-icons/fa';

const EmptyState = memo(({
  type = 'default',
  title,
  description,
  actionLabel,
  onAction,
  icon: CustomIcon
}) => {

  const getEmptyStateConfig = () => {
    switch (type) {
      case 'no-data':
        return {
          icon: <FaBoxOpen size={48} color="var(--color-gray)" />,
          title: title || 'لا توجد بيانات',
          description: description || 'لم يتم العثور على أي عناصر في هذه القائمة.',
          actionLabel: actionLabel || 'إضافة عنصر جديد',
        };
      case 'no-results':
        return {
          icon: <FaSearch size={48} color="var(--color-gray)" />,
          title: title || 'لا توجد نتائج',
          description: description || 'لم نتمكن من العثور على ما تبحث عنه. جرب مصطلحات مختلفة.',
          actionLabel: actionLabel || 'مسح البحث',
        };
      case 'error':
        return {
          icon: <FaExclamationTriangle size={48} color="var(--color-danger)" />,
          title: title || 'حدث خطأ',
          description: description || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
          actionLabel: actionLabel || 'إعادة المحاولة',
        };
      case 'no-items':
        return {
          icon: <FaBox size={48} color="var(--color-gray)" />,
          title: title || 'لا توجد أصناف',
          description: description || 'لم يتم إضافة أي أصناف بعد. ابدأ بإضافة صنف جديد.',
          actionLabel: actionLabel || 'إضافة صنف',
        };
      case 'no-invoices':
        return {
          icon: <FaFileInvoice size={48} color="var(--color-gray)" />,
          title: title || 'لا توجد فواتير',
          description: description || 'لم يتم إصدار أي فواتير بعد.',
          actionLabel: actionLabel || 'إنشاء فاتورة',
        };
      case 'no-sales':
        return {
          icon: <FaCalendar size={48} color="var(--color-gray)" />,
          title: title || 'لا توجد مبيعات',
          description: description || 'لم يتم تسجيل أي مبيعات بعد.',
          actionLabel: actionLabel || 'تسجيل بيع',
        };
      default:
        return {
          icon: CustomIcon || <FaInbox size={48} color="var(--color-gray)" />,
          title: title || 'لا توجد بيانات',
          description: description || 'لم يتم العثور على أي محتوى.',
          actionLabel: actionLabel || 'ابدأ الآن',
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-card-background)',
        borderRadius: 'var(--border-radius-lg)',
        border: '2px dashed var(--color-border)',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ marginBottom: '1.5rem', opacity: 0.7 }} aria-hidden="true">
        {config.icon}
      </div>

      <h3
        style={{
          margin: '0 0 1rem 0',
          color: 'var(--color-text)',
          fontSize: '1.25rem',
          fontWeight: '600',
        }}
      >
        {config.title}
      </h3>

      <p
        style={{
          margin: '0 0 2rem 0',
          color: 'var(--color-text-secondary)',
          fontSize: '0.875rem',
          maxWidth: '400px',
          lineHeight: '1.5',
        }}
      >
        {config.description}
      </p>

      {onAction && (
        <Button onClick={onAction} aria-label={config.actionLabel}>
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
});

export default EmptyState;