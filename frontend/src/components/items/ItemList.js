import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Table from '../common/Table';
import Button from '../common/Button';
import Input from '../common/Input';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import { useItems } from '../../hooks/useItems';

const ItemList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, loading } = useItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [items, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { header: t('items.name'), accessor: 'name', sortable: true },
    { header: t('items.sku'), accessor: 'sku', sortable: true },
    { header: t('items.price'), accessor: 'price', sortable: true },
    { header: t('items.stock'), accessor: 'current_stock', sortable: true },
    {
      header: t('common.actions'),
      accessor: 'actions',
      render: (item) => (
        <Button onClick={() => navigate(`/items/edit/${item.id}`)}>{t('common.edit')}</Button>
      ),
    },
  ];

  const handleSort = (accessor) => {
    if (sortBy === accessor) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(accessor);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddItem = () => {
    navigate('/items/new');
  };

  if (loading) return <Loading />;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-foreground">{t('items.catalog')}</h2>
        <Button onClick={handleAddItem} className="w-full sm:w-auto">{t('items.addNewItem')}</Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {paginatedItems.length === 0 ? (
        <EmptyState type="no-results" onAction={() => setSearchTerm('')} />
      ) : (
        <>
          {/* Scrollable table wrapper for mobile */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '0.75rem' }}>
            <Table
              columns={columns.map((col) => ({
                ...col,
                header: (
                  <button
                    style={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontWeight: 'bold',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: 'var(--color-text)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => col.sortable && handleSort(col.accessor)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {col.header}
                    {sortBy === col.accessor && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                ),
              }))}
              data={paginatedItems}
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ItemList;
