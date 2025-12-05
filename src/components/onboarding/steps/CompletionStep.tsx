/**
 * Completion Step - Final step of onboarding
 */

import React from 'react';
import { motion } from 'framer-motion';
import { OnboardingData } from '../OnboardingFlow';

interface CompletionStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: Partial<OnboardingData>) => void;
  isLoading: boolean;
  onComplete?: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  data,
  onNext,
  onPrevious,
  isLoading,
  onComplete
}) => {
  const getPersonalizedMessage = () => {
    const firstName = data.profile.firstName;
    const location = data.location.region || data.location.state;
    const interestCount = data.interests?.length || 0;
    const skillCount = data.skills?.length || 0;

    return {
      greeting: firstName ? `Welcome to Rural Connect AI, ${firstName}!` : 'Welcome to Rural Connect AI!',
      location: location ? `We're excited to connect you with your community in ${location}.` : 'We\'re excited to connect you with your rural community.',
      interests: interestCount > 0 ? `Based on your ${interestCount} interests, we'll show you relevant content and opportunities.` : '',
      skills: skillCount > 0 ? `Your ${skillCount} skills will help you connect with community members who need your expertise.` : ''
    };
  };

  const message = getPersonalizedMessage();

  const nextSteps = [
    {
      icon: '🏠',
      title: 'Explore Your Dashboard',
      description: 'Get familiar with your personalized dashboard and main navigation'
    },
    {
      icon: '👥',
      title: 'Connect with Community',
      description: 'Find and connect with community members who share your interests'
    },
    {
      icon: '🔍',
      title: 'Discover Resources',
      description: 'Search for local resources, services, and business opportunities'
    },
    {
      icon: '📱',
      title: 'Enable Notifications',
      description: 'Stay updated with community events, alerts, and messages'
    },
    {
      icon: '🌟',
      title: 'Share Your Story',
      description: 'Contribute to the community by sharing your experiences and knowledge'
    }
  ];

  const stats = {
    interests: data.interests?.length || 0,
    skills: data.skills?.length || 0,
    location: data.location.state ? 1 : 0,
    privacy: Object.values(data.privacy || {}).filter(Boolean).length
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-8"
    >
      {/* Success Animation */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <span className="text-4xl">🎉</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          {message.greeting}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-gray-600 mb-4"
        >
          {message.location}
        </motion.p>

        {(message.interests || message.skills) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-gray-600 space-y-1"
          >
            {message.interests && <p>{message.interests}</p>}
            {message.skills && <p>{message.skills}</p>}
          </motion.div>
        )}
      </div>

      {/* Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-blue-50 rounded-lg p-6"
      >
        <h3 className="font-semibold text-blue-900 mb-4 text-center">Your Profile Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.interests}</div>
            <div className="text-sm text-blue-800">Interests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.skills}</div>
            <div className="text-sm text-blue-800">Skills</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.location}</div>
            <div className="text-sm text-blue-800">Location Set</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.privacy}</div>
            <div className="text-sm text-blue-800">Privacy Settings</div>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4 text-center">What's Next?</h3>
        <div className="space-y-4">
          {nextSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">{step.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Support Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="bg-green-50 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <span className="text-green-600 text-xl">💚</span>
          <div>
            <h4 className="font-medium text-green-900 mb-1">Need Help?</h4>
            <p className="text-sm text-green-800 mb-2">
              We're here to support you on your Rural Connect AI journey. Here are some ways to get help:
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Access the User Guide from the main menu</li>
              <li>• Send feedback using the feedback button</li>
              <li>• Join the community support group</li>
              <li>• Contact our support team anytime</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
        className="flex justify-between pt-6"
      >
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back to Tour
        </button>
        <button
          onClick={onComplete || onNext}
          disabled={isLoading}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Setting up...</span>
            </div>
          ) : (
            'Start Using Rural Connect AI'
          )}
        </button>
      </motion.div>
    </motion.div>
  );
};