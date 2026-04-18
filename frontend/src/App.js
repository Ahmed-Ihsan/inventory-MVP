import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Breadcrumbs from './components/common/Breadcrumbs';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Purchases from './pages/Purchases';
import ItemCatalog from './pages/ItemCatalog';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import StockTracking from './pages/StockTracking';
import Scanning from './pages/Scanning';
import Categories from './pages/Categories';
import Login from './pages/Login';
import './styles/global.css';

function App() {
  const { i18n } = useTranslation();
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
          <div className="app" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} data-theme={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <Header />
            <div className="main">
              <Sidebar />
              <div className="content">
                <Breadcrumbs />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                    <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
                    <Route path="/items" element={<ProtectedRoute><ItemCatalog /></ProtectedRoute>} />
                    <Route path="/items/new" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
                    <Route path="/items/edit/:id" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
                    <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                    <Route path="/stock" element={<ProtectedRoute><StockTracking /></ProtectedRoute>} />
                    <Route path="/scan" element={<ProtectedRoute><Scanning /></ProtectedRoute>} />
                  </Routes>
              </div>
            </div>
            <Footer />
          </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
