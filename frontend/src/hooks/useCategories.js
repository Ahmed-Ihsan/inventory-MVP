import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { useToast } from '../context/ToastContext';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      addToast(`Error fetching categories: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category) => {
    try {
      await apiService.createCategory(category);
      fetchCategories(); // Refresh list
    } catch (error) {
      addToast(`Error adding category: ${error.message}`, 'error');
    }
  };

  const updateCategory = async (id, category) => {
    try {
      await apiService.updateCategory(id, category);
      fetchCategories(); // Refresh list
    } catch (error) {
      addToast(`Error updating category: ${error.message}`, 'error');
    }
  };

  const deleteCategory = async (id) => {
    try {
      await apiService.deleteCategory(id);
      fetchCategories(); // Refresh list
    } catch (error) {
      addToast(`Error deleting category: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, addCategory, updateCategory, deleteCategory, refetch: fetchCategories };
};