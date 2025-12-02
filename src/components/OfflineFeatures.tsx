import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import offlineFirstService from '../services/offlineFirstService';

// Emergency contacts that work offline
const EMERGENCY_CONTACTS = [
  {
    name: 'Emergency Services',
    number: '000',
    description: 'Police, Fire, Ambulance',
    icon: '🚨',
    priority: 1
  },
  {
    name: 'Lifeline',
    number: '13 11 14',
    description: '24/7 Crisis Support & Suicide Prevention',
    icon: '💚',
    priority: 2
  },
  {
    name: 'Beyond Blue',
    number: '1300 22 4636',
    description: 'Depression, Anxiety & Mental Health Support',
    icon: '💙',
    priority: 2
  },
  {
    name: 'Kids Helpline',
    number: '1800 55 1800',
    description: 'Support for children and young people (5-25)',
    icon: '👶',
    priority: 3
  },
  {
    name: 'MensLine Australia',
    number: '1300 78 99 78',
    description: '24/7 Support for men',
    icon: '👨',
    priority: 3
  },
  {
    name: 'Domestic Violence Helpline',
    number: '1800 737 732',
    description: '24/7 National Domestic Violence Counselling',
    icon: '🏠',
    priority: 2
  },
  {
    name: 'Poison Information Centre',
    number: '13 11 26',
    description: '24/7 Poison emergency advice',
    icon: '☠️',
    priority: 2
  }
];

// Basic community information that's cached offline
interface CommunityInfo {
  id: string;
  name: string;
  type: 'service' | 'business' | 'organization';
  contact: string;
  address?: string;
  description: string;
  category: string;
}

interface OfflineFeaturesProps {
  isOffline?: boolean;
}

export const OfflineFeatures: React.FC<OfflineFeaturesProps> = ({ 
  isOffline = !navigator.onLine 
}) => {
  const [activeTab, setActiveTab] = useState<'emergency' | 'community' | 'wellbeing' | 'agriculture'>('emergency');
  const [communityData, setCommunityData] = useState<CommunityInfo[]>([]);
  const [wellbeingResources, setWellbeingResources] = useState<any[]>([]);
  const [agricultureData, setAgricultureData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    try {
      setLoading(true);
      
      // Load cached community data
      const community = await offlineFirstService.fetchData<CommunityInfo[]>(
        '/api/community/basic',
        'community',
        { cacheFirst: true }
      );
      setCommunityData(community || []);

      // Load cached wellbeing resources
      const wellbeing = await offlineFirstService.fetchData<any[]>(
        '/api/wellbeing/resources',
        'wellbeing',
        { cacheFirst: true }
      );
      setWellbeingResources(wellbeing || []);

      // Load cached agriculture data
      const agriculture = await offlineFirstService.fetchData<any[]>(
        '/api/agriculture/basic',
        'agriculture',
        { cacheFirst: true }
      );
      setAgricultureData(agriculture || []);

    } catch (error) {
      console.error('Error loading offline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const tabs = [
    { id: 'emergency', name: 'Emergency', icon: '🚨', count: EMERGENCY_CONTACTS.length },
    { id: 'community', name: 'Community', icon: '🏘️', count: communityData.length },
    { id: 'wellbeing', name: 'Wellbeing', icon: '💚', count: wellbeingResources.length },
    { id: 'agriculture', name: 'Agriculture', icon: '🌾', count: agricultureData.length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading offline features...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Offline Status Banner */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <span className="text-orange-500 text-xl mr-3">📴</span>
            <div>
              <h3 className="font-semibold text-orange-800">You're currently offline</h3>
              <p className="text-sm text-orange-600">
                Essential features and cached data are still available below.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Emergency Tab */}
        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">🚨 Emergency Information</h3>
              <p className="text-sm text-red-600">
                These numbers work even without internet connection. In a life-threatening emergency, call 000 immediately.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {EMERGENCY_CONTACTS
                .sort((a, b) => a.priority - b.priority)
                .map((contact, index) => (
                  <motion.div
                    key={contact.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      contact.priority === 1 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{contact.icon}</span>
                          <h4 className={`font-semibold ${
                            contact.priority === 1 ? 'text-red-800' : 'text-gray-900'
                          }`}>
                            {contact.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{contact.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCall(contact.number)}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                        contact.priority === 1
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      📞 Call {contact.number}
                    </button>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">🏘️ Community Directory</h3>
              <p className="text-sm text-blue-600">
                Basic community information cached for offline access.
              </p>
            </div>

            {communityData.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">📭</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Community Data Cached</h3>
                <p className="text-gray-600">
                  Connect to the internet to load and cache community information.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {communityData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    {item.address && (
                      <p className="text-xs text-gray-500 mb-2">📍 {item.address}</p>
                    )}
                    <button
                      onClick={() => handleCall(item.contact)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📞 {item.contact}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wellbeing Tab */}
        {activeTab === 'wellbeing' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">💚 Wellbeing Resources</h3>
              <p className="text-sm text-green-600">
                Mental health resources and support information available offline.
              </p>
            </div>

            {wellbeingResources.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🌱</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Wellbeing Resources Cached</h3>
                <p className="text-gray-600">
                  Connect to the internet to load and cache wellbeing resources.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {wellbeingResources.slice(0, 6).map((resource, index) => (
                  <motion.div
                    key={resource.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                        {resource.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                    <div className="flex space-x-2">
                      {resource.contactInfo?.phone && (
                        <button
                          onClick={() => handleCall(resource.contactInfo.phone)}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          📞 Call
                        </button>
                      )}
                      {resource.contactInfo?.website && (
                        <button
                          onClick={() => window.open(resource.contactInfo.website, '_blank')}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          🌐 Website
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agriculture Tab */}
        {activeTab === 'agriculture' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">🌾 Agricultural Information</h3>
              <p className="text-sm text-yellow-600">
                Basic agricultural data and resources cached for offline access.
              </p>
            </div>

            {agricultureData.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🚜</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Agricultural Data Cached</h3>
                <p className="text-gray-600">
                  Connect to the internet to load and cache agricultural information.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {agricultureData.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{item.title || item.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    {item.contact && (
                      <button
                        onClick={() => handleCall(item.contact)}
                        className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        📞 Contact
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Offline Tips */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Offline Tips</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Your data is automatically saved locally and will sync when you're back online
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Emergency contacts work without internet connection
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Previously viewed content remains accessible offline
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">ℹ</span>
            Connect to internet periodically to sync latest information
          </li>
        </ul>
      </div>
    </div>
  );
};