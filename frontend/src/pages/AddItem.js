import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ItemForm from '../components/items/ItemForm';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';

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
    <div>
      <h2>{t('items.addNewItem')}</h2>
      <ItemForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default AddItem;