import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandscapeDemo } from './components/three/LandscapeDemo';
import AgriculturalDashboard from './components/AgriculturalDashboard';
import BusinessDirectory from './components/BusinessDirectory';
import { CulturalHeritageDashboard } from './components/CulturalHeritageDashboard';
import WellbeingDashboard from './components/WellbeingDashboard';
import ChatList from './components/chat/ChatList';
import MainLayout from './components/layout/MainLayout';
import { ExampleMobileNavigation } from './components/mobile/MobileNavigation';
import MobileThreeOptimizer from './components/mobile/MobileThreeOptimizer';
import TouchButton from './components/mobile/TouchButton';
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

  if (currentView === 'landscape') {
    return (
      <MobileThreeOptimizer
        enableAdaptiveQuality={true}
        enablePerformanceMonitoring={true}
        targetFPS={deviceInfo.isMobile ? 30 : 60}
      >
        <LandscapeDemo />
      </MobileThreeOptimizer>
    );
  }

  if (currentView === 'agriculture') {
    return <AgriculturalDashboard />;
  }

  if (currentView === 'business') {
    return <BusinessDirectory />;
  }

  if (currentView === 'culture') {
    return <CulturalHeritageDashboard />;
  }

  if (currentView === 'wellbeing') {
    return <WellbeingDashboard />;
  }

  if (currentView === 'chat') {
    return (
      <MainLayout>
        <ChatList />
      </MainLayout>
    );
  }

  if (currentView === 'admin') {
    return <AdminDashboard />;
  }

  if (currentView === 'onboarding') {
    return <OnboardingFlow />;
  }

  return (
    <>
      <SkipToContent />
      <MainLayout currentView={currentView} onViewChange={setCurrentView}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className={`font-display font-bold text-eucalyptus-800 mb-4 ${deviceInfo.isMobile ? 'text-2xl sm:text-3xl' : 'text-4xl md:text-6xl'
            }`}>
            Rural Connect AI
          </h1>
          <p className={`text-bushland-700 mb-8 max-w-2xl mx-auto ${deviceInfo.isMobile ? 'text-base' : 'text-lg md:text-xl'
            }`}>
            Intelligent community platform for regional and rural Australia
          </p>

          <motion.div
            className={`mx-auto bg-eucalyptus-500 rounded-full flex items-center justify-center mb-8 ${deviceInfo.isMobile ? 'w-16 h-16' : 'w-24 h-24'
              }`}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div className={`bg-outback-400 rounded-full ${deviceInfo.isMobile ? 'w-10 h-10' : 'w-16 h-16'
              }`}></div>
          </motion.div>

          <div className="space-y-4">
            <p className="text-bushland-600">
              Mobile-optimized platform with responsive design!
            </p>

            {/* Mobile Navigation */}
            {deviceInfo.isMobile ? (
              <ExampleMobileNavigation
                currentView={currentView}
                onViewChange={setCurrentView}
                unreadMessages={0}
              />
            ) : (
              /* Desktop buttons */
              <div className="flex flex-wrap justify-center gap-4">
                <TouchButton
                  onClick={() => setCurrentView('landscape')}
                  variant="primary"
                  size="lg"
                  className="bg-eucalyptus-600 hover:bg-eucalyptus-700"
                >
                  🌏 Explore Australian Landscape
                </TouchButton>

                <TouchButton
                  onClick={() => setCurrentView('agriculture')}
                  variant="primary"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  🚜 Agricultural Dashboard
                </TouchButton>

                <TouchButton
                  onClick={() => setCurrentView('business')}
                  variant="primary"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🏢 Business Directory
                </TouchButton>

                <TouchButton
                  onClick={() => setCurrentView('culture')}
                  variant="primary"
                  size="lg"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  📚 Cultural Heritage
                </TouchButton>

                <TouchButton
                  onClick={() => setCurrentView('wellbeing')}
                  variant="primary"
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  💚 Mental Health & Wellbeing
                </TouchButton>

                <TouchButton
                  onClick={() => setCurrentView('chat')}
                  variant="primary"
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  💬 Real-time Chat & Calls
                </TouchButton>

                <TouchButton
                  onClick={() => setCurrentView('admin')}
                  variant="primary"
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                >
                  ⚙️ Admin Dashboard
                </TouchButton>
              </div>
            )}

            {/* Help & Support Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <TouchButton
                onClick={() => setShowUserGuide(true)}
                variant="secondary"
                size="md"
                className="bg-gray-600 hover:bg-gray-700"
              >
                📖 User Guide
              </TouchButton>

              <TouchButton
                onClick={() => setShowFeedback(true)}
                variant="secondary"
                size="md"
                className="bg-gray-600 hover:bg-gray-700"
              >
                💬 Send Feedback
              </TouchButton>

              <TouchButton
                onClick={() => setCurrentView('onboarding')}
                variant="secondary"
                size="md"
                className="bg-gray-600 hover:bg-gray-700"
              >
                🚀 Take Tour
              </TouchButton>
            </div>

            {/* Feature overview - responsive grid */}
            <div className={`mt-8 gap-6 text-sm text-bushland-500 max-w-8xl mx-auto ${deviceInfo.isMobile
              ? 'grid grid-cols-1 space-y-6'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              }`}>
              <div>
                <h3 className="font-semibold mb-2">🌏 3D Landscape Features:</h3>
                <ul className="text-left space-y-1">
                  <li>✅ Dynamic terrain generation with regional variations</li>
                  <li>✅ Time-based lighting system (24-hour cycle)</li>
                  <li>✅ Weather effects (rain, clouds, wind)</li>
                  <li>✅ Native Australian flora (eucalyptus, wattle, bushes)</li>
                  <li>✅ Mobile-optimized touch controls</li>
                  <li>✅ Adaptive performance optimization</li>
                  <li>✅ Interactive controls and presets</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🚜 Agricultural Intelligence:</h3>
                <ul className="text-left space-y-1">
                  <li>✅ Farm profile management with crops & livestock</li>
                  <li>✅ Real-time weather data & agricultural conditions</li>
                  <li>✅ Mobile camera crop photo analysis</li>
                  <li>✅ Market price tracking & alerts</li>
                  <li>✅ Farming recommendations engine</li>
                  <li>✅ Crop health monitoring & disease detection</li>
                  <li>✅ Touch-friendly dashboard interface</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">💼 Business Directory:</h3>
                <ul className="text-left space-y-1">
                  <li>✅ Business profile creation & management</li>
                  <li>✅ AI-powered business-to-business matching</li>
                  <li>✅ Location-based business discovery</li>
                  <li>✅ Business verification & rating system</li>
                  <li>✅ Economic opportunity notifications</li>
                  <li>✅ Mobile-optimized analytics dashboard</li>
                  <li>✅ Touch-friendly search & filtering</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">📚 Cultural Heritage:</h3>
                <ul className="text-left space-y-1">
                  <li>✅ Cultural story creation with multimedia support</li>
                  <li>✅ AI-powered story categorization & tagging</li>
                  <li>✅ Story recommendation engine</li>
                  <li>✅ Mobile multimedia upload & management</li>
                  <li>✅ Story connection & relationship mapping</li>
                  <li>✅ Mobile-optimized 3D story presentation</li>
                  <li>✅ Community story contribution & curation</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">💚 Mental Health & Wellbeing:</h3>
                <ul className="text-left space-y-1">
                  <li>✅ Daily wellbeing check-in & mood tracking</li>
                  <li>✅ AI-powered risk assessment & support identification</li>
                  <li>✅ Anonymous peer support network matching</li>
                  <li>✅ Mental health resource directory with telehealth</li>
                  <li>✅ Crisis intervention & professional referral system</li>
                  <li>✅ Mobile-optimized wellbeing trends visualization</li>
                  <li>✅ 24/7 crisis resources & emergency support</li>
                </ul>
              </div>

              {/* New mobile optimization features */}
              <div className={deviceInfo.isMobile ? 'col-span-1' : 'col-span-full'}>
                <h3 className="font-semibold mb-2">📱 Mobile Optimization Features:</h3>
                <ul className="text-left space-y-1">
                  <li>✅ Responsive design for all screen sizes</li>
                  <li>✅ Touch-friendly navigation and interaction patterns</li>
                  <li>✅ Mobile camera integration for photo analysis</li>
                  <li>✅ Adaptive Three.js performance optimization</li>
                  <li>✅ Mobile-optimized offline functionality</li>
                  <li>✅ Touch gestures and haptic feedback</li>
                  <li>✅ Progressive Web App (PWA) capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

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
      </MainLayout>

      {/* Accessibility Button */}
      <AccessibilityButton />
    </>
  );
};

export default App;