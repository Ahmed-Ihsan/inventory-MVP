import React, { lazy, Suspense, useState } from 'react';
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
import Loading from './components/common/Loading';
import './styles/global.css';

// Lazy load page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Purchases = lazy(() => import('./pages/Purchases'));
const InstallmentSales = lazy(() => import('./pages/InstallmentSales'));
const InstallmentSalesList = lazy(() => import('./pages/InstallmentSalesList'));
const SalesInvoice = lazy(() => import('./pages/SalesInvoice'));
const QuickInvoice = lazy(() => import('./pages/QuickInvoice'));
const ItemCatalog = lazy(() => import('./pages/ItemCatalog'));
const AddItem = lazy(() => import('./pages/AddItem'));
const EditItem = lazy(() => import('./pages/EditItem'));
const StockTracking = lazy(() => import('./pages/StockTracking'));
const Stock = lazy(() => import('./pages/Stock'));
const StockLevels = lazy(() => import('./pages/StockLevels'));
const StockMovements = lazy(() => import('./pages/StockMovements'));
const Scanning = lazy(() => import('./pages/Scanning'));
const Categories = lazy(() => import('./pages/Categories'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Login = lazy(() => import('./pages/Login'));
const QuickEntryWizard = lazy(() => import('./components/quickentry/QuickEntryWizard'));

function App() {
  const { i18n } = useTranslation();
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  
  const handleOpenQuickEntry = () => setQuickEntryOpen(true);
  const handleCloseQuickEntry = () => setQuickEntryOpen(false);

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
          <div className="app" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <Header onOpenQuickEntry={handleOpenQuickEntry} />
            <div className="main">
              <Sidebar />
              <div className="content">
                <Breadcrumbs />
                  <Suspense fallback={<Loading />}>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
                      <Route path="/sales-invoice" element={<ProtectedRoute><SalesInvoice /></ProtectedRoute>} />
                      <Route path="/quick-invoice" element={<ProtectedRoute><QuickInvoice /></ProtectedRoute>} />
                      <Route path="/installment-sales" element={<ProtectedRoute><InstallmentSales /></ProtectedRoute>} />
                      <Route path="/installment-sales/list" element={<ProtectedRoute><InstallmentSalesList /></ProtectedRoute>} />
                      <Route path="/items" element={<ProtectedRoute><ItemCatalog /></ProtectedRoute>} />
                      <Route path="/items/new" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
                      <Route path="/items/edit/:id" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
                      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                      <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
                      <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                      <Route path="/scan" element={<ProtectedRoute><Scanning /></ProtectedRoute>} />
                    </Routes>
                  </Suspense>
              </div>
            </div>
            <Footer />
            <QuickEntryWizard 
              isOpen={quickEntryOpen} 
              onClose={handleCloseQuickEntry} 
              onOpen={handleOpenQuickEntry} 
            />
          </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
