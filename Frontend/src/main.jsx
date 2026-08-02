import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <App />
              <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
            </BrowserRouter>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
