import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon, FaSearch, FaBolt } from 'react-icons/fa';
import { FiCommand } from 'react-icons/fi';
import GlobalSearch from '../common/GlobalSearch';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const Header = ({ onOpenQuickEntry }) => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isRtl = i18n.language === 'ar';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center',
        'border-b border-border/60',
        'bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75',
        'px-5',
        'transition-shadow duration-200',
        scrolled && 'shadow-[0_1px_12px_rgba(0,0,0,0.06)]'
      )}
    >
      <div className="flex w-full items-center justify-between gap-4">

        {/* ── Brand mark ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold tracking-tight text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}
          >
            IM
          </div>
          <span className="hidden sm:block text-sm font-semibold tracking-tight text-foreground">
            Inventory
          </span>
          <span className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-muted-foreground/60 mt-px">
            <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
            {isRtl ? 'متصل' : 'Live'}
          </span>
        </div>

        {/* ── Center: Search bar ── */}
        <button
          onClick={() => setSearchOpen(true)}
          className={cn(
            'hidden sm:flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm',
            'bg-muted/50 hover:bg-muted text-muted-foreground',
            'border border-border/60 hover:border-border',
            'transition-all duration-150 cursor-pointer',
            'min-w-[200px] max-w-[320px] flex-1'
          )}
          aria-label={t('common.search')}
          id="global-search-trigger"
        >
          <FaSearch size={12} className="shrink-0 opacity-60" />
          <span className="flex-1 text-left text-xs opacity-70">
            {isRtl ? 'بحث...' : 'Search anything...'}
          </span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 h-5 rounded border border-border bg-background px-1.5 font-mono text-[9px] text-muted-foreground/60">
            <FiCommand size={9} />K
          </kbd>
        </button>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1">
          {/* Mobile: icon-only search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
            aria-label={t('common.search')}
            id="mobile-search-trigger"
          >
            <FaSearch size={14} />
          </button>

          {/* Quick entry — icon-only on mobile, text on md+ */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenQuickEntry}
            className="flex gap-1.5 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
            id="quick-entry-btn"
            aria-label={t('quickEntry.title', { defaultValue: 'Quick entry' })}
          >
            <FaBolt size={11} className="text-amber-400" />
            <span className="hidden md:inline">
              {isRtl ? 'إدخال سريع' : 'Quick Entry'}
            </span>
          </Button>

          <div className="h-4 w-px bg-border/60 hidden sm:block mx-0.5" />

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')}
            className="h-8 w-8 text-[11px] font-bold text-muted-foreground hover:text-foreground"
            aria-label={isRtl ? 'Switch to English' : 'التبديل إلى العربية'}
            id="lang-toggle-btn"
          >
            {isRtl ? 'EN' : 'ع'}
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle-btn"
          >
            {isDark
              ? <FaSun size={13} className="text-amber-400" />
              : <FaMoon size={13} />
            }
          </Button>
        </div>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;

