import React from 'react';
import { Input as UiInput } from '../ui/input';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  id,
  label,
  required = false,
  ...props
}) => {
  return (
    <UiInput
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      aria-label={label || placeholder}
      aria-required={required}
      {...props}
    />
  );
};

export default Input;
