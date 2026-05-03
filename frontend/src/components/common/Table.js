import React from 'react';
import { FaInbox } from 'react-icons/fa';

const Table = ({ columns, data, className = '', emptyMessage = 'لا توجد بيانات للعرض' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <table className={`table ${className}`}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} style={{ textAlign: 'right', fontWeight: 'bold' }}>{col.header}</th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="table-empty-state">
          <div className="table-empty-icon"><FaInbox /></div>
          <p className="table-empty-msg">{emptyMessage}</p>
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
              <th key={index} style={{ textAlign: 'right', fontWeight: 'bold' }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} style={{ textAlign: col.accessor === 'actions' ? 'center' : 'right' }}>
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