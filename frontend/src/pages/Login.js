import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FaBoxes, FaChartLine, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';

const FEATURES = [
  { icon: FaBoxes, text: 'auth.manageInventory' },
  { icon: FaChartLine, text: 'auth.trackSales' },
  { icon: FaMoneyBillWave, text: 'auth.trackDebts' },
  { icon: FaShieldAlt, text: 'auth.secureData' },
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
    <div className="min-h-dvh flex">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-primary text-primary-foreground p-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 font-semibold text-sm">
            IM
          </div>
          <div>
            <p className="font-semibold text-base leading-tight">{t('auth.brandName')}</p>
            <p className="text-xs text-primary-foreground/70">{t('auth.brandSubtitle')}</p>
          </div>
        </div>

        <h1 className="text-4xl font-bold leading-tight text-balance mb-4">
          {t('auth.heroTitle')}
          <br />
          <span className="text-primary-foreground/70">{t('auth.heroSubtitle')}</span>
        </h1>
        <p className="text-primary-foreground/90 text-sm text-pretty mb-10 max-w-sm">
          {t('auth.heroDescription')}
        </p>

        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-foreground/10">
                <Icon size={14} aria-hidden="true" />
              </div>
              <span className="text-sm text-primary-foreground/95">{t(text)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-border/50 shadow-sm">
          <CardHeader className="text-center space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm mx-auto">
              IM
            </div>
            <CardTitle className="text-xl">
              {isRegistering ? t('auth.register') : t('auth.login')}
            </CardTitle>
            <CardDescription className="text-sm">
              {isRegistering ? t('auth.createAccountSubtitle') : t('auth.welcomeBackSubtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isRegistering ? (
              <RegisterForm onRegister={handleRegister} />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )}
          </CardContent>

          <CardFooter className="flex justify-center gap-1 text-sm text-muted-foreground">
            <span>{isRegistering ? t('auth.haveAccount') : t('auth.noAccount')}</span>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto font-medium"
              onClick={() => setIsRegistering((v) => !v)}
            >
              {isRegistering ? t('auth.alreadyHaveAccount') : t('auth.needAccount')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
