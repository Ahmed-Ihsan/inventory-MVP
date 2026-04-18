import React from 'react';

const Table = ({ columns, data, className = '', emptyMessage = 'No data available' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <table className={`table ${className}`}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
            </tr>
          </thead>
        </table>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--color-text-muted)'
        }}>
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className={`table ${className}`}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;