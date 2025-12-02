import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import wellbeingService from '../services/wellbeingService';
import { WellbeingDashboard as WellbeingDashboardType, WellbeingCheckIn } from '../types/wellbeing';
import WellbeingCheckInForm from './WellbeingCheckInForm';
import WellbeingTrendsChart from './WellbeingTrendsChart';
import SupportConnectionsPanel from './SupportConnectionsPanel';
import MentalHealthResourcesPanel from './MentalHealthResourcesPanel';
import CrisisResourcesPanel from './CrisisResourcesPanel';

const WellbeingDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<WellbeingDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'checkin' | 'support' | 'resources'>('overview');
  const [showCrisisResources, setShowCrisisResources] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await wellbeingService.getDashboard(30);
      setDashboard(data);
      
      // Show crisis resources if user is at high risk
      if (data.riskAssessment.currentRisk === 'high' || data.riskAssessment.currentRisk === 'critical') {
        setShowCrisisResources(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wellbeing dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInSubmitted = (checkIn: WellbeingCheckIn) => {
    // Refresh dashboard after new check-in
    loadDashboard();
    setActiveTab('overview');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 text-center mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const getRiskLevelDisplay = (risk: string) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
      unknown: 'text-gray-600 bg-gray-100'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[risk as keyof typeof colors] || colors.unknown}`}>
        {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
      </span>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-600">↗️ Improving</span>;
      case 'declining':
        return <span className="text-red-600">↘️ Declining</span>;
      default:
        return <span className="text-gray-600">→ Stable</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Crisis Resources Alert */}
      {showCrisisResources && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Immediate Support Available
              </h3>
              <p className="mt-1 text-sm text-red-700">
                We've noticed you might be going through a difficult time. Help is available 24/7.
              </p>
              <div className="mt-2">
                <button
                  onClick={() => setActiveTab('resources')}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  View Crisis Resources
                </button>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowCrisisResources(false)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Wellbeing Dashboard</h1>
            <p className="mt-2 text-gray-600">Track your mental health and connect with support</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'checkin', name: 'Check-in', icon: '✅' },
              { id: 'support', name: 'Support Network', icon: '🤝' },
              { id: 'resources', name: 'Resources', icon: '📚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Risk Assessment Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Wellbeing Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                  {getRiskLevelDisplay(dashboard.riskAssessment.currentRisk)}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Trend</p>
                  {getTrendIcon(dashboard.riskAssessment.riskTrend)}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Last Check-in</p>
                  <p className="text-sm font-medium">
                    {new Date(dashboard.riskAssessment.lastCheckIn).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Trends Chart */}
            <WellbeingTrendsChart trends={dashboard.trends} />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-600">Total Check-ins</h3>
                <p className="text-2xl font-bold text-blue-600">{dashboard.recentCheckIns.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-600">Support Connections</h3>
                <p className="text-2xl font-bold text-green-600">{dashboard.supportConnections.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-600">Available Resources</h3>
                <p className="text-2xl font-bold text-purple-600">{dashboard.recommendedResources.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-600">Days Tracked</h3>
                <p className="text-2xl font-bold text-orange-600">{dashboard.trends.dates.length}</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'checkin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <WellbeingCheckInForm onSubmit={handleCheckInSubmitted} />
          </motion.div>
        )}

        {activeTab === 'support' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SupportConnectionsPanel connections={dashboard.supportConnections} />
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {showCrisisResources && <CrisisResourcesPanel />}
            <MentalHealthResourcesPanel resources={dashboard.recommendedResources} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WellbeingDashboard;