/**
 * Analytics Component for Admin Dashboard
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  userGrowth: {
    labels: string[];
    data: number[];
  };
  engagement: {
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
    averageSessionTime: number;
  };
  featureUsage: {
    feature: string;
    usage: number;
    growth: number;
  }[];
  regionalData: {
    state: string;
    users: number;
    engagement: number;
  }[];
}

export const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Mock data - in real implementation, fetch from analytics API
      const mockData: AnalyticsData = {
        userGrowth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [1200, 1450, 1800, 2100, 2400, 2800]
        },
        engagement: {
          dailyActive: 3421,
          weeklyActive: 8934,
          monthlyActive: 12847,
          averageSessionTime: 18.5
        },
        featureUsage: [
          { feature: 'Agricultural Dashboard', usage: 85, growth: 12 },
          { feature: 'Community Chat', usage: 78, growth: 8 },
          { feature: 'Resource Discovery', usage: 72, growth: 15 },
          { feature: 'Emergency Alerts', usage: 68, growth: 5 },
          { feature: 'Business Directory', usage: 65, growth: 18 },
          { feature: 'Cultural Heritage', usage: 58, growth: 22 }
        ],
        regionalData: [
          { state: 'NSW', users: 4200, engagement: 82 },
          { state: 'QLD', users: 3800, engagement: 79 },
          { state: 'VIC', users: 2900, engagement: 85 },
          { state: 'WA', users: 2100, engagement: 77 },
          { state: 'SA', users: 1500, engagement: 80 },
          { state: 'TAS', users: 800, engagement: 88 }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Analytics & Insights</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Daily Active Users',
            value: analyticsData.engagement.dailyActive.toLocaleString(),
            change: '+12%',
            icon: '👥'
          },
          {
            title: 'Weekly Active Users',
            value: analyticsData.engagement.weeklyActive.toLocaleString(),
            change: '+8%',
            icon: '📊'
          },
          {
            title: 'Monthly Active Users',
            value: analyticsData.engagement.monthlyActive.toLocaleString(),
            change: '+15%',
            icon: '📈'
          },
          {
            title: 'Avg Session Time',
            value: `${analyticsData.engagement.averageSessionTime}min`,
            change: '+5%',
            icon: '⏱️'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">{metric.icon}</span>
              </div>
              <span className="text-green-600 text-sm font-medium">{metric.change}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm text-gray-500">{metric.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Feature Usage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h3>
        <div className="space-y-4">
          {analyticsData.featureUsage.map((feature, index) => (
            <div key={feature.feature} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{feature.feature}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{feature.usage}%</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {feature.growth > 0 ? '+' : ''}{feature.growth}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feature.usage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className="bg-blue-600 h-2 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Data */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsData.regionalData.map((region) => (
            <div key={region.state} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{region.state}</span>
                <span className="text-sm text-gray-500">{region.engagement}% engaged</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {region.users.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">users</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full"
                  style={{ width: `${region.engagement}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {analyticsData.userGrowth.data.map((value, index) => {
            const maxValue = Math.max(...analyticsData.userGrowth.data);
            const height = (value / maxValue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  className="w-full bg-blue-600 rounded-t-lg min-h-[4px]"
                />
                <div className="text-xs text-gray-500 mt-2">
                  {analyticsData.userGrowth.labels[index]}
                </div>
                <div className="text-xs font-medium text-gray-900">
                  {value.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};