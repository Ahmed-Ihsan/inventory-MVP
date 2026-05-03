import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';
import { useToast } from '../../context/ToastContext';

const LoginForm = ({ onLogin }) => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'اسم المستخدم مطلوب';
    if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      const data = await apiService.login(formData.username, formData.password);
      onLogin(data);
    } catch (error) {
      addToast('فشل تسجيل الدخول: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        label={t('auth.username')}
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        required
        clearable
        autoComplete="username"
        placeholder="أدخل اسم المستخدم"
      />

      <FormField
        label={t('auth.password')}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
        autoComplete="current-password"
        placeholder="أدخل كلمة المرور"
      />

      <Button type="submit" className="btn-accent" fullWidth loading={isSubmitting} style={{ marginTop: '1rem' }}>
        {t('auth.loginButton')}
      </Button>
    </form>
  );
};

export default LoginForm;