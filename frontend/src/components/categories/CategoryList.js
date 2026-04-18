import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Table from '../common/Table';
import Button from '../common/Button';
import Input from '../common/Input';
import Loading from '../common/Loading';
import EmptyState from '../common/EmptyState';
import { useCategories } from '../../hooks/useCategories';

const CategoryList = ({ onEdit, onAdd, onDelete }) => {
  const { t } = useTranslation();
  const { categories, loading } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const columns = [
    { header: t('categories.name'), accessor: 'name' },
    { header: t('categories.description'), accessor: 'description' },
    {
      header: t('common.actions'),
      accessor: 'actions',
      render: (category) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={() => onEdit(category)}>{t('common.edit')}</Button>
          <Button className="btn-danger" onClick={() => onDelete(category.id)}>{t('common.delete')}</Button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{t('categories.management')}</h2>
        <Button onClick={onAdd}>{t('categories.addNew')}</Button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <Input
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCategories.length === 0 ? (
        <EmptyState
          type="no-results"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <Table columns={columns} data={filteredCategories} />
      )}
    </div>
  );
};

export default CategoryList;