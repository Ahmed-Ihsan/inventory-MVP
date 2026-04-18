import React from 'react';
import Button from './Button';
import { FaBoxOpen, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

const EmptyState = ({
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
      default:
        return {
          icon: CustomIcon || <FaBoxOpen size={48} color="var(--color-gray)" />,
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
    >
      <div style={{ marginBottom: '1.5rem', opacity: 0.7 }}>
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
        <Button onClick={onAction}>
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;