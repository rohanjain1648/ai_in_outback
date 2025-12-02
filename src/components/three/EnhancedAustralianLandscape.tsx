import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Import all the new advanced components
import { SceneTransitions, useSectionTransition, ResponsiveEnvironment } from './SceneTransitions';
import { InteractiveHotspots } from './InteractiveElements';
import { ParticleSystem, WeatherParticles, AtmosphericEffects } from './ParticleEffects';
import { AustralianWildlife, WildlifeSounds } from './AustralianWildlife';
import { MobileControls, MobileUI, useHapticFeedback } from './MobileControls';
import { 
  AccessibilityFeatures, 
  AlternativeNavigationUI, 
  AudioDescriptions, 
  HighContrastOverlay,
  ScreenReaderAnnouncements 
} from './AccessibilityFeatures';
import { PerformanceOptimizer } from './PerformanceOptimizer';

// Import existing components
import { TerrainSystem } from './TerrainSystem';
import { LightingSystem } from './LightingSystem';
import { WeatherSystem } from './WeatherSystem';
import { FloraSystem } from './FloraSystem';
import { CameraController } from './CameraController';

interface EnhancedLandscapeProps {
  initialSection?: string;
  timeOfDay?: number;
  weatherType?: 'sunny' | 'rainy' | 'cloudy' | 'windy' | 'stormy';
  enableMobileControls?: boolean;
  enableAccessibility?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableWildlife?: boolean;
  enableParticleEffects?: boolean;
  onSectionChange?: (section: string) => void;
  onInteraction?: (type: string, data: any) => void;
}

const EnhancedLandscapeScene: React.FC<{
  section: string;
  timeOfDay: number;
  weatherType: string;
  enableWildlife: boolean;
  enableParticleEffects: boolean;
  onInteraction?: (type: string, data: any) => void;
}> = ({ 
  section, 
  timeOfDay, 
  weatherType, 
  enableWildlife, 
  enableParticleEffects,
  onInteraction 
}) => {
  const [region, setRegion] = useState<'outback' | 'coastal' | 'forest' | 'grassland'>('grassland');
  
  // Update region based on section
  useEffect(() => {
    const sectionRegions = {
      agriculture: 'grassland',
      community: 'grassland',
      emergency: 'outback',
      wellbeing: 'forest',
      business: 'coastal',
      culture: 'outback',
      skills: 'forest'
    };
    
    setRegion(sectionRegions[section as keyof typeof sectionRegions] || 'grassland');
  }, [section]);
  
  return (
    <ResponsiveEnvironment section={section}>
      {/* Core landscape elements */}
      <LightingSystem 
        timeOfDay={timeOfDay} 
        weatherType={weatherType as 'sunny' | 'rainy' | 'cloudy' | 'windy'} 
      />
      
      <TerrainSystem region={region} />
      
      <FloraSystem 
        region={region} 
        density={0.4} 
        windStrength={weatherType === 'windy' ? 0.8 : 0.3} 
      />
      
      {/* Enhanced weather effects */}
      <WeatherSystem type={weatherType as 'sunny' | 'rainy' | 'cloudy' | 'windy'} />
      
      {/* Advanced particle effects */}
      {enableParticleEffects && (
        <>
          <WeatherParticles 
            weatherType={weatherType as 'sunny' | 'rainy' | 'cloudy' | 'windy' | 'stormy'}
            intensity={0.7}
            region={region}
          />
          
          {/* Atmospheric effects for special moments */}
          {(timeOfDay >= 19 || timeOfDay <= 6) && (
            <AtmosphericEffects 
              type="fireflies" 
              intensity={0.3}
              color={[1, 1, 0.8]}
            />
          )}
          
          {section === 'culture' && timeOfDay >= 18 && timeOfDay <= 20 && (
            <AtmosphericEffects 
              type="floating-lights" 
              intensity={0.5}
              color={[1, 0.7, 0.3]}
            />
          )}
        </>
      )}
      
      {/* Australian wildlife */}
      {enableWildlife && (
        <>
          <AustralianWildlife
            region={region}
            timeOfDay={timeOfDay}
            density={0.4}
            weatherType={weatherType as 'sunny' | 'rainy' | 'cloudy' | 'windy'}
          />
          <WildlifeSounds
            region={region}
            timeOfDay={timeOfDay}
            animals={['kangaroo', 'koala', 'bird']}
          />
        </>
      )}
      
      {/* Interactive elements */}
      <InteractiveHotspots
        section={section}
        onInteraction={onInteraction}
      />
      
      {/* Sky and environment */}
      <Sky
        distance={450000}
        sunPosition={[
          Math.cos((timeOfDay / 24) * Math.PI * 2) * 100,
          Math.sin((timeOfDay / 24) * Math.PI * 2) * 100,
          0
        ]}
        inclination={0}
        azimuth={0.25}
      />
      
      <Environment preset="sunset" />
    </ResponsiveEnvironment>
  );
};

export const EnhancedAustralianLandscape: React.FC<EnhancedLandscapeProps> = ({
  initialSection = 'community',
  timeOfDay = 12,
  weatherType = 'sunny',
  enableMobileControls = true,
  enableAccessibility = true,
  enablePerformanceMonitoring = true,
  enableWildlife = true,
  enableParticleEffects = true,
  onSectionChange,
  onInteraction
}) => {
  const {
    currentSection,
    isTransitioning,
    transitionToSection,
    handleTransitionComplete,
    sectionConfig
  } = useSectionTransition();
  
  const { triggerHaptic } = useHapticFeedback();
  
  // Accessibility states
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    enableAltNavigation: true,
    enableAudioDescriptions: false,
    enableHighContrast: false,
    enableReducedMotion: false
  });
  
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Initialize with provided section
  useEffect(() => {
    if (initialSection !== currentSection) {
      transitionToSection(initialSection);
    }
  }, [initialSection, currentSection, transitionToSection]);
  
  // Handle section changes
  const handleSectionChange = useCallback((section: string) => {
    transitionToSection(section);
    onSectionChange?.(section);
    triggerHaptic('light');
    
    setAnnouncements(prev => [...prev, `Transitioning to ${section} section`]);
  }, [transitionToSection, onSectionChange, triggerHaptic]);
  
  // Handle interactions
  const handleInteraction = useCallback((type: string, data: any) => {
    triggerHaptic('medium');
    onInteraction?.(type, data);
    
    setAnnouncements(prev => [...prev, `Activated ${type}: ${data.action || 'interaction'}`]);
  }, [onInteraction, triggerHaptic]);
  
  // Handle navigation announcements
  const handleNavigationChange = useCallback((description: string) => {
    setAnnouncements(prev => [...prev, description]);
  }, []);
  
  // Camera reset function
  const handleCameraReset = useCallback(() => {
    if (sectionConfig) {
      // This would trigger a camera reset to the current section's default view
      triggerHaptic('light');
      setAnnouncements(prev => [...prev, 'Camera view reset']);
    }
  }, [sectionConfig, triggerHaptic]);
  
  // Handle gesture controls
  const handleGesture = useCallback((gesture: string) => {
    switch (gesture) {
      case 'swipe-left':
        // Navigate to next section
        const sections = ['agriculture', 'community', 'emergency', 'wellbeing', 'business', 'culture', 'skills'];
        const currentIndex = sections.indexOf(currentSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        handleSectionChange(sections[nextIndex]);
        break;
      case 'swipe-right':
        // Navigate to previous section
        const sectionsReverse = ['agriculture', 'community', 'emergency', 'wellbeing', 'business', 'culture', 'skills'];
        const currentIndexReverse = sectionsReverse.indexOf(currentSection);
        const prevIndex = currentIndexReverse > 0 ? currentIndexReverse - 1 : sectionsReverse.length - 1;
        handleSectionChange(sectionsReverse[prevIndex]);
        break;
      case 'double-tap':
        handleCameraReset();
        break;
    }
  }, [currentSection, handleSectionChange, handleCameraReset]);
  
  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: [0, 50, 100], fov: 60 }}
        shadows
        gl={{ 
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#87CEEB');
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        {/* Performance monitoring */}
        {enablePerformanceMonitoring && (
          <PerformanceOptimizer
            targetFPS={60}
            enableLOD={true}
            enableFrustumCulling={true}
          />
        )}
        
        {/* Scene transitions */}
        <SceneTransitions
          currentSection={currentSection}
          onTransitionComplete={handleTransitionComplete}
        />
        
        {/* Main landscape scene */}
        <EnhancedLandscapeScene
          section={currentSection}
          timeOfDay={sectionConfig?.environmentSettings.timeOfDay || timeOfDay}
          weatherType={sectionConfig?.environmentSettings.weatherType || weatherType}
          enableWildlife={enableWildlife}
          enableParticleEffects={enableParticleEffects}
          onInteraction={handleInteraction}
        />
        
        {/* Camera controls */}
        <CameraController
          autoRotate={false}
          enableKeyboardControls={!isMobile}
        />
        
        {/* Mobile controls */}
        {enableMobileControls && isMobile && (
          <MobileControls
            enableTouch={true}
            enableGyroscope={true}
            enableGestures={true}
            onGesture={handleGesture}
          />
        )}
        
        {/* Accessibility features */}
        {enableAccessibility && (
          <>
            <AccessibilityFeatures
              enableAltNavigation={accessibilitySettings.enableAltNavigation}
              enableAudioDescriptions={accessibilitySettings.enableAudioDescriptions}
              enableHighContrast={accessibilitySettings.enableHighContrast}
              enableReducedMotion={accessibilitySettings.enableReducedMotion}
              onNavigationChange={handleNavigationChange}
            />
            
            <HighContrastOverlay enabled={accessibilitySettings.enableHighContrast} />
          </>
        )}
        
        {/* Standard orbit controls for desktop */}
        {!isMobile && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={500}
            maxPolarAngle={Math.PI / 2.1}
          />
        )}
      </Canvas>
      
      {/* Mobile UI overlay */}
      {enableMobileControls && isMobile && (
        <MobileUI
          onCameraReset={handleCameraReset}
          onSectionChange={handleSectionChange}
          currentSection={currentSection}
        />
      )}
      
      {/* Alternative navigation UI */}
      {enableAccessibility && (
        <AlternativeNavigationUI
          onNavigate={handleSectionChange}
          currentViewpoint={currentSection}
          enableReducedMotion={accessibilitySettings.enableReducedMotion}
        />
      )}
      
      {/* Audio descriptions */}
      {enableAccessibility && accessibilitySettings.enableAudioDescriptions && (
        <AudioDescriptions
          enabled={accessibilitySettings.enableAudioDescriptions}
          currentScene={currentSection}
          onDescriptionChange={handleNavigationChange}
        />
      )}
      
      {/* Screen reader announcements */}
      {enableAccessibility && (
        <ScreenReaderAnnouncements
          announcements={announcements}
          onAnnouncementRead={(announcement) => console.log('Screen reader:', announcement)}
        />
      )}
      
      {/* Accessibility settings panel */}
      {enableAccessibility && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <h3 className="font-semibold mb-3">Accessibility Settings</h3>
            
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={accessibilitySettings.enableAudioDescriptions}
                onChange={(e) => setAccessibilitySettings(prev => ({
                  ...prev,
                  enableAudioDescriptions: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Audio Descriptions</span>
            </label>
            
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={accessibilitySettings.enableHighContrast}
                onChange={(e) => setAccessibilitySettings(prev => ({
                  ...prev,
                  enableHighContrast: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">High Contrast</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={accessibilitySettings.enableReducedMotion}
                onChange={(e) => setAccessibilitySettings(prev => ({
                  ...prev,
                  enableReducedMotion: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Reduced Motion</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Loading overlay during transitions */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Transitioning to {currentSection}...</p>
          </div>
        </div>
      )}
    </div>
  );
};