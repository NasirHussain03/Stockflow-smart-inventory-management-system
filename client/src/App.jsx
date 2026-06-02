import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material';
import { getTheme } from './theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Track from './pages/Track';

// Global notification context
const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

// Global authentication context
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('theme_mode') || 'light');
  
  // Track authenticated user profile (saving role info)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!user;
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme_mode', next);
      return next;
    });
  };

  const handleLogin = (userProfile) => {
    setUser(userProfile);
    localStorage.setItem('user_profile', JSON.stringify(userProfile));
    showNotification(`Welcome back, ${userProfile.full_name}! Login role: ${userProfile.role}`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_profile');
    showNotification('Logged out successfully!', 'info');
  };

  const showNotification = (message, severity = 'info') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const theme = getTheme(mode);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <AuthContext.Provider value={{ user, handleLogin, handleLogout }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            {!isAuthenticated ? (
              <Routes>
                <Route path="/login" element={<Login mode={mode} toggleMode={toggleMode} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            ) : (
              <Layout mode={mode} toggleMode={toggleMode}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/track" element={<Track />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            )}
          </BrowserRouter>

          <Snackbar 
            open={toast.open} 
            autoHideDuration={4000} 
            onClose={handleCloseToast}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseToast} 
              severity={toast.severity} 
              variant="filled"
              sx={{ width: '100%', borderRadius: 2 }}
            >
              {toast.message}
            </Alert>
          </Snackbar>
        </ThemeProvider>
      </AuthContext.Provider>
    </NotificationContext.Provider>
  );
}

export default App;
