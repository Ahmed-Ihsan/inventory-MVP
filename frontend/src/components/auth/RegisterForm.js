import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';

const RegisterForm = ({ onRegister }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiService.register(formData);
      onRegister(data);
    } catch (error) {
      console.error('Register error:', error);
      alert('Registration failed: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label={t('auth.username')}
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        required
        autoComplete="username"
      />

      <FormField
        label={t('auth.email')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        autoComplete="email"
      />

      <FormField
        label={t('auth.password')}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        autoComplete="new-password"
      />

      <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
        {t('auth.registerButton')}
      </Button>
    </form>
  );
};

export default RegisterForm;