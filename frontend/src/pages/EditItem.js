import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ItemForm from '../components/items/ItemForm';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import Loading from '../components/common/Loading';
import { FaEdit } from 'react-icons/fa';
import { Card as ShadcnCard, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const fetchedItem = await apiService.getItem(id);
        setItem(fetchedItem);
      } catch (err) {
        setError(err.message);
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, addToast]);

  const handleSave = async (itemData) => {
    try {
      await apiService.updateItem(id, itemData);
      addToast(t('items.itemUpdated'), 'success');
      navigate('/items');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleCancel = () => {
    navigate('/items');
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <Card
        style={{ textAlign: 'center', padding: '2rem sm:3rem', maxWidth: '500px', margin: '1rem sm:2rem auto' }}
      >
        <div style={{ fontSize: '2.5rem sm:fontSize: 3rem', marginBottom: '0.75rem sm:marginBottom: 1rem' }}>⚠️</div>
        <h3 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem' }} className="text-sm sm:text-base">Error Loading Item</h3>
        <p style={{ color: 'var(--color-text-muted)', margin: '0 0 1rem sm:margin-bottom: 1.5rem' }} className="text-xs sm:text-sm">{error}</p>
        <Button onClick={() => navigate('/items')} className="text-xs sm:text-sm">{t('common.cancel')}</Button>
      </Card>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex items-center gap-3 sm:gap-5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
            <FaEdit size={24} className="sm:size-26 md:size-28" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              {t('items.editItem')}
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              {item?.name}
            </p>
          </div>
        </div>
      </div>

      <ShadcnCard className="border-border/60 shadow-lg shadow-black/5 max-w-2xl mx-auto">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <ItemForm item={item} onSave={handleSave} onCancel={handleCancel} />
        </CardContent>
      </ShadcnCard>
    </div>
  );
};

export default EditItem;
