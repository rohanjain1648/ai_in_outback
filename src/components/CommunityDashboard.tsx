import React, { useState, useEffect } from 'react';
import { CommunityProfileSetup } from './CommunityProfileSetup';
import { CommunityMatches } from './CommunityMatches';
import { communityService, CommunityMemberProfile, CommunityStats, ConnectionHistory } from '../services/communityService';

export const CommunityDashboard: React.FC = () => {
  const [profile, setProfile] = useState<CommunityMemberProfile | null>(null);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [connections, setConnections] = useState<ConnectionHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'profile' | 'connections' | 'stats'>('matches');
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileData, statsData, connectionsData] = await Promise.all([
        communityService.getProfile(),
        communityService.getCommunityStats(),
        communityService.getConnectionHistory().catch(() => []), // Don't fail if no profile exists
      ]);

      setProfile(profileData);
      setStats(statsData);
      setConnections(connectionsData);

      // If no profile exists, show setup
      if (!profileData) {
        setShowProfileSetup(true);
        setActiveTab('profile');
      }
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setShowProfileSetup(false);
    loadData(); // Reload data after profile creation
    setActiveTab('matches');
  };

  const handleConnect = (memberId: string) => {
    // Refresh connections after connecting
    communityService.getConnectionHistory().then(setConnections);
  };

  const toggleAvailability = async () => {
    try {
      const updatedProfile = await communityService.toggleMatchingAvailability();
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showProfileSetup || !profile) {
    return (
      <CommunityProfileSetup
        onComplete={handleProfileComplete}
        onCancel={() => setShowProfileSetup(false)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Community Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Available for matching:</span>
              <button
                onClick={toggleAvailability}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.isAvailableForMatching ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.isAvailableForMatching ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={() => setShowProfileSetup(true)}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile completeness indicator */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
            <span className="text-sm text-gray-600">{profile.profileCompleteness}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${profile.profileCompleteness}%` }}
            />
          </div>
          {profile.profileCompleteness < 100 && (
            <p className="text-xs text-gray-500 mt-1">
              Complete your profile to get better matches and increase visibility.
            </p>
          )}
        </div>

        {/* Navigation tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'matches', label: 'Matches', count: null },
              { id: 'connections', label: 'Connections', count: connections.length },
              { id: 'stats', label: 'Community Stats', count: null },
              { id: 'profile', label: 'Profile', count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'matches' && (
          <CommunityMatches onConnect={handleConnect} />
        )}

        {activeTab === 'connections' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Connections</h2>
            {connections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No connections yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start by finding matches and connecting with community members.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Connection</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        connection.status === 'active' ? 'bg-green-100 text-green-800' :
                        connection.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {connection.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Type: {connection.connectionType}</p>
                      <p>Connected: {new Date(connection.connectionDate).toLocaleDateString()}</p>
                      <p>Interactions: {connection.interactionCount}</p>
                      {connection.rating && (
                        <p>Rating: {'⭐'.repeat(connection.rating)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Community Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-green-600">{stats.activeMembers}</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.skillCategories).length}
                </div>
                <div className="text-sm text-gray-600">Skill Categories</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(stats.averageProfileCompleteness)}%
                </div>
                <div className="text-sm text-gray-600">Avg. Profile Completeness</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Skills</h3>
                <div className="space-y-2">
                  {Object.entries(stats.skillCategories)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 capitalize">{category}</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Interests</h3>
                <div className="space-y-2">
                  {Object.entries(stats.interestCategories)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 capitalize">{category}</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
              <button
                onClick={() => setShowProfileSetup(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills ({profile.skills.length})</h3>
                <div className="space-y-2">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-gray-600 ml-2">({skill.level})</span>
                      </div>
                      <div className="flex space-x-1">
                        {skill.canTeach && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Can teach
                          </span>
                        )}
                        {skill.wantsToLearn && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Learning
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests ({profile.interests.length})</h3>
                <div className="space-y-2">
                  {profile.interests.map((interest, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{interest.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        interest.intensity === 'passionate' ? 'bg-red-100 text-red-800' :
                        interest.intensity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interest.intensity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Time Slots:</span>
                    <div className="mt-1 space-y-1">
                      {profile.availability.timeSlots.map((slot, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {slot.day.charAt(0).toUpperCase() + slot.day.slice(1)}: {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Preferred Meeting Types:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {profile.availability.preferredMeetingTypes.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Response Time:</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {profile.availability.responseTime.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Matching Preferences</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Max Distance:</span>
                    <span className="text-gray-600 ml-2">{profile.matchingPreferences.maxDistance}km</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Preferred Skill Levels:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {profile.matchingPreferences.preferredSkillLevels.map((level, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Priority Categories:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {profile.matchingPreferences.priorityCategories.map((category, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};