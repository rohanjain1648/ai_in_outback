/**
 * Welcome Step - First step of onboarding
 */

import React from 'react';
import { motion } from 'framer-motion';
import { OnboardingData } from '../OnboardingFlow';

interface WelcomeStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: Partial<OnboardingData>) => void;
  isLoading: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-3xl text-white">🌾</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Rural Connect AI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your intelligent community platform for regional and rural Australia
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-8 mb-8"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Let's get you started
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="text-left">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Connect with Community
            </h3>
            <p className="text-gray-600">
              Find like-minded people, share resources, and build meaningful connections
            </p>
          </div>
          
          <div className="text-left">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🚜</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Agricultural Intelligence
            </h3>
            <p className="text-gray-600">
              Get AI-powered farming insights, weather data, and crop monitoring
            </p>
          </div>
          
          <div className="text-left">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Skills & Learning
            </h3>
            <p className="text-gray-600">
              Share your expertise and learn new skills from community members
            </p>
          </div>
          
          <div className="text-left">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🚨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Emergency Support
            </h3>
            <p className="text-gray-600">
              Stay informed with real-time alerts and emergency response coordination
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Quick Setup - Just 5 minutes
          </h3>
          <p className="text-blue-700">
            We'll help you set up your profile, preferences, and connect you with your community. 
            You can always update these settings later.
          </p>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Get Started
        </button>
      </motion.div>

      <p className="text-sm text-gray-500">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};