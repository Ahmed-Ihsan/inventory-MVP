import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';
import { useToast } from '../../context/ToastContext';

const RegisterForm = ({ onRegister }) => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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
    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
    else if (formData.password.length < 6) newErrors.password = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      const data = await apiService.register(formData);
      addToast('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.', 'success');
      onRegister(data);
    } catch (error) {
      addToast('فشل إنشاء الحساب: ' + error.message, 'error');
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
        label={t('auth.email')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        clearable
        autoComplete="email"
        placeholder="example@email.com"
      />

      <FormField
        label={t('auth.password')}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
        autoComplete="new-password"
        placeholder="6 أحرف على الأقل"
        help="يجب أن تحتوي على 6 أحرف على الأقل"
      />

      <Button type="submit" className="btn-accent" fullWidth loading={isSubmitting} style={{ marginTop: '1rem' }}>
        {t('auth.registerButton')}
      </Button>
    </form>
  );
};

export default RegisterForm;