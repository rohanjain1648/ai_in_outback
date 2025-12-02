/**
 * Feature Tour Step - Seventh step of onboarding
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingData } from '../OnboardingFlow';

interface FeatureTourStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: Partial<OnboardingData>) => void;
  isLoading: boolean;
}

export const FeatureTourStep: React.FC<FeatureTourStepProps> = ({
  data,
  onNext,
  onPrevious,
  onDataChange,
  isLoading
}) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: '3D Australian Landscape',
      icon: '🌏',
      description: 'Explore an interactive 3D representation of the Australian landscape with dynamic weather, native flora, and regional variations.',
      highlights: [
        'Real-time weather effects',
        'Native Australian plants and trees',
        'Day/night cycle simulation',
        'Mobile-optimized touch controls'
      ],
      color: 'green'
    },
    {
      title: 'Agricultural Intelligence',
      icon: '🚜',
      description: 'Access AI-powered farming insights, crop analysis, weather data, and market intelligence to make informed agricultural decisions.',
      highlights: [
        'Crop health monitoring with AI',
        'Real-time weather and climate data',
        'Market price tracking and alerts',
        'Farming recommendations engine'
      ],
      color: 'blue'
    },
    {
      title: 'Community Connection',
      icon: '👥',
      description: 'Connect with local community members, join groups, participate in real-time chat, and build meaningful relationships.',
      highlights: [
        'Location-based member discovery',
        'Real-time messaging and video calls',
        'Community groups and events',
        'Skills sharing network'
      ],
      color: 'purple'
    },
    {
      title: 'Resource Discovery',
      icon: '🔍',
      description: 'Find local resources, services, and businesses in your area with AI-powered search and recommendations.',
      highlights: [
        'Advanced search with AI',
        'Local business directory',
        'Resource sharing platform',
        'Economic opportunity alerts'
      ],
      color: 'orange'
    },
    {
      title: 'Mental Health Support',
      icon: '💚',
      description: 'Access mental health resources, wellbeing tracking, peer support networks, and crisis intervention services.',
      highlights: [
        'Daily wellbeing check-ins',
        'Anonymous peer support',
        'Mental health resource directory',
        '24/7 crisis support access'
      ],
      color: 'pink'
    },
    {
      title: 'Cultural Heritage',
      icon: '📚',
      description: 'Share and discover cultural stories, preserve local heritage, and connect with your community\'s history.',
      highlights: [
        'Multimedia story creation',
        'AI-powered story categorization',
        'Heritage preservation tools',
        'Community story sharing'
      ],
      color: 'amber'
    }
  ];

  const currentFeatureData = features[currentFeature];

  const handleNext = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    } else {
      onPrevious();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Discover Platform Features
        </h2>
        <p className="text-gray-600">
          Let's take a quick tour of what Rural Connect AI can do for you
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFeature(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentFeature
                ? 'bg-blue-600'
                : index < currentFeature
                ? 'bg-green-600'
                : 'bg-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-500 ml-4">
          {currentFeature + 1} of {features.length}
        </span>
      </div>

      {/* Feature Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-8"
        >
          <div className="text-center mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full bg-${currentFeatureData.color}-100 flex items-center justify-center mb-4`}>
              <span className="text-4xl">{currentFeatureData.icon}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentFeatureData.title}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {currentFeatureData.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentFeatureData.highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg bg-${currentFeatureData.color}-50`}
              >
                <span className={`text-${currentFeatureData.color}-600`}>✓</span>
                <span className={`text-${currentFeatureData.color}-800 text-sm`}>
                  {highlight}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Pro Tip</h4>
            <p className="text-sm text-blue-800">
              {currentFeature === 0 && "The 3D landscape adapts to your device performance automatically. Enable location services for region-specific content."}
              {currentFeature === 1 && "Upload photos of your crops for AI analysis. Set up price alerts for commodities you're interested in."}
              {currentFeature === 2 && "Complete your profile to get better community member matches. Join local groups to stay connected."}
              {currentFeature === 3 && "Use specific keywords in search for better results. Save frequently used resources for quick access."}
              {currentFeature === 4 && "Daily check-ins help track your wellbeing trends. All peer support interactions are anonymous and secure."}
              {currentFeature === 5 && "Add photos, videos, and audio to make your stories more engaging. Tag stories with relevant topics."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handlePrevious}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          {currentFeature === 0 ? 'Back to Privacy' : 'Previous Feature'}
        </button>
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentFeature === features.length - 1 
            ? (isLoading ? 'Finishing...' : 'Complete Setup') 
            : 'Next Feature'
          }
        </button>
      </div>
    </motion.div>
  );
};