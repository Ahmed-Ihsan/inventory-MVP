import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ItemForm from '../components/items/ItemForm';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';
import Loading from '../components/common/Loading';

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
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{t('items.editItem')}</h2>
      <ItemForm item={item} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
};

export default EditItem;