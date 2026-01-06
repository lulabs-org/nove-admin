import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Root application component
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 8,
          },
        }}
      >
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
