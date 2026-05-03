import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  style = {},
  loading = false,
  fullWidth = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${className}${fullWidth ? ' btn-full-width' : ''}${loading ? ' btn-loading' : ''}`}
      style={style}
      aria-busy={loading}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;