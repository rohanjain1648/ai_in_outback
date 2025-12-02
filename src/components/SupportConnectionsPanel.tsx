import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import wellbeingService from '../services/wellbeingService';
import { SupportConnection } from '../types/wellbeing';

interface Props {
  connections: SupportConnection[];
}

const SupportConnectionsPanel: React.FC<Props> = ({ connections: initialConnections }) => {
  const [connections, setConnections] = useState<SupportConnection[]>(initialConnections);
  const [potentialMatches, setPotentialMatches] = useState<SupportConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'find'>('current');

  useEffect(() => {
    setConnections(initialConnections);
  }, [initialConnections]);

  const loadPotentialMatches = async () => {
    try {
      setLoading(true);
      const matches = await wellbeingService.findSupportMatches('peer_support');
      setPotentialMatches(matches);
    } catch (error) {
      console.error('Error loading potential matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (supporterId: string) => {
    try {
      const connection = await wellbeingService.createSupportConnection({
        supporterId,
        connectionType: 'peer_support'
      });
      
      setConnections(prev => [...prev, connection]);
      setPotentialMatches(prev => prev.filter(match => match.supporterId !== supporterId));
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };

  const handleUpdateStatus = async (connectionId: string, status: string) => {
    try {
      const updatedConnection = await wellbeingService.updateSupportConnection(connectionId, status);
      setConnections(prev => 
        prev.map(conn => conn._id === connectionId ? updatedConnection : conn)
      );
    } catch (error) {
      console.error('Error updating connection:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchingScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatMatchingScore = (score: number) => {
    return `${Math.round(score * 100)}% match`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Support Network</h2>
        <p className="text-gray-600">Connect with others who understand your journey</p>
        
        {/* Tabs */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Connections ({connections.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('find');
                if (potentialMatches.length === 0) {
                  loadPotentialMatches();
                }
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'find'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Find Support
            </button>
          </nav>
        </div>
      </div>

      {/* Current Connections */}
      {activeTab === 'current' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {connections.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Connections Yet</h3>
              <p className="text-gray-600 mb-4">
                Connect with others who can provide peer support and understanding.
              </p>
              <button
                onClick={() => setActiveTab('find')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Find Support Matches
              </button>
            </div>
          ) : (
            connections.map((connection) => (
              <div key={connection._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {connection.isAnonymous 
                            ? connection.anonymousIds?.supporterAlias?.charAt(0) || '?'
                            : 'S'
                          }
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {connection.isAnonymous 
                            ? connection.anonymousIds?.supporterAlias || 'Anonymous Supporter'
                            : 'Support Connection'
                          }
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {connection.connectionType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Matching Score</p>
                        <p className={`font-medium ${getMatchingScoreColor(connection.matchingScore)}`}>
                          {formatMatchingScore(connection.matchingScore)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                          {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {connection.supportAreas.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Support Areas</p>
                        <div className="flex flex-wrap gap-2">
                          {connection.supportAreas.map((area) => (
                            <span
                              key={area}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      <p>Connected: {new Date(connection.createdAt).toLocaleDateString()}</p>
                      <p>Interactions: {connection.totalInteractions}</p>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    {connection.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(connection._id, 'active')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(connection._id, 'terminated')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    
                    {connection.status === 'active' && (
                      <>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                          Message
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(connection._id, 'paused')}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          Pause
                        </button>
                      </>
                    )}
                    
                    {connection.status === 'paused' && (
                      <button
                        onClick={() => handleUpdateStatus(connection._id, 'active')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Find Support */}
      {activeTab === 'find' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding potential support matches...</p>
            </div>
          ) : potentialMatches.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any potential support matches at the moment. Try again later or adjust your preferences.
              </p>
              <button
                onClick={loadPotentialMatches}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Search Again
              </button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-1">About Anonymous Support</h3>
                <p className="text-sm text-blue-700">
                  All connections are anonymous by default. You'll be matched with people who have similar experiences and can provide peer support.
                </p>
              </div>
              
              {potentialMatches.map((match) => (
                <div key={match._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium text-lg">
                            {match.anonymousIds?.supporterAlias?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {match.anonymousIds?.supporterAlias || 'Anonymous Supporter'}
                          </h3>
                          <p className={`font-medium ${getMatchingScoreColor(match.matchingScore)}`}>
                            {formatMatchingScore(match.matchingScore)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-600">Location Match</p>
                          <p className="font-medium">
                            {Math.round(match.matchingFactors.locationProximity * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Experience Similarity</p>
                          <p className="font-medium">
                            {Math.round(match.matchingFactors.experienceSimilarity * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Availability Match</p>
                          <p className="font-medium">
                            {Math.round(match.matchingFactors.availabilityMatch * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Support Alignment</p>
                          <p className="font-medium">
                            {Math.round(match.matchingFactors.supportNeedsAlignment * 100)}%
                          </p>
                        </div>
                      </div>

                      {match.supportAreas.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Shared Support Areas</p>
                          <div className="flex flex-wrap gap-2">
                            {match.supportAreas.map((area) => (
                              <span
                                key={area}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => handleConnect(match.supporterId)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SupportConnectionsPanel;