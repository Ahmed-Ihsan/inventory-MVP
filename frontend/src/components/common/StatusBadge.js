import React from 'react';

const StatusBadge = ({ status, type = 'default', size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
      case 'مفعل':
        return { bg: 'var(--color-success)', color: 'white', text: 'مفعل' };
      case 'inactive':
      case 'معطل':
        return { bg: 'var(--color-gray)', color: 'white', text: 'معطل' };
      case 'low_stock':
      case 'مخزون منخفض':
        return { bg: 'var(--color-warning)', color: 'white', text: 'مخزون منخفض' };
      case 'out_of_stock':
      case 'نفد المخزون':
        return { bg: 'var(--color-danger)', color: 'white', text: 'نفد المخزون' };
      case 'pending':
      case 'في الانتظار':
        return { bg: 'var(--color-info)', color: 'white', text: 'في الانتظار' };
      default:
        return { bg: 'var(--color-secondary)', color: 'white', text: status };
    }
  };

  const config = getStatusConfig();

  const sizeStyles = {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    lg: { padding: '0.5rem 1rem', fontSize: '1rem' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: 'var(--border-radius-md)',
        fontWeight: '500',
        fontSize: sizeStyles[size].fontSize,
        padding: sizeStyles[size].padding,
        whiteSpace: 'nowrap',
      }}
    >
      {config.text}
    </span>
  );
};

const PriorityBadge = ({ priority, size = 'md' }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'high':
      case 'عالي':
        return { bg: 'var(--color-danger)', color: 'white', text: 'عالي' };
      case 'medium':
      case 'متوسط':
        return { bg: 'var(--color-warning)', color: 'white', text: 'متوسط' };
      case 'low':
      case 'منخفض':
        return { bg: 'var(--color-success)', color: 'white', text: 'منخفض' };
      default:
        return { bg: 'var(--color-gray)', color: 'white', text: priority };
    }
  };

  const config = getPriorityConfig();

  const sizeStyles = {
    sm: { padding: '0.125rem 0.375rem', fontSize: '0.75rem' },
    md: { padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
    lg: { padding: '0.375rem 0.75rem', fontSize: '1rem' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: 'var(--border-radius-sm)',
        fontWeight: '600',
        fontSize: sizeStyles[size].fontSize,
        padding: sizeStyles[size].padding,
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
      }}
    >
      {config.text}
    </span>
  );
};

export { StatusBadge, PriorityBadge };