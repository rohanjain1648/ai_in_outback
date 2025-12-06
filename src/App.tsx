import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LandscapeDemo } from './components/three/LandscapeDemo';
import AgriculturalDashboard from './components/AgriculturalDashboard';
import BusinessDirectory from './components/BusinessDirectory';
import { CulturalHeritageDashboard } from './components/CulturalHeritageDashboard';
import WellbeingDashboard from './components/WellbeingDashboard';
import ChatList from './components/chat/ChatList';
import MainLayout from './components/layout/MainLayout';
import MobileThreeOptimizer from './components/mobile/MobileThreeOptimizer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { FeedbackSystem } from './components/feedback/FeedbackSystem';
import { UserGuide } from './components/guide/UserGuide';
import { socketService } from './services/socketService';
import { notificationService } from './services/notificationService';
import { useDeviceDetection } from './utils/mobileDetection';
import { SkipToContent, AccessibilityButton } from './components/accessibility';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'landscape' | 'agriculture' | 'business' | 'culture' | 'wellbeing' | 'chat' | 'admin' | 'onboarding'>('home');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const deviceInfo = useDeviceDetection();

  // Check if user needs onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding) {
      setCurrentView('onboarding');
    }
  }, []);

  // Initialize real-time services
  useEffect(() => {
    // Request notification permission on app start
    notificationService.requestPermission().then((granted) => {
      if (granted) {
        console.log('Notification permission granted');
        // Optionally subscribe to push notifications
        notificationService.subscribeToPushNotifications().catch(console.error);
      }
    });

    // Initialize socket connection status logging
    socketService.on('connected', () => {
      console.log('Real-time connection established');
    });

    socketService.on('disconnected', (reason) => {
      console.log('Real-time connection lost:', reason);
    });

    socketService.on('connection_error', (error) => {
      console.error('Real-time connection error:', error);
    });

    return () => {
      // Cleanup listeners on unmount
      socketService.off('connected');
      socketService.off('disconnected');
      socketService.off('connection_error');
    };
  }, []);

  // Back button component for feature pages - positioned in top-right for better UX
  const BackButton = () => (
    <button
      onClick={() => setCurrentView('home')}
      className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:shadow-xl font-medium"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Home
    </button>
  );

  if (currentView === 'landscape') {
    return (
      <>
        <BackButton />
        <MobileThreeOptimizer
          enableAdaptiveQuality={true}
          enablePerformanceMonitoring={true}
          targetFPS={deviceInfo.isMobile ? 30 : 60}
        >
          <LandscapeDemo />
        </MobileThreeOptimizer>
      </>
    );
  }

  if (currentView === 'agriculture') {
    return (
      <>
        <BackButton />
        <AgriculturalDashboard />
      </>
    );
  }

  if (currentView === 'business') {
    return (
      <>
        <BackButton />
        <BusinessDirectory />
      </>
    );
  }

  if (currentView === 'culture') {
    return (
      <>
        <BackButton />
        <CulturalHeritageDashboard />
      </>
    );
  }

  if (currentView === 'wellbeing') {
    return (
      <>
        <BackButton />
        <WellbeingDashboard />
      </>
    );
  }

  if (currentView === 'chat') {
    return (
      <>
        <BackButton />
        <MainLayout>
          <ChatList />
        </MainLayout>
      </>
    );
  }

  if (currentView === 'admin') {
    return (
      <>
        <BackButton />
        <AdminDashboard />
      </>
    );
  }

  if (currentView === 'onboarding') {
    return <OnboardingFlow />;
  }

  // Feature cards data
  const features = [
    {
      id: 'landscape',
      icon: '🌏',
      title: '3D Landscape',
      description: 'Explore dynamic Australian terrain with real-time weather',
      color: 'from-green-500 to-emerald-600',
      view: 'landscape' as const
    },
    {
      id: 'agriculture',
      icon: '🚜',
      title: 'Agriculture',
      description: 'Farm management, crop monitoring & market insights',
      color: 'from-lime-500 to-green-600',
      view: 'agriculture' as const
    },
    {
      id: 'business',
      icon: '🏢',
      title: 'Business',
      description: 'Directory, matching & economic opportunities',
      color: 'from-blue-500 to-indigo-600',
      view: 'business' as const
    },
    {
      id: 'culture',
      icon: '📚',
      title: 'Cultural Heritage',
      description: 'Stories, traditions & community knowledge',
      color: 'from-amber-500 to-orange-600',
      view: 'culture' as const
    },
    {
      id: 'wellbeing',
      icon: '💚',
      title: 'Wellbeing',
      description: 'Mental health support & community care',
      color: 'from-purple-500 to-pink-600',
      view: 'wellbeing' as const
    },
    {
      id: 'admin',
      icon: '⚙️',
      title: 'Admin',
      description: 'Platform management & analytics',
      color: 'from-gray-500 to-slate-600',
      view: 'admin' as const
    }
  ];

  return (
    <>
      <SkipToContent />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-amber-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">RC</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Rural Connect AI</h1>
                  <p className="text-xs text-gray-600">Empowering Rural Communities</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUserGuide(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="User Guide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Send Feedback"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentView('onboarding')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <span>Take Tour</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to Rural Connect AI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your intelligent platform for community connection, agricultural innovation, and rural prosperity
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setCurrentView(feature.view)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden text-left"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                {/* Content */}
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl shadow-lg`}>
                      {feature.icon}
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Platform Capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">6</div>
                <div className="text-sm text-gray-600">Core Features</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">AI</div>
                <div className="text-sm text-gray-600">Powered Insights</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-1">100%</div>
                <div className="text-sm text-gray-600">Mobile Optimized</div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Feedback System */}
        <FeedbackSystem
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
        />

        {/* User Guide */}
        <UserGuide
          isOpen={showUserGuide}
          onClose={() => setShowUserGuide(false)}
        />

        {/* Accessibility Button */}
        <AccessibilityButton />
      </div>
    </>
  );
};

export default App;