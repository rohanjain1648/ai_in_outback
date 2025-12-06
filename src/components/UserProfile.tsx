import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { userService } from '../services/userService';
import { UpdateProfileData } from '../types/user';
import { AvatarGenerator, AvatarGallery, AvatarDisplay } from './avatar';
import { CredentialGallery } from './blockchain/CredentialGallery';
import { blockchainService } from '../services/blockchainService';
import { BlockchainCredential } from '../types/blockchain';

export const UserProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string>('');
  const [showAvatarGenerator, setShowAvatarGenerator] = useState(false);
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);
  const [showCredentials, setShowCredentials] = useState(true); // Show credentials by default
  const [credentialCount, setCredentialCount] = useState(0);

  const [formData, setFormData] = useState<UpdateProfileData>({
    profile: {
      firstName: '',
      lastName: '',
      displayName: '',
      bio: '',
      occupation: '',
      farmType: '',
      businessType: '',
      yearsInArea: 0,
      familySize: 0,
    },
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
        emergency: true,
        community: true,
        agricultural: true,
        business: true,
        cultural: true,
        skills: true,
        wellbeing: true,
      },
      privacy: {
        showLocation: true,
        showProfile: true,
        allowMatching: true,
        shareSkills: true,
      },
      interests: [],
      skills: [],
      languages: [],
      accessibility: {
        screenReader: false,
        highContrast: false,
        largeText: false,
        reducedMotion: false,
      },
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        profile: { ...user.profile },
        preferences: { ...user.preferences },
      });
      loadCredentialCount();
    }
  }, [user]);

  const loadCredentialCount = async () => {
    try {
      const credentials = await blockchainService.getUserCredentials();
      setCredentialCount(credentials.length);
    } catch (error) {
      console.error('Failed to load credential count:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('profile.')) {
      const profileField = name.replace('profile.', '');
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile!,
          [profileField]: type === 'number' ? Number(value) : value,
        },
      }));
    } else if (name.startsWith('preferences.')) {
      const prefPath = name.replace('preferences.', '').split('.');
      setFormData(prev => {
        const newPrefs = { ...prev.preferences! };
        let current: any = newPrefs;

        for (let i = 0; i < prefPath.length - 1; i++) {
          current = current[prefPath[i]];
        }

        const lastKey = prefPath[prefPath.length - 1];
        current[lastKey] = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);

        return {
          ...prev,
          preferences: newPrefs,
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccess('');

    try {
      await userService.updateProfile(formData);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message]);
      } else {
        setErrors(['Failed to update profile']);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        profile: { ...user.profile },
        preferences: { ...user.preferences },
      });
    }
    setIsEditing(false);
    setErrors([]);
    setSuccess('');
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Avatar Section */}
        <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            <AvatarDisplay
              avatarUrl={user?.profile?.avatar || undefined}
              size="xl"
              showGlow={true}
              alt={user?.profile?.displayName || 'User Avatar'}
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.profile?.displayName || `${user?.profile?.firstName} ${user?.profile?.lastName}`}
              </h2>
              <p className="text-gray-600">{user?.profile?.occupation || 'Community Member'}</p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => setShowAvatarGenerator(!showAvatarGenerator)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  Generate New Avatar
                </button>
                <button
                  onClick={() => setShowAvatarGallery(!showAvatarGallery)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                  View Gallery
                </button>
              </div>
            </div>
          </div>

          {/* Avatar Generator */}
          {showAvatarGenerator && (
            <div className="mt-6">
              <AvatarGenerator
                onAvatarGenerated={() => {
                  setSuccess('Avatar generated successfully!');
                  setShowAvatarGenerator(false);
                  refreshUser();
                }}
                onClose={() => setShowAvatarGenerator(false)}
              />
            </div>
          )}

          {/* Avatar Gallery */}
          {showAvatarGallery && (
            <div className="mt-6">
              <AvatarGallery
                onAvatarSelected={() => {
                  setSuccess('Avatar updated successfully!');
                  refreshUser();
                }}
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <ul className="list-disc list-inside text-red-600">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="profile.firstName"
                    value={formData.profile?.firstName || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="profile.lastName"
                    value={formData.profile?.lastName || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="profile.displayName"
                    value={formData.profile?.displayName || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="profile.occupation"
                    value={formData.profile?.occupation || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="profile.bio"
                  value={formData.profile?.bio || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {/* Rural Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rural Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Type
                  </label>
                  <input
                    type="text"
                    name="profile.farmType"
                    value={formData.profile?.farmType || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="e.g., Cattle, Crops, Mixed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <input
                    type="text"
                    name="profile.businessType"
                    value={formData.profile?.businessType || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="e.g., Agricultural Services, Tourism"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years in Area
                  </label>
                  <input
                    type="number"
                    name="profile.yearsInArea"
                    value={formData.profile?.yearsInArea || 0}
                    onChange={handleChange}
                    disabled={!isEditing}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family Size
                  </label>
                  <input
                    type="number"
                    name="profile.familySize"
                    value={formData.profile?.familySize || 0}
                    onChange={handleChange}
                    disabled={!isEditing}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences.privacy.showLocation"
                    checked={formData.preferences?.privacy?.showLocation || false}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  Show my location to other community members
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences.privacy.showProfile"
                    checked={formData.preferences?.privacy?.showProfile || false}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  Make my profile visible to other users
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences.privacy.allowMatching"
                    checked={formData.preferences?.privacy?.allowMatching || false}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  Allow community matching suggestions
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferences.privacy.shareSkills"
                    checked={formData.preferences?.privacy?.shareSkills || false}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mr-2"
                  />
                  Share my skills with the community
                </label>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.notifications.email"
                      checked={formData.preferences?.notifications?.email || false}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    Email notifications
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.notifications.push"
                      checked={formData.preferences?.notifications?.push || false}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    Push notifications
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.notifications.sms"
                      checked={formData.preferences?.notifications?.sms || false}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    SMS notifications
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.notifications.emergency"
                      checked={formData.preferences?.notifications?.emergency || false}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    Emergency alerts
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.notifications.community"
                      checked={formData.preferences?.notifications?.community || false}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    Community updates
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.notifications.agricultural"
                      checked={formData.preferences?.notifications?.agricultural || false}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    Agricultural insights
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.notifications.business"
                      checked={formData.preferences?.notifications?.business || false}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    Business opportunities
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.notifications.wellbeing"
                      checked={formData.preferences?.notifications?.wellbeing || false}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mr-2"
                    />
                    Wellbeing resources
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Blockchain Credentials Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
        <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Blockchain Credentials</h2>
              <p className="text-sm text-gray-600 mt-1">
                Your verified achievements and contributions ({credentialCount} credential{credentialCount !== 1 ? 's' : ''})
              </p>
            </div>
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showCredentials ? 'Hide' : 'Show'} Credentials
            </button>
          </div>
        </div>

        {showCredentials && (
          <div className="p-6">
            <CredentialGallery />
          </div>
        )}
      </div>
    </div>
  );
};