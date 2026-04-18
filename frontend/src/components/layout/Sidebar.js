import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaChartPie, 
  FaMoneyBillWave, 
  FaShoppingCart, 
  FaBoxes, 
  FaTags, 
  FaWarehouse, 
  FaBarcode 
} from 'react-icons/fa';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: <FaChartPie /> },
    { path: '/payments', label: t('nav.payments'), icon: <FaMoneyBillWave /> },
    { path: '/purchases', label: t('nav.purchases'), icon: <FaShoppingCart /> },
    { path: '/items', label: t('items.catalog'), icon: <FaBoxes /> },
    { path: '/categories', label: t('nav.categories'), icon: <FaTags /> },
    { path: '/stock', label: t('stock.tracking'), icon: <FaWarehouse /> },
    { path: '/scan', label: t('scanning.title'), icon: <FaBarcode /> },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div style={{ 
        padding: '0 0.5rem',
        marginBottom: '0.5rem',
      }}>
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-text-muted)',
          padding: '0 0.75rem',
        }}>
          {t('nav.dashboard')}
        </span>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <a 
                href={item.path} 
                className={isActive(item.path) ? 'active' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ 
                  fontSize: '1rem', 
                  opacity: isActive(item.path) ? 1 : 0.7,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;