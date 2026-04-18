import React from 'react';

const Button = ({ children, onClick, type = 'button', disabled = false, className = '', style = {} }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;