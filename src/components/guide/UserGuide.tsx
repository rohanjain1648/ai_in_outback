/**
 * Interactive User Guide Component
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: {
    title: string;
    content: string;
    image?: string;
    tips?: string[];
  }[];
}

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [activeStep, setActiveStep] = useState<number>(0);

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      description: 'Learn the basics of Rural Connect AI',
      steps: [
        {
          title: 'Welcome to Rural Connect AI',
          content: 'Rural Connect AI is your comprehensive platform for connecting with your rural community, accessing agricultural intelligence, and finding local resources.',
          tips: [
            'Complete your profile for better recommendations',
            'Enable location services for local content',
            'Join relevant community groups'
          ]
        },
        {
          title: 'Setting Up Your Profile',
          content: 'Your profile helps us provide personalized recommendations and connect you with relevant community members.',
          tips: [
            'Add your location for local content',
            'List your interests and skills',
            'Upload a profile photo',
            'Set your privacy preferences'
          ]
        },
        {
          title: 'Exploring the Dashboard',
          content: 'The main dashboard gives you quick access to all platform features including agricultural data, community chat, and local resources.',
          tips: [
            'Use the navigation menu to switch between features',
            'Check notifications regularly',
            'Customize your dashboard layout'
          ]
        }
      ]
    },
    {
      id: 'agricultural-dashboard',
      title: 'Agricultural Intelligence',
      icon: '🚜',
      description: 'Make data-driven farming decisions',
      steps: [
        {
          title: 'Farm Profile Setup',
          content: 'Create your farm profile to receive personalized agricultural recommendations and track your farming operations.',
          tips: [
            'Add all your crops and livestock',
            'Set up field boundaries',
            'Connect weather monitoring devices',
            'Enable market price alerts'
          ]
        },
        {
          title: 'Weather & Climate Data',
          content: 'Access real-time weather data, forecasts, and climate information specific to your location.',
          tips: [
            'Check daily weather before planning activities',
            'Set up severe weather alerts',
            'Review seasonal climate patterns',
            'Use historical data for planning'
          ]
        },
        {
          title: 'Crop Analysis & Monitoring',
          content: 'Use AI-powered crop analysis to monitor plant health, detect diseases, and optimize growing conditions.',
          tips: [
            'Take regular photos of your crops',
            'Upload images for AI analysis',
            'Track growth stages',
            'Monitor for pest and disease signs'
          ]
        },
        {
          title: 'Market Intelligence',
          content: 'Stay informed about commodity prices, market trends, and selling opportunities.',
          tips: [
            'Set price alerts for your commodities',
            'Track market trends over time',
            'Find local buyers and markets',
            'Compare prices across regions'
          ]
        }
      ]
    },
    {
      id: 'community-features',
      title: 'Community & Communication',
      icon: '👥',
      description: 'Connect with your rural community',
      steps: [
        {
          title: 'Finding Community Members',
          content: 'Discover and connect with other community members based on location, interests, and expertise.',
          tips: [
            'Use location-based search',
            'Filter by interests and skills',
            'Join local community groups',
            'Attend virtual and in-person events'
          ]
        },
        {
          title: 'Real-time Chat & Messaging',
          content: 'Communicate with community members through individual chats and group conversations.',
          tips: [
            'Create topic-specific chat groups',
            'Use voice and video calls',
            'Share photos and documents',
            'Set notification preferences'
          ]
        },
        {
          title: 'Skills Sharing Network',
          content: 'Share your expertise and learn from others in your community.',
          tips: [
            'List your skills and expertise',
            'Offer to teach or mentor others',
            'Find learning opportunities',
            'Schedule skills exchange sessions'
          ]
        }
      ]
    },
    {
      id: 'resources-business',
      title: 'Resources & Business',
      icon: '💼',
      description: 'Discover local resources and business opportunities',
      steps: [
        {
          title: 'Resource Discovery',
          content: 'Find local resources, services, and equipment available in your community.',
          tips: [
            'Use advanced search filters',
            'Save frequently used resources',
            'Rate and review resources',
            'Submit new resource listings'
          ]
        },
        {
          title: 'Business Directory',
          content: 'Discover local businesses and create your own business profile.',
          tips: [
            'Create a detailed business profile',
            'Add photos and contact information',
            'List your services and capabilities',
            'Connect with other businesses'
          ]
        },
        {
          title: 'Economic Opportunities',
          content: 'Stay informed about grants, funding opportunities, and economic development programs.',
          tips: [
            'Set up opportunity alerts',
            'Apply for relevant programs',
            'Network with other entrepreneurs',
            'Share success stories'
          ]
        }
      ]
    },
    {
      id: 'wellbeing-support',
      title: 'Mental Health & Wellbeing',
      icon: '💚',
      description: 'Access mental health resources and support',
      steps: [
        {
          title: 'Wellbeing Check-ins',
          content: 'Track your mental health and wellbeing with regular check-ins and mood tracking.',
          tips: [
            'Complete daily check-ins honestly',
            'Track mood patterns over time',
            'Set wellbeing goals',
            'Use insights to improve mental health'
          ]
        },
        {
          title: 'Support Network',
          content: 'Connect with peer support networks and mental health professionals.',
          tips: [
            'Join anonymous support groups',
            'Connect with trained peer supporters',
            'Access crisis intervention resources',
            'Find local mental health services'
          ]
        },
        {
          title: 'Resources & Crisis Support',
          content: 'Access mental health resources, telehealth services, and crisis support.',
          tips: [
            'Save important crisis numbers',
            'Know how to access emergency support',
            'Use telehealth services when needed',
            'Share resources with others who might need help'
          ]
        }
      ]
    },
    {
      id: 'mobile-offline',
      title: 'Mobile & Offline Features',
      icon: '📱',
      description: 'Use the platform on mobile and offline',
      steps: [
        {
          title: 'Mobile Optimization',
          content: 'The platform is fully optimized for mobile devices with touch-friendly controls and responsive design.',
          tips: [
            'Install as a Progressive Web App (PWA)',
            'Use touch gestures for navigation',
            'Enable mobile notifications',
            'Use camera for crop analysis'
          ]
        },
        {
          title: 'Offline Functionality',
          content: 'Access essential features even when you don\'t have internet connectivity.',
          tips: [
            'Sync data when connected',
            'Access cached emergency information',
            'Use offline maps and contacts',
            'Queue actions for when you\'re back online'
          ]
        },
        {
          title: 'Performance Optimization',
          content: 'The platform automatically adjusts performance based on your device and connection.',
          tips: [
            'Enable adaptive quality for 3D features',
            'Use data-saving mode on limited connections',
            'Clear cache if experiencing issues',
            'Update the app regularly'
          ]
        }
      ]
    }
  ];

  const currentSection = guideSections.find(section => section.id === activeSection);
  const currentStep = currentSection?.steps[activeStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">User Guide</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Learn how to make the most of Rural Connect AI
                </p>
              </div>

              <div className="p-4">
                <nav className="space-y-2">
                  {guideSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        setActiveStep(0);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{section.icon}</span>
                        <div>
                          <div className="font-medium">{section.title}</div>
                          <div className="text-sm text-gray-500">{section.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {currentSection && currentStep && (
                <>
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-3xl">{currentSection.icon}</span>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {currentSection.title}
                      </h3>
                    </div>
                    <p className="text-gray-600">{currentSection.description}</p>
                    
                    {/* Step Progress */}
                    <div className="flex items-center space-x-2 mt-4">
                      {currentSection.steps.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveStep(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === activeStep
                              ? 'bg-blue-600'
                              : index < activeStep
                              ? 'bg-green-600'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        Step {activeStep + 1} of {currentSection.steps.length}
                      </span>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <motion.div
                      key={`${activeSection}-${activeStep}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">
                        {currentStep.title}
                      </h4>
                      
                      <div className="prose max-w-none mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          {currentStep.content}
                        </p>
                      </div>

                      {currentStep.tips && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                          <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                            <span className="mr-2">💡</span>
                            Pro Tips
                          </h5>
                          <ul className="space-y-2">
                            {currentStep.tips.map((tip, index) => (
                              <li key={index} className="text-blue-800 text-sm flex items-start">
                                <span className="text-blue-600 mr-2 mt-1">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Navigation */}
                  <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (activeStep > 0) {
                          setActiveStep(activeStep - 1);
                        } else {
                          const currentIndex = guideSections.findIndex(s => s.id === activeSection);
                          if (currentIndex > 0) {
                            const prevSection = guideSections[currentIndex - 1];
                            setActiveSection(prevSection.id);
                            setActiveStep(prevSection.steps.length - 1);
                          }
                        }
                      }}
                      disabled={activeSection === guideSections[0].id && activeStep === 0}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>←</span>
                      <span>Previous</span>
                    </button>

                    <div className="text-sm text-gray-500">
                      {guideSections.findIndex(s => s.id === activeSection) + 1} of {guideSections.length} sections
                    </div>

                    <button
                      onClick={() => {
                        if (activeStep < currentSection.steps.length - 1) {
                          setActiveStep(activeStep + 1);
                        } else {
                          const currentIndex = guideSections.findIndex(s => s.id === activeSection);
                          if (currentIndex < guideSections.length - 1) {
                            const nextSection = guideSections[currentIndex + 1];
                            setActiveSection(nextSection.id);
                            setActiveStep(0);
                          }
                        }
                      }}
                      disabled={
                        activeSection === guideSections[guideSections.length - 1].id &&
                        activeStep === currentSection.steps.length - 1
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <span>→</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};