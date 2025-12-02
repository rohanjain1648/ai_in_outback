/**
 * Admin Dashboard for Platform Management
 * 
 * Comprehensive admin interface for managing users, content, and system health
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserManagement } from './components/UserManagement';
import { ContentModeration } from './components/ContentModeration';
import { SystemHealth } from './components/SystemHealth';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';

interface AdminStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
  };
  content: {
    resources: number;
    stories: number;
    flaggedContent: number;
    pendingApproval: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionTime: number;
  };
}

type AdminView = 'overview' | 'users' | 'content' | 'system' | 'analytics' | 'settings';

export const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // In a real implementation, this would fetch from your admin API
      const mockStats: AdminStats = {
        users: {
          total: 15420,
          active: 8934,
          newToday: 47,
          newThisWeek: 312
        },
        content: {
          resources: 2847,
          stories: 1293,
          flaggedContent: 23,
          pendingApproval: 15
        },
        system: {
          uptime: 99.8,
          responseTime: 245,
          errorRate: 0.02,
          activeConnections: 1247
        },
        engagement: {
          dailyActiveUsers: 3421,
          weeklyActiveUsers: 8934,
          monthlyActiveUsers: 12847,
          averageSessionTime: 18.5
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'content', label: 'Content Moderation', icon: '📝' },
    { id: 'system', label: 'System Health', icon: '⚙️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '🔧' }
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewDashboard stats={stats} />;
      case 'users':
        return <UserManagement />;
      case 'content':
        return <ContentModeration />;
      case 'system':
        return <SystemHealth />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <OverviewDashboard stats={stats} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Rural Connect AI Platform Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <button
                onClick={fetchAdminStats}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id as AdminView)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Overview Dashboard Component
const OverviewDashboard: React.FC<{ stats: AdminStats | null }> = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total.toLocaleString(),
      change: `+${stats.users.newToday} today`,
      color: 'blue',
      icon: '👥'
    },
    {
      title: 'Active Users',
      value: stats.users.active.toLocaleString(),
      change: `${((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total`,
      color: 'green',
      icon: '✅'
    },
    {
      title: 'System Uptime',
      value: `${stats.system.uptime}%`,
      change: `${stats.system.responseTime}ms avg response`,
      color: 'purple',
      icon: '⚡'
    },
    {
      title: 'Flagged Content',
      value: stats.content.flaggedContent.toString(),
      change: `${stats.content.pendingApproval} pending review`,
      color: 'red',
      icon: '🚩'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${card.color}-100 flex items-center justify-center`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                  <div className="text-sm text-gray-500">{card.change}</div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-700">{card.title}</h3>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="text-2xl mb-2">📢</div>
              <div className="font-medium text-gray-900">Send Announcement</div>
              <div className="text-sm text-gray-500">Broadcast message to all users</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="text-2xl mb-2">🔧</div>
              <div className="font-medium text-gray-900">System Maintenance</div>
              <div className="text-sm text-gray-500">Schedule maintenance window</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Generate Report</div>
              <div className="text-sm text-gray-500">Create usage analytics report</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { time: '2 minutes ago', action: 'New user registration', user: 'john.doe@example.com' },
              { time: '15 minutes ago', action: 'Content flagged for review', user: 'Resource: Farm Equipment Rental' },
              { time: '1 hour ago', action: 'System backup completed', user: 'Automated backup' },
              { time: '2 hours ago', action: 'Emergency alert sent', user: 'Bushfire warning - NSW' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div className="font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-500">{activity.user}</div>
                </div>
                <div className="text-sm text-gray-400">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};