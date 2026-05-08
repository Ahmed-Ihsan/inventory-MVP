import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../components/common/FormField';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useCategories } from '../hooks/useCategories';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FaTags, FaPlus, FaEdit, FaTrash, FaLayerGroup, FaPrint } from 'react-icons/fa';
import Loading from '../components/common/Loading';
import { cn } from '../lib/utils';
import apiService from '../services/apiService';

const Categories = () => {
  const { t } = useTranslation();
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nameError, setNameError] = useState('');
  const [itemCounts, setItemCounts] = useState({});

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setIsEditing(false);
    setNameError('');
  };

  const handleAdd = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
    setIsEditing(true);
    setNameError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setNameError(t('categories.categoryRequired'));
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await addCategory(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => resetForm();

  const handlePrintCategories = () => {
    window.print();
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteCategory(confirmId);
    } finally {
      setIsDeleting(false);
      setConfirmId(null);
    }
  };

  const CAT_ICON_CLASSES = [
    'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
    'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
    'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg text-2xl">
              <FaTags />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                {t('categories.management')}
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium">
                {categories.length} {t('categories.registeredCategories', { defaultValue: 'categories' })}
              </p>
            </div>
          </div>
          {!isEditing && (
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={handlePrintCategories}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-semibold shadow-lg backdrop-blur-sm"
              >
                <FaPrint size={12} className="sm:size-13 mr-2" />
                <span className="hidden sm:inline">{t('common.print')}</span>
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                className="bg-white text-purple-600 hover:bg-white/90 font-semibold shadow-lg"
              >
                <FaPlus size={12} className="sm:size-13 mr-2" />
                {t('categories.addNew')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
          <Card className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  إجمالي الفئات
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20">
                  <FaLayerGroup size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
                {categories.length}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">فئات مسجلة</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  مع وصف
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                  <FaTags size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
                {categories.filter((c) => c.description).length}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">موصوفة بالتفصيل</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="relative p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  بدون وصف
                </span>
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20">
                  <FaTags size={14} className="sm:size-18" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400 drop-shadow-sm">
                {categories.filter((c) => !c.description).length}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1">تحتاج إكمال</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Form */}
      {isEditing && (
        <Card className="border-border/60 shadow-lg shadow-black/5">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              {editingId ? <FaTags size={12} className="sm:size-14" aria-hidden="true" /> : <FaPlus size={12} className="sm:size-14" aria-hidden="true" />}
              {editingId ? t('categories.editCategory') : t('categories.addCategory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <FormField
                  label={t('categories.name')}
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setNameError('');
                  }}
                  error={nameError}
                  required
                  clearable
                  placeholder="أدخل اسم الفئة"
                />
                <FormField
                  label={t('categories.description')}
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف اختياري للفئة"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving} className="text-xs sm:text-sm">
                  {t('common.cancel')}
                </Button>
                <Button type="submit" loading={isSaving} className="text-xs sm:text-sm">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories list */}
      <Card className="border-border/60 shadow-lg shadow-black/5">
        <CardContent className="pt-4 sm:pt-6">
          {loading ? (
            <Loading />
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 sm:gap-4 py-12 sm:py-16 text-center">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-muted text-muted-foreground text-xl sm:text-2xl">
                <FaTags aria-hidden="true" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground text-balance">{t('categories.noCategoriesYet')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-pretty">{t('categories.addFirstCategory')}</p>
              <Button size="sm" onClick={handleAdd} className="text-xs sm:text-sm">
                <FaPlus size={11} className="sm:size-12 mr-1" aria-hidden="true" /> {t('categories.addNew')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((category, i) => (
                <div
                  key={category.id || `category-${category.name}-${i}`}
                  className="group flex items-center gap-2 sm:gap-3 rounded-xl border border-border/60 p-3 sm:p-4 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
                >
                  <div className={cn('flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl text-sm sm:text-lg font-bold ring-1 ring-border/50', CAT_ICON_CLASSES[i % CAT_ICON_CLASSES.length])}>
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{category.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
                      {category.description || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-purple-500/10 hover:text-purple-600"
                      onClick={() => handleEdit(category)}
                      aria-label={`${t('common.edit')} ${category.name}`}
                    >
                      <FaEdit size={12} className="sm:size-13" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setConfirmId(category.id)}
                      aria-label={`${t('common.delete')} ${category.name}`}
                    >
                      <FaTrash size={12} className="sm:size-13" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!confirmId}
        title={t('categories.deleteCategory')}
        message={t('categories.deleteCategoryMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
};

export default Categories;
