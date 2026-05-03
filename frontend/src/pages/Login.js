import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { FaBoxes, FaChartLine, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';

const FEATURES = [
  { icon: FaBoxes,          text: 'إدارة المخزون والأصناف بكفاءة عالية' },
  { icon: FaChartLine,      text: 'تتبع المبيعات والمشتريات لحظةً بلحظة' },
  { icon: FaMoneyBillWave,  text: 'متابعة الديون والمدفوعات بدقة' },
  { icon: FaShieldAlt,      text: 'بيانات آمنة ومحمية بالكامل' },
];

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { addToast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = (data) => {
    login(data.access_token);
    navigate('/');
  };

  const handleRegister = () => {
    addToast('تم إنشاء الحساب! يمكنك تسجيل الدخول الآن.', 'success');
    setIsRegistering(false);
  };

  return (
    <div className="auth-page">
      {/* ── Brand panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-logo-wrap">
          <div className="auth-brand-logo-mark">IM</div>
          <div className="auth-brand-name">
            نظام إدارة المخزون
            <small>Inventory Management System</small>
          </div>
        </div>

        <h1 className="auth-brand-headline">
          أدِر مخزونك<br /><span>بكل سهولة</span>
        </h1>
        <p className="auth-brand-desc">
          منصة متكاملة لإدارة المخزون، المشتريات، والمدفوعات — مصممة لتوفير وقتك وتنظيم أعمالك.
        </p>

        <div className="auth-features-list">
          {FEATURES.map(({ icon: Icon, text }, i) => (
            <div className="auth-feature-item" key={i}>
              <div className="auth-feature-icon"><Icon /></div>
              <span className="auth-feature-text">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <div className="auth-form-logo">IM</div>
            <h2 className="auth-form-title">
              {isRegistering ? t('auth.register') : t('auth.login')}
            </h2>
            <p className="auth-form-subtitle">
              {isRegistering
                ? 'أنشئ حسابك للبدء في إدارة مخزونك'
                : 'مرحباً بك! سجّل دخولك للمتابعة'}
            </p>
          </div>

          {isRegistering
            ? <RegisterForm onRegister={handleRegister} />
            : <LoginForm onLogin={handleLogin} />
          }

          <div className="auth-form-footer">
            {isRegistering ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
            {' '}
            <button
              className="auth-toggle-btn"
              onClick={() => setIsRegistering((v) => !v)}
            >
              {isRegistering ? t('auth.alreadyHaveAccount') : t('auth.needAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;