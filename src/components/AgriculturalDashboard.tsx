import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { agriculturalService } from '../services/agriculturalService';
import { DashboardData } from '../types/agriculture';
import WeatherWidget from './agricultural/WeatherWidget';
import CropHealthOverview from './agricultural/CropHealthOverview';
import MarketPricesWidget from './agricultural/MarketPricesWidget';
import RecommendationsPanel from './agricultural/RecommendationsPanel';
import FarmSummaryCards from './agricultural/FarmSummaryCards';
import CropAnalysisUpload from './agricultural/CropAnalysisUpload';
import MobileAgriculturalDashboard from './mobile/MobileAgriculturalDashboard';
import { useDeviceDetection } from '../utils/mobileDetection';

const AgriculturalDashboard: React.FC = () => {
  const deviceInfo = useDeviceDetection();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'crops' | 'market' | 'analysis'>('overview');

  useEffect(() => {
    if (!deviceInfo.isMobile) {
      loadDashboardData();
    }
  }, [deviceInfo.isMobile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await agriculturalService.getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCropAnalysisComplete = () => {
    // Refresh dashboard data after new analysis
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4"
        >
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Dashboard Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Use mobile-optimized version for mobile devices
  if (deviceInfo.isMobile) {
    return <MobileAgriculturalDashboard />;
  }

  if (!dashboardData) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏡' },
    { id: 'crops', label: 'Crop Health', icon: '🌱' },
    { id: 'market', label: 'Market Data', icon: '📈' },
    { id: 'analysis', label: 'Photo Analysis', icon: '📸' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {dashboardData.farm.name} Dashboard
          </h1>
          <p className="text-gray-600">
            {dashboardData.farm.location.address} • {dashboardData.farm.totalArea} hectares
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <FarmSummaryCards summary={dashboardData.summary} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WeatherWidget weather={dashboardData.weather} />
                <RecommendationsPanel recommendations={dashboardData.recommendations} />
              </div>

              <MarketPricesWidget
                prices={dashboardData.marketPrices}
                alerts={dashboardData.marketAlerts}
              />
            </div>
          )}

          {activeTab === 'crops' && (
            <CropHealthOverview
              crops={dashboardData.farm.crops}
              recentAnalyses={dashboardData.recentAnalyses}
            />
          )}

          {activeTab === 'market' && (
            <MarketPricesWidget
              prices={dashboardData.marketPrices}
              alerts={dashboardData.marketAlerts}
              detailed={true}
            />
          )}

          {activeTab === 'analysis' && (
            <CropAnalysisUpload
              farmId={dashboardData.farm._id}
              crops={dashboardData.farm.crops}
              onAnalysisComplete={handleCropAnalysisComplete}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AgriculturalDashboard;