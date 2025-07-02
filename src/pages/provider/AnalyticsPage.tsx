
import React from 'react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { useNavigate } from 'react-router-dom';

const AnalyticsPage = () => {
  const navigate = useNavigate();

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
