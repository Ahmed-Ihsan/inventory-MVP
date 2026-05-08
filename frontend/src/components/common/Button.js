import React from 'react';
import { Button as UiButton } from '../ui/button';
import { cn } from '../../lib/utils';

const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  style = {},
  loading = false,
  fullWidth = false,
  variant,
  size,
  ...rest
}) => {
  return (
    <UiButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(fullWidth && 'w-full', className)}
      style={style}
      aria-busy={loading}
      variant={variant}
      size={size}
      {...rest}
    >
      {loading && (
        <span
          className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </UiButton>
  );
};

export default Button;
