
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useProviderRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'provider' && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate, location.pathname]);
};
