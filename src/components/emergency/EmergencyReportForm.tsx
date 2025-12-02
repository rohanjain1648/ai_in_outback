import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface EmergencyReportFormProps {
  onClose: () => void;
  onSubmit: () => void;
  userLocation: GeolocationPosition | null;
}

const EmergencyReportForm: React.FC<EmergencyReportFormProps> = ({
  onClose,
  onSubmit,
  userLocation
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    severity: '',
    location: {
      coordinates: userLocation ? [userLocation.coords.longitude, userLocation.coords.latitude] : [0, 0],
      description: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emergencyTypes = [
    { value: 'fire', label: '🔥 Fire', description: 'Bushfire, house fire, or other fire emergency' },
    { value: 'flood', label: '🌊 Flood', description: 'Flooding, flash flood, or water emergency' },
    { value: 'weather', label: '⛈️ Severe Weather', description: 'Storm, cyclone, or extreme weather' },
    { value: 'medical', label: '🚑 Medical Emergency', description: 'Medical emergency requiring immediate attention' },
    { value: 'security', label: '🚨 Security Threat', description: 'Security incident or public safety threat' },
    { value: 'infrastructure', label: '🚧 Infrastructure', description: 'Road closure, power outage, or infrastructure failure' },
    { value: 'community', label: '👥 Community Alert', description: 'Community-specific emergency or alert' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', description: 'Minor issue, awareness needed', color: 'text-blue-600' },
    { value: 'medium', label: 'Medium', description: 'Moderate concern, caution advised', color: 'text-yellow-600' },
    { value: 'high', label: 'High', description: 'Serious situation, immediate attention', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', description: 'Life-threatening, urgent response needed', color: 'text-red-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to report emergencies');
      }

      const response = await fetch('http://localhost:3001/api/v1/emergency/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onSubmit();
      } else {
        throw new Error(data.message || 'Failed to submit report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-red-800">📢 Report Emergency</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Title *
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the emergency"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {emergencyTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {severityLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.severity === level.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={level.value}
                      checked={formData.severity === level.value}
                      onChange={(e) => handleInputChange('severity', e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className={`font-medium ${level.color}`}>{level.label}</p>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                required
                maxLength={2000}
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed information about the emergency, including what happened, when, and any immediate dangers..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Description *
              </label>
              <input
                type="text"
                required
                maxLength={500}
                value={formData.location.description}
                onChange={(e) => handleInputChange('location.description', e.target.value)}
                placeholder="Describe the location (e.g., '123 Main St, Townsville' or 'Near the old bridge on River Road')"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {userLocation && (
                <p className="text-sm text-gray-500 mt-1">
                  📍 Using your current location: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Coordinates (manual entry if needed) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.coordinates[1]}
                  onChange={(e) => handleInputChange('location.coordinates', [formData.location.coordinates[0], parseFloat(e.target.value) || 0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.coordinates[0]}
                  onChange={(e) => handleInputChange('location.coordinates', [parseFloat(e.target.value) || 0, formData.location.coordinates[1]])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      • For immediate life-threatening emergencies, call <strong>000</strong> first
                    </p>
                    <p>
                      • This report will be shared with the community and local authorities
                    </p>
                    <p>
                      • False reports may result in account suspension
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.type || !formData.severity || !formData.description || !formData.location.description}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmergencyReportForm;