import React from 'react';

const Loading = ({ size = 'md', color = 'var(--color-primary)' }) => {
  const sizeMap = {
    sm: '20px',
    md: '40px',
    lg: '60px',
  };

  return (
    <div className="loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: `4px solid ${color}20`,
          borderTop: `4px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  );
};

export default Loading;