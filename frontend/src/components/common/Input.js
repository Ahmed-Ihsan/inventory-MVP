import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, className = '', id, label, required = false, ...props }) => {
  return (
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`input ${className}`}
      aria-label={label || placeholder}
      aria-required={required}
      {...props}
    />
  );
};

export default Input;