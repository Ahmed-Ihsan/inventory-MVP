import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '2rem',
        padding: '1rem',
      }}
    >
      {/* First page */}
      {showFirstLast && currentPage > 1 && (
        <button
          onClick={() => onPageChange(1)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--color-light)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--color-white)';
          }}
        >
          الأول
        </button>
      )}

      {/* Previous page */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--color-light)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--color-white)';
          }}
        >
          <FaChevronRight />
        </button>
      )}

      {/* Page numbers */}
      {visiblePages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            backgroundColor: page === currentPage ? 'var(--color-primary)' : 'var(--color-white)',
            color: page === currentPage ? 'var(--color-white)' : 'var(--color-text)',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            fontWeight: page === currentPage ? '600' : '400',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (page !== currentPage) {
              e.target.style.backgroundColor = 'var(--color-light)';
            }
          }}
          onMouseLeave={(e) => {
            if (page !== currentPage) {
              e.target.style.backgroundColor = 'var(--color-white)';
            }
          }}
        >
          {page}
        </button>
      ))}

      {/* Next page */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--color-light)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--color-white)';
          }}
        >
          <FaChevronLeft />
        </button>
      )}

      {/* Last page */}
      {showFirstLast && currentPage < totalPages && (
        <button
          onClick={() => onPageChange(totalPages)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--color-light)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--color-white)';
          }}
        >
          الأخير
        </button>
      )}
    </div>
  );
};

export default Pagination;