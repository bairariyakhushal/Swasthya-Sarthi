import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './router/AppRoutes';
import { initializeAuth, logout } from './redux/slices/authSlice';
import { setLogoutCallback } from './api/axiosInstance';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for previous 401 errors
    const lastError = sessionStorage.getItem('last401Error');
    if (lastError) {
      console.warn('Previous 401 error found:', JSON.parse(lastError));
    }
    
    // Initialize auth state from localStorage
    dispatch(initializeAuth());
    
    console.log('App initialized');
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('User exists:', !!localStorage.getItem('user'));
    
    // Set logout callback for axios interceptor (silent logout)
    setLogoutCallback(() => {
      dispatch(logout({ showToast: false }));
    });
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
