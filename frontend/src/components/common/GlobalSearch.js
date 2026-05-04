import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBox, FaUser, FaFileInvoice, FaShoppingCart } from 'react-icons/fa';
import apiService from '../../services/apiService';

const GlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Parent component handles opening
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const searchItems = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const [items, sales, purchases] = await Promise.all([
          apiService.getItems({ search: searchTerm }),
          apiService.getInstallmentSales({ search: searchTerm }),
          apiService.getPurchases({ search: searchTerm }),
        ]);

        const formattedResults = [
          ...items.map(item => ({
            type: 'item',
            icon: FaBox,
            label: item.name,
            sublabel: `SKU: ${item.sku || 'N/A'} | ${item.current_stock} في المخزون`,
            path: `/items/edit/${item.id}`,
            color: '#3b82f6',
          })),
          ...sales.map(sale => ({
            type: 'sale',
            icon: FaShoppingCart,
            label: sale.customer_name,
            sublabel: `${sale.total_amount.toLocaleString()} د.ع | ${sale.status}`,
            path: `/installment-sales/list`,
            color: '#667eea',
          })),
          ...purchases.map(purchase => ({
            type: 'purchase',
            icon: FaFileInvoice,
            label: purchase.supplier_name,
            sublabel: `${purchase.total_amount.toLocaleString()} د.ع | ${purchase.status}`,
            path: `/purchases`,
            color: '#10b981',
          })),
        ];

        setResults(formattedResults.slice(0, 10));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchItems, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleResultClick = (result) => {
    navigate(result.path);
    onClose();
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh', zIndex: 2000 }}>
      <div style={{ background: 'var(--color-card-background)', borderRadius: '20px', width: '100%', maxWidth: 600, maxHeight: '70vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--color-border-light)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FaSearch size={20} style={{ color: 'var(--color-text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="بحث عن أصناف، عملاء، مبيعات... (Ctrl+K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.1rem', color: 'var(--color-text)', outline: 'none' }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>✕</button>
        </div>

        <div style={{ padding: '1rem', maxHeight: 'calc(70vh - 80px)', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>جاري البحث...</div>
          ) : results.length === 0 && searchTerm.trim() ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>لا توجد نتائج</div>
          ) : results.length === 0 && !searchTerm.trim() ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              <p style={{ marginBottom: '1rem' }}>ابحث عن:</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.5rem 1rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>أصناف</span>
                <span style={{ padding: '0.5rem 1rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>عملاء</span>
                <span style={{ padding: '0.5rem 1rem', background: 'var(--color-surface)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>مبيعات</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'start', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-border-light)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${result.color}20`, color: result.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <result.icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>{result.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{result.sublabel}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
