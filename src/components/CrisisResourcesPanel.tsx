import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import wellbeingService from '../services/wellbeingService';
import { MentalHealthResource, CRISIS_RESOURCES } from '../types/wellbeing';

const CrisisResourcesPanel: React.FC = () => {
  const [crisisResources, setCrisisResources] = useState<MentalHealthResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCrisisResources();
  }, []);

  const loadCrisisResources = async () => {
    try {
      setLoading(true);
      const resources = await wellbeingService.getCrisisResources();
      setCrisisResources(resources);
    } catch (error) {
      console.error('Error loading crisis resources:', error);
      // Fallback to static resources if API fails
      setCrisisResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWebsite = (website: string) => {
    window.open(website, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mr-3"></div>
          <p className="text-red-800">Loading crisis resources...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 mb-6"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            🚨 Crisis Support - Immediate Help Available
          </h3>
          <p className="text-sm text-red-700 mb-4">
            If you're in immediate danger or having thoughts of self-harm, please reach out for help right now. 
            These services are available 24/7 and are completely confidential.
          </p>

          {/* Emergency Notice */}
          <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-4">
            <p className="text-sm font-medium text-red-800">
              🆘 In a life-threatening emergency, call <strong>000</strong> immediately
            </p>
          </div>

          {/* Static Crisis Resources (Always Available) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {CRISIS_RESOURCES.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{resource.title}</h4>
                <p className="text-sm text-gray-700 mb-3">{resource.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <button
                      onClick={() => handleCall(resource.phone)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors font-medium"
                    >
                      📞 {resource.phone}
                    </button>
                  </div>
                  
                  {resource.website && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Website:</span>
                      <button
                        onClick={() => handleWebsite(resource.website!)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        🌐 Visit Site
                      </button>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    <p>Available: {resource.availability}</p>
                    <p>{resource.isNational ? 'National Service' : 'Local Service'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dynamic Crisis Resources from API */}
          {crisisResources.length > 0 && (
            <>
              <h4 className="font-medium text-red-800 mb-3">Additional Crisis Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crisisResources.slice(0, 4).map((resource, index) => (
                  <motion.div
                    key={resource._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (CRISIS_RESOURCES.length + index) * 0.1 }}
                    className="bg-white border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                      {resource.isVerified && (
                        <span className="text-green-600 text-xs">✓ Verified</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{resource.description}</p>
                    
                    <div className="space-y-2">
                      {resource.contactInfo.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <button
                            onClick={() => handleCall(resource.contactInfo.phone!)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors font-medium"
                          >
                            📞 {resource.contactInfo.phone}
                          </button>
                        </div>
                      )}
                      
                      {resource.contactInfo.website && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Website:</span>
                          <button
                            onClick={() => handleWebsite(resource.contactInfo.website!)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            🌐 Visit Site
                          </button>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        <p>Available: {resource.availability.hours}</p>
                        <p>{resource.location.isNational ? 'National' : resource.location.state}</p>
                        {resource.availability.is24x7 && (
                          <p className="text-green-600 font-medium">24/7 Available</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Safety Planning */}
          <div className="mt-6 bg-white border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-3">🛡️ Safety Planning</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>If you're having thoughts of self-harm:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Remove any means of self-harm from your immediate environment</li>
                <li>Call one of the crisis numbers above immediately</li>
                <li>Stay with someone you trust or go to a safe place</li>
                <li>Have a list of people you can call for support</li>
                <li>Remember: These feelings are temporary and help is available</li>
              </ul>
            </div>
          </div>

          {/* Encouraging Message */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💙 You are not alone.</strong> Many people have felt the way you're feeling right now, 
              and with the right support, things can get better. Reaching out for help is a sign of strength, 
              not weakness.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CrisisResourcesPanel;