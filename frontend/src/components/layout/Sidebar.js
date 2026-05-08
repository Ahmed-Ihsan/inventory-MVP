import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaChartPie,
  FaShoppingCart,
  FaReceipt,
  FaBoxes,
  FaTags,
  FaWarehouse,
  FaCalendarAlt,
  FaBell,
  FaQrcode,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { cn } from '../../lib/utils';

const NAV_GROUPS = [
  {
    labelKey: 'nav.inventory',
    labelFallback: 'Inventory',
    items: [
      { path: '/', labelKey: 'nav.dashboard', labelFallback: 'Dashboard', icon: FaChartPie, exact: true, color: '#6366f1' },
      { path: '/items', labelKey: 'nav.items', labelFallback: 'Items', icon: FaBoxes, color: '#0ea5e9' },
      { path: '/categories', labelKey: 'nav.categories', labelFallback: 'Categories', icon: FaTags, color: '#8b5cf6' },
      { path: '/stock', labelKey: 'nav.stock', labelFallback: 'Stock', icon: FaWarehouse, color: '#10b981' },
      { path: '/alerts', labelKey: 'nav.alerts', labelFallback: 'Alerts', icon: FaBell, color: '#f59e0b' },
    ],
  },
  {
    labelKey: 'nav.finance',
    labelFallback: 'Finance',
    items: [
      { path: '/installment-sales/list', labelKey: 'nav.installments', labelFallback: 'Installments', icon: FaCalendarAlt, color: '#ec4899' },
      { path: '/purchases', labelKey: 'nav.purchases', labelFallback: 'Purchases', icon: FaShoppingCart, color: '#f97316' },
      { path: '/sales-invoice', labelKey: 'nav.salesInvoice', labelFallback: 'Sales Invoice', icon: FaReceipt, color: '#14b8a6' },
    ],
  },
  {
    labelKey: 'nav.other',
    labelFallback: 'Other',
    items: [
      { path: '/notifications', labelKey: 'nav.notifications', labelFallback: 'Notifications', icon: FaBell, color: '#6366f1' },
      { path: '/scan', labelKey: 'nav.scan', labelFallback: 'Scan', icon: FaQrcode, color: '#10b981' },
    ],
  },
];

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRtl = i18n.language === 'ar';

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const label = t(item.labelKey, { defaultValue: item.labelFallback });
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    }),
  })).filter((group) => group.items.length > 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex flex-col shrink-0 border-r border-border/60',
          'bg-background sticky top-14 h-[calc(100dvh-3.5rem)] overflow-hidden',
          'w-[240px] transition-transform duration-300 ease-in-out',
          'fixed left-0 top-14 z-50 lg:relative lg:z-auto',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* ── Search input ── */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <svg
              className="absolute top-1/2 -translate-y-1/2 left-2.5 text-muted-foreground/50 pointer-events-none"
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder={isRtl ? 'بحث في القائمة...' : 'Filter...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full h-8 pl-8 pr-3 rounded-md text-xs font-medium',
                'bg-muted/50 border border-transparent',
                'text-foreground placeholder:text-muted-foreground/50',
                'focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30 focus:bg-background',
                'transition-all duration-150'
              )}
              aria-label={t('common.search')}
              id="sidebar-search"
            />
          </div>
        </div>

        {/* ── Nav ── */}
        <nav
          className="flex-1 overflow-y-auto px-2 pb-4 space-y-4"
          aria-label="Main navigation"
        >
          {filteredGroups.map((group) => (
            <div key={group.labelKey}>
              {/* Group label */}
              <p className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50 select-none">
                {t(group.labelKey, { defaultValue: group.labelFallback })}
              </p>

              <ul className="space-y-0.5" role="list">
                {group.items.map(({ path, labelKey, labelFallback, icon: Icon, exact, color }) => {
                  const active = isActive(path, exact);
                  const label = t(labelKey, { defaultValue: labelFallback });

                  return (
                    <li key={path}>
                      <NavLink
                        to={path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-150 outline-none relative',
                          'focus-visible:ring-2 focus-visible:ring-primary/50',
                          active
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        )}
                        style={active ? { background: `${color}12` } : undefined}
                      >
                        {/* Active left border indicator — the Differentiation Anchor */}
                        {active && (
                          <span
                            className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full"
                            style={{
                              background: color,
                              boxShadow: `0 0 10px ${color}80`,
                            }}
                            aria-hidden="true"
                          />
                        )}

                        {/* Icon container */}
                        <span
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-150',
                            active
                              ? 'text-white'
                              : 'bg-muted/50 text-muted-foreground group-hover:bg-muted'
                          )}
                          style={active ? { background: color } : undefined}
                          aria-hidden="true"
                        >
                          <Icon size={13} />
                        </span>

                        <span className="truncate">{label}</span>

                        {/* Active dot */}
                        {active && (
                          <span
                            className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: color }}
                            aria-hidden="true"
                          />
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Footer / version tag ── */}
        <div className="px-4 py-2.5 border-t border-border/60">
          <p className="text-[10px] text-muted-foreground/40 font-medium select-none">
            v1.0 · Inventory Pro
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
