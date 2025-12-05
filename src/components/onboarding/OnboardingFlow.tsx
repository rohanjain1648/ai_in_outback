/**
 * Comprehensive User Onboarding Flow
 * 
 * Guides new users through platform setup and feature discovery
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileSetupStep } from './steps/ProfileSetupStep';
import { LocationSetupStep } from './steps/LocationSetupStep';
import { InterestsSetupStep } from './steps/InterestsSetupStep';
import { SkillsSetupStep } from './steps/SkillsSetupStep';
import { PrivacySetupStep } from './steps/PrivacySetupStep';
import { FeatureTourStep } from './steps/FeatureTourStep';
import { CompletionStep } from './steps/CompletionStep';

export interface OnboardingData {
  profile: {
    firstName: string;
    lastName: string;
    bio: string;
    phoneNumber: string;
    dateOfBirth: string;
  };
  location: {
    postcode: string;
    state: string;
    region: string;
    town: string;
    allowLocationSharing: boolean;
  };
  interests: string[];
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    canTeach: boolean;
    wantsToLearn: boolean;
  }>;
  privacy: {
    profileVisibility: 'public' | 'community' | 'private';
    allowMatching: boolean;
    allowMessaging: boolean;
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
  };
}

const ONBOARDING_STEPS = [
  'welcome',
  'profile',
  'location',
  'interests',
  'skills',
  'privacy',
  'tour',
  'completion'
] as const;

type OnboardingStep = typeof ONBOARDING_STEPS[number];

export const OnboardingFlow: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    profile: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: '',
      phoneNumber: '',
      dateOfBirth: ''
    },
    location: {
      postcode: '',
      state: '',
      region: '',
      town: '',
      allowLocationSharing: true
    },
    interests: [],
    skills: [],
    privacy: {
      profileVisibility: 'community',
      allowMatching: true,
      allowMessaging: true,
      dataProcessingConsent: false,
      marketingConsent: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const currentStepIndex = ONBOARDING_STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(ONBOARDING_STEPS[nextIndex]);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(ONBOARDING_STEPS[prevIndex]);
    }
  };

  const handleStepData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save onboarding data to user profile (if updateProfile is available)
      if (updateProfile) {
        await updateProfile({
          ...onboardingData.profile,
          location: onboardingData.location,
          interests: onboardingData.interests,
          skills: onboardingData.skills,
          privacy: onboardingData.privacy,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString()
        });
      }

      // Mark onboarding as completed in localStorage
      localStorage.setItem('onboarding_completed', 'true');

      // Reload to home page
      window.location.reload();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still mark as completed even if profile update fails
      localStorage.setItem('onboarding_completed', 'true');
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      data: onboardingData,
      onNext: handleNext,
      onPrevious: handlePrevious,
      onDataChange: handleStepData,
      isLoading
    };

    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep {...stepProps} />;
      case 'profile':
        return <ProfileSetupStep {...stepProps} />;
      case 'location':
        return <LocationSetupStep {...stepProps} />;
      case 'interests':
        return <InterestsSetupStep {...stepProps} />;
      case 'skills':
        return <SkillsSetupStep {...stepProps} />;
      case 'privacy':
        return <PrivacySetupStep {...stepProps} />;
      case 'tour':
        return <FeatureTourStep {...stepProps} />;
      case 'completion':
        return <CompletionStep {...stepProps} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-green-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="px-4 py-2 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
          </div>
          <div className="text-sm font-medium text-gray-800">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4"
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};