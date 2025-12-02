/**
 * Privacy Setup Step - Sixth step of onboarding
 */

import React from 'react';
import { motion } from 'framer-motion';
import { OnboardingData } from '../OnboardingFlow';

interface PrivacySetupStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: Partial<OnboardingData>) => void;
  isLoading: boolean;
}

export const PrivacySetupStep: React.FC<PrivacySetupStepProps> = ({
  data,
  onNext,
  onPrevious,
  onDataChange,
  isLoading
}) => {
  const handlePrivacyChange = (field: keyof OnboardingData['privacy'], value: boolean) => {
    onDataChange({
      privacy: {
        ...data.privacy,
        [field]: value
      }
    });
  };

  const privacySettings = [
    {
      key: 'profileVisibility' as keyof OnboardingData['privacy'],
      title: 'Profile Visibility',
      description: 'Allow other community members to view your profile',
      defaultValue: true,
      icon: '👤'
    },
    {
      key: 'locationSharing' as keyof OnboardingData['privacy'],
      title: 'Location Sharing',
      description: 'Share your general location (region/state) with other members',
      defaultValue: true,
      icon: '📍'
    },
    {
      key: 'skillsVisibility' as keyof OnboardingData['privacy'],
      title: 'Skills Visibility',
      description: 'Show your skills to help others find your expertise',
      defaultValue: true,
      icon: '🛠️'
    },
    {
      key: 'contactability' as keyof OnboardingData['privacy'],
      title: 'Contact Permissions',
      description: 'Allow other members to contact you directly',
      defaultValue: true,
      icon: '💬'
    },
    {
      key: 'activityVisibility' as keyof OnboardingData['privacy'],
      title: 'Activity Visibility',
      description: 'Show your activity status and recent interactions',
      defaultValue: false,
      icon: '📊'
    },
    {
      key: 'dataCollection' as keyof OnboardingData['privacy'],
      title: 'Analytics & Improvement',
      description: 'Allow anonymous data collection to help improve the platform',
      defaultValue: true,
      icon: '📈'
    },
    {
      key: 'marketingConsent' as keyof OnboardingData['privacy'],
      title: 'Marketing Communications',
      description: 'Receive updates about new features and community events',
      defaultValue: false,
      icon: '📧'
    }
  ];

  // Initialize privacy settings with defaults if not set
  React.useEffect(() => {
    const currentPrivacy = data.privacy || {};
    const hasAllSettings = privacySettings.every(setting => 
      setting.key in currentPrivacy
    );

    if (!hasAllSettings) {
      const defaultPrivacy = privacySettings.reduce((acc, setting) => ({
        ...acc,
        [setting.key]: currentPrivacy[setting.key] ?? setting.defaultValue
      }), {});

      onDataChange({ privacy: defaultPrivacy });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Privacy & Permissions
        </h2>
        <p className="text-gray-600">
          Control how your information is shared and used on the platform
        </p>
      </div>

      <div className="space-y-4">
        {privacySettings.map((setting, index) => (
          <motion.div
            key={setting.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-2xl">{setting.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {setting.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {setting.description}
                  </p>
                </div>
              </div>
              <label className="flex items-center ml-4">
                <input
                  type="checkbox"
                  checked={data.privacy?.[setting.key] ?? setting.defaultValue}
                  onChange={(e) => handlePrivacyChange(setting.key, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                />
              </label>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">🔒</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Your Privacy Matters</h4>
            <p className="text-sm text-blue-800">
              You can change these settings at any time in your account preferences. 
              We're committed to protecting your privacy and will never share your personal information 
              with third parties without your explicit consent.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Recommended Settings</h4>
            <p className="text-sm text-yellow-800">
              For the best community experience, we recommend enabling profile visibility, 
              location sharing, and skills visibility. This helps you connect with relevant 
              community members and opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );
};