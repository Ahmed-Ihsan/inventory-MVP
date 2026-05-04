import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSearch } from 'react-icons/fa';
import {
  FaChartPie,
  FaMoneyBillWave,
  FaShoppingCart,
  FaReceipt,
  FaBolt,
  FaBoxes,
  FaTags,
  FaWarehouse,
  FaBarcode,
  FaCalendarAlt,
  FaExchangeAlt,
  FaBell,
} from 'react-icons/fa';

const NAV_GROUPS = [
  {
    label: 'المخزون',
    items: [
      { path: '/items',     label: 'كتالوج الأصناف', icon: FaBoxes,       color: '#9b59b6' },
      { path: '/categories',label: 'الفئات',        icon: FaTags,          color: '#e74c3c' },
      { path: '/stock',     label: 'المخزون',        icon: FaWarehouse,     color: '#1abc9c' },
      { path: '/alerts',    label: 'تنبيهات المخزون', icon: FaBell,          color: '#f39c12' },
    ],
  },
  {
    label: 'المالية',
    items: [
      { path: '/installment-sales/list', label: 'بيع بالأقساط', icon: FaCalendarAlt,    color: '#667eea' },
      { path: '/purchases',       label: 'المشتريات',      icon: FaShoppingCart,  color: '#f39c12' },
      { path: '/sales-invoice',  label: 'فاتورة بيع',     icon: FaReceipt,       color: '#9b59b6' },
    ],
  },
  {
    label: 'الإشعارات',
    items: [
      { path: '/notifications', label: 'الإشعارات', icon: FaBell, color: '#667eea' },
    ],
  },
  {
    label: 'الرئيسية',
    items: [
      { path: '/',          label: 'لوحة التحكم',  icon: FaChartPie,      color: '#00b4d8', exact: true },
    ],
  },
];

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const filteredNavGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <aside style={{
      width: '280px',
      background: 'var(--color-card-background)',
      borderLeft: '1px solid var(--color-border-light)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
    }}>
      {/* Logo/Brand Section */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--color-border-light)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#fff',
          }}>
            IM
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}>
              Inventory
            </h2>
            <p style={{
              margin: 0,
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.85)',
            }}>
              Management System
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border-light)' }}>
        <div style={{ position: 'relative' }}>
          <FaSearch 
            size={14} 
            style={{ 
              position: 'absolute', 
              right: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--color-text-muted)' 
            }} 
          />
          <input
            type="text"
            placeholder="بحث في القائمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              borderRadius: '12px',
              border: '1px solid var(--color-border-light)',
              background: 'var(--color-surface)',
              fontSize: '0.875rem',
              color: 'var(--color-text)',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-light)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Navigation Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {filteredNavGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '1.5rem' }}>
            <span style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
              paddingLeft: '0.75rem',
            }}>
              {group.label}
            </span>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {group.items.map(({ path, label, icon: Icon, color, exact }) => {
                const active = isActive(path, exact);
                return (
                  <li key={path} style={{ marginBottom: '0.5rem' }}>
                    <NavLink
                      to={path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: active ? '#fff' : 'var(--color-text)',
                        background: active 
                          ? `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` 
                          : 'transparent',
                        fontWeight: active ? 600 : 500,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        boxShadow: active ? `0 4px 16px ${color}40` : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'var(--color-surface)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;