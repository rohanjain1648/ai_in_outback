import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import EmergencyAlertCard from './emergency/EmergencyAlertCard';
import EmergencyReportForm from './emergency/EmergencyReportForm';
import EmergencyNotifications from './emergency/EmergencyNotifications';
import { useGeolocation } from '../hooks/useGeolocation';

interface EmergencyAlert {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'weather' | 'fire' | 'flood' | 'medical' | 'security' | 'infrastructure' | 'community';
  location: {
    coordinates: [number, number];
    radius: number;
    description: string;
  };
  source: {
    type: 'official' | 'community' | 'ai_generated';
    organization?: string;
    verificationStatus: string;
  };
  status: string;
  priority: number;
  metadata: {
    recommendedActions: string[];
    contactInfo?: {
      emergency: string;
      local: string;
      website?: string;
    };
  };
  responses?: any[];
  createdAt: string;
}

const EmergencyDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    severity?: string;
    type?: string;
  }>({});

  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to emergency alert system');
      
      // Join user room for targeted notifications
      const userId = localStorage.getItem('userId');
      if (userId) {
        newSocket.emit('join_user_room', userId);
      }

      // Join location room if location is available
      if (location) {
        newSocket.emit('join_location_room', {
          lat: location.latitude,
          lng: location.longitude,
          radius: 50
        });
      }
    });

    // Listen for new alerts
    newSocket.on('emergency:alert', (data) => {
      console.log('New emergency alert received:', data);
      setAlerts(prev => [data.alert, ...prev]);
    });

    // Listen for targeted alerts
    newSocket.on('emergency:targeted_alert', (data) => {
      console.log('Targeted emergency alert:', data);
      setAlerts(prev => [data.alert, ...prev]);
    });

    // Listen for response updates
    newSocket.on('emergency:response_update', (data) => {
      setAlerts(prev => prev.map(alert => 
        alert._id === data.alertId 
          ? { ...alert, responses: [...(alert.responses || []), data.response] }
          : alert
      ));
    });

    // Listen for coordination updates
    newSocket.on('emergency:coordination_update', (data) => {
      console.log('Emergency coordination update:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [location]);

  useEffect(() => {
    fetchAlerts();
  }, [location, filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (location) {
        params.append('lat', location.latitude.toString());
        params.append('lng', location.longitude.toString());
        params.append('radius', '50');
      }
      
      if (filter.severity) params.append('severity', filter.severity);
      if (filter.type) params.append('type', filter.type);

      const response = await fetch(`http://localhost:3001/api/v1/emergency/alerts?${params}`);
      const data = await response.json();

      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertResponse = async (alertId: string, responseType: string, message?: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/v1/emergency/alerts/${alertId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          responseType,
          message,
          location: location ? [location.longitude, location.latitude] : undefined
        })
      });

      if (response.ok) {
        // Update handled via Socket.IO
        console.log('Response recorded successfully');
      }
    } catch (error) {
      console.error('Error responding to alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fire': return '🔥';
      case 'flood': return '🌊';
      case 'weather': return '⛈️';
      case 'medical': return '🚑';
      case 'security': return '🚨';
      case 'infrastructure': return '🚧';
      case 'community': return '👥';
      default: return '⚠️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-red-800 mb-4">
            🚨 Emergency Alert System
          </h1>
          <p className="text-lg text-red-700">
            Stay informed about emergencies in your area and help your community stay safe
          </p>
        </motion.div>

        {/* Emergency Notifications */}
        <EmergencyNotifications socket={socket} />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <motion.button
            onClick={() => setShowReportForm(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📢 Report Emergency
          </motion.button>
          
          <motion.button
            onClick={fetchAlerts}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Refresh Alerts
          </motion.button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter Alerts</h3>
          <div className="flex flex-wrap gap-4">
            <select
              value={filter.severity || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value || undefined }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filter.type || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value || undefined }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="fire">🔥 Fire</option>
              <option value="flood">🌊 Flood</option>
              <option value="weather">⛈️ Weather</option>
              <option value="medical">🚑 Medical</option>
              <option value="security">🚨 Security</option>
              <option value="infrastructure">🚧 Infrastructure</option>
              <option value="community">👥 Community</option>
            </select>
          </div>
        </div>

        {/* Location Status */}
        {locationError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p>⚠️ Location access denied. You may not receive location-specific alerts.</p>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading emergency alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">✅ No active emergency alerts in your area</p>
              <p className="text-gray-500 mt-2">Stay safe and check back regularly</p>
            </div>
          ) : (
            <AnimatePresence>
              {alerts.map((alert) => (
                <EmergencyAlertCard
                  key={alert._id}
                  alert={alert}
                  onRespond={handleAlertResponse}
                  getSeverityColor={getSeverityColor}
                  getTypeIcon={getTypeIcon}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Report Form Modal */}
        <AnimatePresence>
          {showReportForm && (
            <EmergencyReportForm
              onClose={() => setShowReportForm(false)}
              onSubmit={() => {
                setShowReportForm(false);
                fetchAlerts();
              }}
              userLocation={location}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmergencyDashboard;