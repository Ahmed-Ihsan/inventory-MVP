import React from 'react';

export const InfoTooltip = ({ content, children }) => {
  const [show, setShow] = React.useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ cursor: 'pointer', marginLeft: '0.5rem' }}
      >
        ℹ️
      </span>
      {show && (
        <span style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-dark)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '4px',
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          marginBottom: '0.25rem'
        }}>
          {content || children}
        </span>
      )}
    </span>
  );
};

const Tooltip = ({ text, children }) => {
  const [show, setShow] = React.useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </span>
      {show && (
        <span style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-dark)',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          marginBottom: '0.25rem'
        }}>
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;