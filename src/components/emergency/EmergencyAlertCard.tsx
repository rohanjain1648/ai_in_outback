import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface EmergencyAlert {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
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

interface EmergencyAlertCardProps {
  alert: EmergencyAlert;
  onRespond: (alertId: string, responseType: string, message?: string) => void;
  getSeverityColor: (severity: string) => string;
  getTypeIcon: (type: string) => string;
}

const EmergencyAlertCard: React.FC<EmergencyAlertCardProps> = ({
  alert,
  onRespond,
  getSeverityColor,
  getTypeIcon
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [hasResponded, setHasResponded] = useState(false);

  const handleResponse = (responseType: string) => {
    onRespond(alert._id, responseType, responseMessage);
    setHasResponded(true);
    setResponseMessage('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getSourceBadge = () => {
    switch (alert.source.type) {
      case 'official':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Official
          </span>
        );
      case 'community':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            👥 Community
          </span>
        );
      case 'ai_generated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            🤖 AI Generated
          </span>
        );
      default:
        return null;
    }
  };

  const getVerificationBadge = () => {
    switch (alert.source.verificationStatus) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Pending
          </span>
        );
      case 'false_alarm':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ False Alarm
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ❓ Unverified
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-lg border-l-4 ${
        alert.severity === 'critical' ? 'border-red-600' :
        alert.severity === 'high' ? 'border-orange-500' :
        alert.severity === 'medium' ? 'border-yellow-500' :
        'border-blue-500'
      } overflow-hidden`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getTypeIcon(alert.type)}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{alert.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                {getSourceBadge()}
                {getVerificationBadge()}
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Priority: {alert.priority}/10</p>
            <p>{formatTime(alert.createdAt)}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4">{alert.description}</p>

        {/* Location */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-900">📍 Location</p>
          <p className="text-sm text-gray-600">{alert.location.description}</p>
          <p className="text-xs text-gray-500">
            Radius: {alert.location.radius}km | 
            Coordinates: {alert.location.coordinates[1].toFixed(4)}, {alert.location.coordinates[0].toFixed(4)}
          </p>
        </div>

        {/* Recommended Actions */}
        {alert.metadata.recommendedActions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">🛡️ Recommended Actions</p>
            <ul className="text-sm text-blue-800 space-y-1">
              {alert.metadata.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact Information */}
        {alert.metadata.contactInfo && (
          <div className="bg-green-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-green-900 mb-2">📞 Emergency Contacts</p>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Emergency:</strong> {alert.metadata.contactInfo.emergency}</p>
              <p><strong>Local:</strong> {alert.metadata.contactInfo.local}</p>
              {alert.metadata.contactInfo.website && (
                <p>
                  <strong>Website:</strong>{' '}
                  <a 
                    href={alert.metadata.contactInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {alert.metadata.contactInfo.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Response Section */}
        {!hasResponded && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-900 mb-3">Your Response</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => handleResponse('acknowledged')}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-full transition-colors"
              >
                ✓ Acknowledged
              </button>
              <button
                onClick={() => handleResponse('safe')}
                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-sm rounded-full transition-colors"
              >
                ✅ I'm Safe
              </button>
              <button
                onClick={() => handleResponse('need_help')}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded-full transition-colors"
              >
                🆘 Need Help
              </button>
              <button
                onClick={() => handleResponse('false_alarm')}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-full transition-colors"
              >
                ❌ False Alarm
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Optional message..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {hasResponded && (
          <div className="border-t pt-4">
            <p className="text-sm text-green-600 font-medium">✓ Response recorded. Thank you for staying connected!</p>
          </div>
        )}

        {/* Response Statistics */}
        {alert.responses && alert.responses.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showDetails ? '▼' : '▶'} Community Responses ({alert.responses.length})
            </button>
            
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 text-sm text-gray-600"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="font-medium">Acknowledged</p>
                    <p>{alert.responses.filter(r => r.responseType === 'acknowledged').length}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="font-medium">Safe</p>
                    <p>{alert.responses.filter(r => r.responseType === 'safe').length}</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <p className="font-medium">Need Help</p>
                    <p>{alert.responses.filter(r => r.responseType === 'need_help').length}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">False Alarm</p>
                    <p>{alert.responses.filter(r => r.responseType === 'false_alarm').length}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmergencyAlertCard;