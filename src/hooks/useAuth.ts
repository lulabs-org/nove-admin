import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext.types';

/**
 * Custom hook to access authentication context
 * @throws Error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
