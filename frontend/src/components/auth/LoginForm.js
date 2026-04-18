import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../common/FormField';
import Button from '../common/Button';
import apiService from '../../services/apiService';

const LoginForm = ({ onLogin }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiService.login(formData.username, formData.password);
      onLogin(data);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
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
        label={t('auth.password')}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        autoComplete="current-password"
      />

      <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
        {t('auth.loginButton')}
      </Button>
    </form>
  );
};

export default LoginForm;