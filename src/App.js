import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { getCurrentUser } from './store/slices/authSlice';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Orders from './pages/Orders';
// import OrderDetails from './pages/OrderDetails';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';

// Route persistence component
const RouteListener = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/login') {
      localStorage.setItem('lastRoute', location.pathname);
    }
  }, [location]);

  return null;
};

// App wrapper with Redux Provider
const AppWrapper = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

// Main App content
const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const controller = new AbortController();
    
    if (token) {
      dispatch(getCurrentUser());
    }
    
    return () => {
      controller.abort(); // Cancel pending requests on unmount
    };
  }, [dispatch]);

  // Protected Route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    // Always show loading when we don't have user data yet
    if (loading || (isAuthenticated && !user)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    if (adminOnly && user?.role !== 'admin') {
      return <Navigate to="/products" />;
    }
    
    return children;
  };

  // Show loading state when authenticated but user data is not loaded yet
  if (loading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <RouteListener />
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/products" /> : <Login />
          } />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly={true}>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly={true}>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly={true}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default AppWrapper;
