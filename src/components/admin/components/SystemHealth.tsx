/**
 * System Health Component for Admin Dashboard
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SystemMetrics {
  server: {
    uptime: number;
    cpu: number;
    memory: number;
    disk: number;
    responseTime: number;
  };
  database: {
    status: 'healthy' | 'warning' | 'error';
    connections: number;
    queryTime: number;
    size: number;
  };
  services: {
    name: string;
    status: 'online' | 'offline' | 'degraded';
    responseTime: number;
    lastCheck: string;
  }[];
  errors: {
    timestamp: string;
    level: 'error' | 'warning' | 'info';
    message: string;
    service: string;
  }[];
}

export const SystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchSystemMetrics, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchSystemMetrics = async () => {
    try {
      // Mock data - in real implementation, fetch from monitoring API
      const mockMetrics: SystemMetrics = {
        server: {
          uptime: 99.8,
          cpu: 45,
          memory: 68,
          disk: 32,
          responseTime: 245
        },
        database: {
          status: 'healthy',
          connections: 47,
          queryTime: 12,
          size: 2.4
        },
        services: [
          {
            name: 'API Gateway',
            status: 'online',
            responseTime: 120,
            lastCheck: new Date().toISOString()
          },
          {
            name: 'Authentication Service',
            status: 'online',
            responseTime: 89,
            lastCheck: new Date().toISOString()
          },
          {
            name: 'Socket.io Server',
            status: 'online',
            responseTime: 156,
            lastCheck: new Date().toISOString()
          },
          {
            name: 'AI Processing Service',
            status: 'degraded',
            responseTime: 2340,
            lastCheck: new Date().toISOString()
          },
          {
            name: 'File Storage Service',
            status: 'online',
            responseTime: 78,
            lastCheck: new Date().toISOString()
          }
        ],
        errors: [
          {
            timestamp: new Date(Date.now() - 300000).toISOString(),
            level: 'warning',
            message: 'High response time detected in AI Processing Service',
            service: 'AI Processing'
          },
          {
            timestamp: new Date(Date.now() - 600000).toISOString(),
            level: 'info',
            message: 'Database backup completed successfully',
            service: 'Database'
          },
          {
            timestamp: new Date(Date.now() - 900000).toISOString(),
            level: 'error',
            message: 'Failed to connect to external weather API',
            service: 'Weather Service'
          }
        ]
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
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

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={fetchSystemMetrics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Server Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Uptime',
              value: `${metrics.server.uptime}%`,
              status: metrics.server.uptime > 99 ? 'good' : metrics.server.uptime > 95 ? 'warning' : 'error'
            },
            {
              label: 'CPU Usage',
              value: `${metrics.server.cpu}%`,
              status: metrics.server.cpu < 70 ? 'good' : metrics.server.cpu < 85 ? 'warning' : 'error'
            },
            {
              label: 'Memory Usage',
              value: `${metrics.server.memory}%`,
              status: metrics.server.memory < 80 ? 'good' : metrics.server.memory < 90 ? 'warning' : 'error'
            },
            {
              label: 'Disk Usage',
              value: `${metrics.server.disk}%`,
              status: metrics.server.disk < 80 ? 'good' : metrics.server.disk < 90 ? 'warning' : 'error'
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                metric.status === 'good' ? 'bg-green-100' :
                metric.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-2xl ${
                  metric.status === 'good' ? 'text-green-600' :
                  metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metric.status === 'good' ? '✅' : metric.status === 'warning' ? '⚠️' : '❌'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-500">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
              metrics.database.status === 'healthy' ? 'bg-green-100' :
              metrics.database.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className={`text-2xl ${
                metrics.database.status === 'healthy' ? 'text-green-600' :
                metrics.database.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.database.status === 'healthy' ? '✅' : metrics.database.status === 'warning' ? '⚠️' : '❌'}
              </span>
            </div>
            <div className="text-lg font-bold text-gray-900 capitalize">{metrics.database.status}</div>
            <div className="text-sm text-gray-500">Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.database.connections}</div>
            <div className="text-sm text-gray-500">Active Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.database.queryTime}ms</div>
            <div className="text-sm text-gray-500">Avg Query Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.database.size}GB</div>
            <div className="text-sm text-gray-500">Database Size</div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Status</h3>
        <div className="space-y-4">
          {metrics.services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  service.status === 'online' ? 'bg-green-500' :
                  service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div>
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-500">
                    Last checked: {new Date(service.lastCheck).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium capitalize ${
                  service.status === 'online' ? 'text-green-600' :
                  service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {service.status}
                </div>
                <div className="text-sm text-gray-500">{service.responseTime}ms</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Events</h3>
        <div className="space-y-3">
          {metrics.errors.map((error, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${
                error.level === 'error' ? 'bg-red-50 border-red-400' :
                error.level === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    error.level === 'error' ? 'bg-red-100 text-red-800' :
                    error.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {error.level.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{error.service}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(error.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{error.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};