import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (data) => {
    // Store token and redirect
    login(data.access_token);
    navigate('/');
  };

  const handleRegister = (data) => {
    // Redirect to login after successful registration
    setIsRegistering(false);
    alert('Registration successful! Please log in.');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-background)' }}>
      <Card style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {isRegistering ? t('auth.register') : t('auth.login')}
        </h1>
        {isRegistering ? (
          <RegisterForm onRegister={handleRegister} />
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Button
            className="btn-secondary"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? t('auth.alreadyHaveAccount') : t('auth.needAccount')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;