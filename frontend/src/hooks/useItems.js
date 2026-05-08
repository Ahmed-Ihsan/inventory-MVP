import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getItems();
      setItems(data);
    } catch (error) {
      addToast(`Error fetching items: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const addItem = useCallback(
    async (item) => {
      try {
        await apiService.createItem(item);
        fetchItems(); // Refresh list
      } catch (error) {
        addToast(`Error adding item: ${error.message}`, 'error');
      }
    },
    [fetchItems, addToast]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, addItem, refetch: fetchItems };
};
