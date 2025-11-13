
import React, { useEffect } from 'react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Wait for authentication check to complete before redirecting
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'provider')) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return null;
  }

  // Redirect if not authenticated or not a provider (after loading completes)
  if (!isAuthenticated || user?.role !== 'provider') {
    return null;
  }

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
      <AnalyticsDashboard onBack={handleBack} />
    </div>
  );
};

export default AnalyticsPage;
