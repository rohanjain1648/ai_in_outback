/**
 * Lazy-loaded Components
 * 
 * Defines lazy-loaded versions of major components to improve
 * initial bundle size and loading performance.
 */

import React from 'react';
import { createLazyRoute, preloadComponent } from '../utils/lazyLoading';

// Lazy load major dashboard components
export const LazyAgriculturalDashboard = createLazyRoute(
  () => import('./AgriculturalDashboard'),
  'Loading Agricultural Dashboard...'
);

export const LazyCommunityDashboard = createLazyRoute(
  () => import('./CommunityDashboard'),
  'Loading Community Dashboard...'
);

export const LazyBusinessDirectory = createLazyRoute(
  () => import('./BusinessDirectory'),
  'Loading Business Directory...'
);

export const LazyResourceSearch = createLazyRoute(
  () => import('./ResourceSearch'),
  'Loading Resource Search...'
);

export const LazySkillsDashboard = createLazyRoute(
  () => import('./SkillsDashboard'),
  'Loading Skills Dashboard...'
);

export const LazyWellbeingDashboard = createLazyRoute(
  () => import('./WellbeingDashboard'),
  'Loading Wellbeing Dashboard...'
);

export const LazyCulturalHeritageDashboard = createLazyRoute(
  () => import('./CulturalHeritageDashboard'),
  'Loading Cultural Heritage...'
);

export const LazyEmergencyDashboard = createLazyRoute(
  () => import('./EmergencyDashboard'),
  'Loading Emergency Dashboard...'
);

// Lazy load Three.js components (heavy components)
export const LazyAustralianLandscape = createLazyRoute(
  () => import('./three/AustralianLandscape'),
  'Loading 3D Landscape...'
);

export const LazyWeatherSystem = createLazyRoute(
  () => import('./three/WeatherSystem'),
  'Loading Weather System...'
);

export const LazyInteractiveMap = createLazyRoute(
  () => import('./InteractiveMap'),
  'Loading Interactive Map...'
);

// Lazy load form components
export const LazyResourceForm = createLazyRoute(
  () => import('./ResourceForm'),
  'Loading Form...'
);

export const LazyCommunityProfileSetup = createLazyRoute(
  () => import('./CommunityProfileSetup'),
  'Loading Profile Setup...'
);

export const LazyBusinessProfile = createLazyRoute(
  () => import('./BusinessProfile'),
  'Loading Business Profile...'
);

// Lazy load chat and communication components
export const LazyRealTimeChat = createLazyRoute(
  () => import('./chat/RealTimeChat'),
  'Loading Chat...'
);

export const LazyVideoCall = createLazyRoute(
  () => import('./webrtc/VideoCall'),
  'Loading Video Call...'
);

export const LazyNotificationCenter = createLazyRoute(
  () => import('./notifications/NotificationCenter'),
  'Loading Notifications...'
);

// Preload strategies for common user flows
export const preloadDashboardComponents = () => {
  // Preload likely next components based on user behavior
  preloadComponent(() => import('./ResourceSearch'));
  preloadComponent(() => import('./CommunityDashboard'));
};

export const preloadAgriculturalComponents = () => {
  preloadComponent(() => import('./AgriculturalDashboard'));
  preloadComponent(() => import('./three/WeatherSystem'));
  preloadComponent(() => import('./InteractiveMap'));
};

export const preloadCommunityComponents = () => {
  preloadComponent(() => import('./CommunityDashboard'));
  preloadComponent(() => import('./CommunityProfileSetup'));
  preloadComponent(() => import('./chat/RealTimeChat'));
};

export const preloadBusinessComponents = () => {
  preloadComponent(() => import('./BusinessDirectory'));
  preloadComponent(() => import('./BusinessProfile'));
  preloadComponent(() => import('./BusinessAnalytics'));
};

// Route-based preloading
export const routePreloadMap = {
  '/dashboard': preloadDashboardComponents,
  '/agriculture': preloadAgriculturalComponents,
  '/community': preloadCommunityComponents,
  '/business': preloadBusinessComponents,
  '/resources': () => preloadComponent(() => import('./ResourceSearch')),
  '/skills': () => preloadComponent(() => import('./SkillsDashboard')),
  '/wellbeing': () => preloadComponent(() => import('./WellbeingDashboard')),
  '/emergency': () => preloadComponent(() => import('./EmergencyDashboard')),
  '/culture': () => preloadComponent(() => import('./CulturalHeritageDashboard')),
};

// Hook for route-based preloading
export const useRoutePreloading = () => {
  React.useEffect(() => {
    const currentPath = window.location.pathname;
    const preloadFn = routePreloadMap[currentPath as keyof typeof routePreloadMap];
    
    if (preloadFn) {
      // Preload after a short delay to not interfere with current page loading
      setTimeout(preloadFn, 1000);
    }
  }, []);
};

// Component for managing lazy loading based on user interaction
export const LazyLoadManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    // Preload components on user interaction
    const handleUserInteraction = () => {
      preloadDashboardComponents();
      
      // Remove listeners after first interaction
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    // Add interaction listeners
    document.addEventListener('mousedown', handleUserInteraction, { passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  return <>{children}</>;
};