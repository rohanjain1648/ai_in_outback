/**
 * Interests Setup Step - Fourth step of onboarding
 */

import React from 'react';
import { motion } from 'framer-motion';
import { OnboardingData } from '../OnboardingFlow';

interface InterestsSetupStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: Partial<OnboardingData>) => void;
  isLoading: boolean;
}

export const InterestsSetupStep: React.FC<InterestsSetupStepProps> = ({
  data,
  onNext,
  onPrevious,
  onDataChange,
  isLoading
}) => {
  const interestCategories = [
    {
      category: 'Agriculture & Farming',
      interests: [
        'Crop Farming',
        'Livestock',
        'Sustainable Agriculture',
        'Organic Farming',
        'Agricultural Technology',
        'Farm Management',
        'Irrigation',
        'Soil Health'
      ]
    },
    {
      category: 'Community & Social',
      interests: [
        'Community Events',
        'Volunteering',
        'Local Government',
        'Neighborhood Watch',
        'Social Groups',
        'Cultural Activities',
        'Sports & Recreation',
        'Youth Programs'
      ]
    },
    {
      category: 'Business & Economy',
      interests: [
        'Small Business',
        'Entrepreneurship',
        'Local Markets',
        'Tourism',
        'Economic Development',
        'Cooperatives',
        'Trade & Commerce',
        'Innovation'
      ]
    },
    {
      category: 'Environment & Conservation',
      interests: [
        'Environmental Conservation',
        'Wildlife Protection',
        'Renewable Energy',
        'Water Management',
        'Climate Action',
        'Biodiversity',
        'Land Care',
        'Sustainability'
      ]
    },
    {
      category: 'Health & Wellbeing',
      interests: [
        'Mental Health',
        'Physical Fitness',
        'Nutrition',
        'Healthcare Access',
        'Aged Care',
        'Disability Support',
        'Wellness Programs',
        'Alternative Medicine'
      ]
    },
    {
      category: 'Education & Skills',
      interests: [
        'Adult Education',
        'Vocational Training',
        'Digital Literacy',
        'Traditional Skills',
        'Mentoring',
        'Workshops',
        'Online Learning',
        'Skill Sharing'
      ]
    }
  ];

  const handleInterestToggle = (interest: string) => {
    const currentInterests = data.interests || [];
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];

    onDataChange({
      interests: updatedInterests
    });
  };

  const selectedInterests = data.interests || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What are you interested in?
        </h2>
        <p className="text-gray-600">
          Select your interests to help us personalize your experience and connect you with like-minded community members
        </p>
      </div>

      <div className="space-y-6">
        {interestCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h3 className="font-semibold text-gray-900 mb-3">{category.category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {category.interests.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-green-600 text-xl">💡</span>
          <div>
            <h4 className="font-medium text-green-900 mb-1">
              Selected: {selectedInterests.length} interests
            </h4>
            <p className="text-sm text-green-800">
              You can always update your interests later in your profile settings. 
              The more interests you select, the better we can match you with relevant content and community members.
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