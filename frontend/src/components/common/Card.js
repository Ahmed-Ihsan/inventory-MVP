import React from 'react';

const Card = ({
  children,
  className = '',
  style = {},
  header = null,
  footer = null,
  hoverable = false
}) => {
  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      style={style}
    >
      {header && (
        <div className="card-header">
          {typeof header === 'string' ? <h3>{header}</h3> : header}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;