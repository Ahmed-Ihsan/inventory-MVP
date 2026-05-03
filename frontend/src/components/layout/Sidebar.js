import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
} from 'react-icons/fa';

const NAV_GROUPS = [
  {
    label: 'الرئيسية',
    items: [
      { path: '/',          label: 'لوحة التحكم',  icon: FaChartPie,      color: '#00b4d8', exact: true },
    ],
  },
  {
    label: 'المالية',
    items: [
      { path: '/installment-sales/list', label: 'بيع بالأقساط', icon: FaCalendarAlt,    color: '#667eea' },
      { path: '/payments',        label: 'المدفوعات',      icon: FaMoneyBillWave, color: '#2ecc71' },
      { path: '/purchases',       label: 'المشتريات',      icon: FaShoppingCart,  color: '#f39c12' },
      { path: '/sales-invoice',  label: 'فاتورة بيع',     icon: FaReceipt,       color: '#9b59b6' },
    ],
  },
  {
    label: 'المخزون',
    items: [
      { path: '/items',     label: 'كتالوج الأصناف', icon: FaBoxes,       color: '#9b59b6' },
      { path: '/categories',label: 'الفئات',        icon: FaTags,          color: '#e74c3c' },
      { path: '/stock',     label: 'تتبع المخزون',  icon: FaWarehouse,     color: '#1abc9c' },
      { path: '/scan',      label: 'المسح الضوئي',  icon: FaBarcode,       color: '#3498db' },
    ],
  },
];

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="sidebar-group">
          <span className="sidebar-group-label">{group.label}</span>
          <ul>
            {group.items.map(({ path, label, icon: Icon, color, exact }) => {
              const active = isActive(path, exact);
              return (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={active ? 'active' : ''}
                    title={label}
                    style={{ '--item-color': color }}
                  >
                    <span
                      className="sidebar-icon"
                      style={active
                        ? { background: color + '20', color }
                        : {}}
                    >
                      <Icon />
                    </span>
                    <span className="sidebar-label">{label}</span>
                    {active && <span className="sidebar-active-dot" />}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;