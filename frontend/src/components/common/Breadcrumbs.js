import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const breadcrumbNameMap = {
    'items': 'العناصر',
    'stock': 'المخزون',
    'scan': 'المسح',
    'dashboard': 'لوحة التحكم',
  };

  return (
    <nav aria-label="breadcrumb" style={{ marginBottom: '1rem' }}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <li>
          <Link
            to="/"
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <FaChevronLeft size={12} />
            الرئيسية
          </Link>
        </li>
        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = breadcrumbNameMap[pathname] || pathname;

          return (
            <li key={pathname} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ margin: '0 0.5rem', color: 'var(--color-gray)' }}>/</span>
              {isLast ? (
                <span style={{ color: 'var(--color-text)', fontWeight: '500' }}>
                  {displayName}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  style={{
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--border-radius-sm)',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--color-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;