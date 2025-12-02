import React, { useState, useEffect } from 'react';
import { communityService, MatchResult, MatchingFilters } from '../services/communityService';

interface CommunityMatchesProps {
  onConnect?: (memberId: string) => void;
}

export const CommunityMatches: React.FC<CommunityMatchesProps> = ({ onConnect }) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MatchingFilters>({
    limit: 20,
    minMatchingScore: 50,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMatches();
  }, [filters]);

  const loadMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await communityService.findMatches(filters);
      setMatches(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (memberId: string) => {
    try {
      await communityService.connectWithMember(memberId);
      onConnect?.(memberId);
      // Optionally refresh matches or show success message
    } catch (error) {
      console.error('Failed to connect:', error);
      // Show error message
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'Distance unknown';
    if (distance < 1) return `${Math.round(distance * 1000)}m away`;
    return `${Math.round(distance)}km away`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadMatches}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Community Matches</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Distance (km)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={filters.maxDistance || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  maxDistance: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any distance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Matching Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minMatchingScore || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  minMatchingScore: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any score"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Results Limit
              </label>
              <select
                value={filters.limit || 20}
                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 results</option>
                <option value={20}>20 results</option>
                <option value={50}>50 results</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Categories (comma-separated)
            </label>
            <input
              type="text"
              value={filters.skillCategories?.join(', ') || ''}
              onChange={(e) => setFilters({ 
                ...filters, 
                skillCategories: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., agricultural, technical, creative"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Categories (comma-separated)
            </label>
            <input
              type="text"
              value={filters.interestCategories?.join(', ') || ''}
              onChange={(e) => setFilters({ 
                ...filters, 
                interestCategories: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., agriculture, technology, arts"
            />
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">No matches found with current filters.</div>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or completing your community profile to get better matches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.user._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {match.user.profile.avatar ? (
                    <img
                      src={match.user.profile.avatar}
                      alt={match.user.profile.displayName || `${match.user.profile.firstName} ${match.user.profile.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {match.user.profile.firstName.charAt(0)}{match.user.profile.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {match.user.profile.displayName || `${match.user.profile.firstName} ${match.user.profile.lastName}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {match.user.profile.occupation || 'Rural community member'}
                    </p>
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(match.matchingScore)}`}>
                  {match.matchingScore}% match
                </div>
              </div>

              <div className="space-y-3">
                {match.user.location && (
                  <div className="text-sm text-gray-600">
                    📍 {match.user.location.city}, {match.user.location.state}
                    {match.distance && (
                      <span className="ml-2">• {formatDistance(match.distance)}</span>
                    )}
                  </div>
                )}

                {match.user.profile.bio && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {match.user.profile.bio}
                  </p>
                )}

                <div className="space-y-2">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top Skills</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.member.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill.name}
                        </span>
                      ))}
                      {match.member.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{match.member.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Interests</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {match.member.interests.slice(0, 3).map((interest, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {interest.name}
                        </span>
                      ))}
                      {match.member.interests.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{match.member.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Skills:</span> {match.compatibilityFactors.skillsAlignment}%
                  </div>
                  <div>
                    <span className="font-medium">Interests:</span> {match.compatibilityFactors.interestsAlignment}%
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {match.compatibilityFactors.locationCompatibility}%
                  </div>
                  <div>
                    <span className="font-medium">Availability:</span> {match.compatibilityFactors.availabilityMatch}%
                  </div>
                </div>

                {match.recommendations.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h4 className="text-xs font-medium text-blue-800 mb-1">AI Recommendation</h4>
                    <p className="text-xs text-blue-700">
                      {match.recommendations[0]}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleConnect(match.user._id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};