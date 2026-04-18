import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <p style={{ 
        margin: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '0.25rem',
      }}>
        <span style={{ opacity: 0.7 }}>&copy; {new Date().getFullYear()}</span>
        <span style={{ 
          fontWeight: '600',
          color: 'var(--color-text-secondary)',
        }}>
          Inventory Management
        </span>
        <span style={{ opacity: 0.5 }}>•</span>
        <span style={{ opacity: 0.5 }}>All rights reserved</span>
      </p>
    </footer>
  );
};

export default Footer;