import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon, FaBars, FaTimes, FaGlobe } from 'react-icons/fa';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const iconBtnStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '10px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '1.125rem',
            letterSpacing: '-0.05em',
            backdropFilter: 'blur(4px)',
          }}>
            IM
          </div>
          <h1 style={{ margin: 0 }}>{t('nav.dashboard')}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
            style={iconBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <FaGlobe />
          </button>

          <button
            onClick={toggleTheme}
            style={iconBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <FaSun /> : <FaMoon />}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              ...iconBtnStyle,
              display: 'none',
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <nav className={menuOpen ? 'nav-open' : ''}>
            <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '1rem' }}></ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;