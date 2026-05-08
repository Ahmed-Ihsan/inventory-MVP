import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ItemForm from '../components/items/ItemForm';
import Card from '../components/common/Card';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { FaPlus } from 'react-icons/fa';
import { Card as ShadcnCard, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';

const AddItem = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const handleSave = async (itemData) => {
    try {
      await apiService.createItem(itemData);
      addToast(t('items.itemAdded'), 'success');
      navigate('/items');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleCancel = () => {
    navigate('/items');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex items-center gap-3 sm:gap-5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
            <FaPlus size={24} className="sm:size-26 md:size-28" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
              {t('items.addNewItem')}
            </h1>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              أضف صنفاً جديداً إلى كتالوج مخزونك
            </p>
          </div>
        </div>
      </div>

      <ShadcnCard className="border-border/60 shadow-lg shadow-black/5 max-w-2xl mx-auto">
        <CardContent className="p-4 sm:p-6 md:p-8">
          <ItemForm onSave={handleSave} onCancel={handleCancel} />
        </CardContent>
      </ShadcnCard>
    </div>
  );
};

export default AddItem;
