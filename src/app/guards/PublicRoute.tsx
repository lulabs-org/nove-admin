import { useAuth } from '../../shared/hooks/useAuth';
import Spin from 'antd/es/spin';
import { Navigate } from 'react-router-dom';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
