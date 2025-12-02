import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AccessibilityFeaturesProps {
  enableAltNavigation?: boolean;
  enableAudioDescriptions?: boolean;
  enableHighContrast?: boolean;
  enableReducedMotion?: boolean;
  onNavigationChange?: (description: string) => void;
}

// Alternative navigation for users who can't use 3D controls
export const AccessibilityFeatures: React.FC<AccessibilityFeaturesProps> = ({
  enableAltNavigation = true,
  enableAudioDescriptions = true,
  enableHighContrast = false,
  enableReducedMotion = false,
  onNavigationChange
}) => {
  const { camera, scene } = useThree();
  const [currentFocus, setCurrentFocus] = useState<string>('overview');
  const [isNavigating, setIsNavigating] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  // Predefined accessible viewpoints
  const accessibleViewpoints = {
    overview: {
      position: [0, 50, 100],
      target: [0, 0, 0],
      description: 'Overview of the Australian landscape with rolling hills and scattered vegetation'
    },
    agriculture: {
      position: [30, 25, 50],
      target: [0, 0, 0],
      description: 'Agricultural area with farming equipment and crop monitoring stations'
    },
    community: {
      position: [0, 40, 80],
      target: [0, 0, 0],
      description: 'Community gathering area with interactive information points'
    },
    emergency: {
      position: [60, 35, 60],
      target: [0, 0, 0],
      description: 'Emergency response zone with alert systems and communication towers'
    },
    wellbeing: {
      position: [20, 15, 40],
      target: [0, 5, 0],
      description: 'Peaceful wellbeing area surrounded by native Australian flora'
    },
    business: {
      position: [45, 30, 45],
      target: [0, 0, 0],
      description: 'Business district with commercial buildings and economic activity markers'
    },
    culture: {
      position: [-40, 20, 60],
      target: [0, 0, 0],
      description: 'Cultural heritage site with storytelling circles and traditional elements'
    },
    skills: {
      position: [25, 20, 35],
      target: [0, 0, 0],
      description: 'Skills sharing area with learning stations and workshop spaces'
    }
  };
  
  // Navigate to specific viewpoint
  const navigateToViewpoint = useCallback((viewpointId: string) => {
    const viewpoint = accessibleViewpoints[viewpointId as keyof typeof accessibleViewpoints];
    if (!viewpoint) return;
    
    setIsNavigating(true);
    setCurrentFocus(viewpointId);
    
    // Announce navigation
    const announcement = `Navigating to ${viewpointId}. ${viewpoint.description}`;
    setAnnouncements(prev => [...prev, announcement]);
    onNavigationChange?.(announcement);
    
    // Smooth camera transition
    const startPosition = camera.position.clone();
    const targetPosition = new THREE.Vector3(...viewpoint.position);
    const startTime = Date.now();
    const duration = enableReducedMotion ? 500 : 2000;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeInOutCubic = (t: number) => 
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      const easedProgress = easeInOutCubic(progress);
      
      camera.position.lerpVectors(startPosition, targetPosition, easedProgress);
      camera.lookAt(new THREE.Vector3(...viewpoint.target));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsNavigating(false);
        setAnnouncements(prev => [...prev, `Arrived at ${viewpointId}`]);
      }
    };
    
    animate();
  }, [camera, enableReducedMotion, onNavigationChange]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!enableAltNavigation) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isNavigating) return;
      
      const viewpointKeys = {
        '1': 'overview',
        '2': 'agriculture',
        '3': 'community',
        '4': 'emergency',
        '5': 'wellbeing',
        '6': 'business',
        '7': 'culture',
        '8': 'skills'
      };
      
      const viewpointId = viewpointKeys[event.key as keyof typeof viewpointKeys];
      if (viewpointId) {
        event.preventDefault();
        navigateToViewpoint(viewpointId);
      }
      
      // Arrow key navigation
      const currentIndex = Object.keys(accessibleViewpoints).indexOf(currentFocus);
      let newIndex = currentIndex;
      
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          newIndex = (currentIndex + 1) % Object.keys(accessibleViewpoints).length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          newIndex = currentIndex > 0 ? currentIndex - 1 : Object.keys(accessibleViewpoints).length - 1;
          break;
        case 'Enter':
        case ' ':
          // Announce current location details
          const current = accessibleViewpoints[currentFocus as keyof typeof accessibleViewpoints];
          setAnnouncements(prev => [...prev, `Current location: ${currentFocus}. ${current.description}`]);
          break;
      }
      
      if (newIndex !== currentIndex) {
        const newViewpoint = Object.keys(accessibleViewpoints)[newIndex];
        navigateToViewpoint(newViewpoint);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableAltNavigation, isNavigating, currentFocus, navigateToViewpoint]);
  
  return null;
};

// Screen reader announcements
export const ScreenReaderAnnouncements: React.FC<{
  announcements: string[];
  onAnnouncementRead?: (announcement: string) => void;
}> = ({ announcements, onAnnouncementRead }) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<string>('');
  
  useEffect(() => {
    if (announcements.length > 0) {
      const latest = announcements[announcements.length - 1];
      setCurrentAnnouncement(latest);
      onAnnouncementRead?.(latest);
      
      // Clear announcement after reading
      setTimeout(() => setCurrentAnnouncement(''), 3000);
    }
  }, [announcements, onAnnouncementRead]);
  
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {currentAnnouncement}
    </div>
  );
};

// High contrast mode overlay
export const HighContrastOverlay: React.FC<{
  enabled: boolean;
}> = ({ enabled }) => {
  const { gl } = useThree();
  
  useEffect(() => {
    if (enabled) {
      // Apply high contrast shader or post-processing
      gl.domElement.style.filter = 'contrast(150%) brightness(120%)';
    } else {
      gl.domElement.style.filter = 'none';
    }
    
    return () => {
      gl.domElement.style.filter = 'none';
    };
  }, [enabled, gl]);
  
  return null;
};

// Alternative navigation UI
export const AlternativeNavigationUI: React.FC<{
  onNavigate: (viewpoint: string) => void;
  currentViewpoint: string;
  enableReducedMotion?: boolean;
}> = ({ onNavigate, currentViewpoint, enableReducedMotion = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const viewpoints = [
    { id: 'overview', name: 'Overview', icon: '🌄', key: '1' },
    { id: 'agriculture', name: 'Agriculture', icon: '🌾', key: '2' },
    { id: 'community', name: 'Community', icon: '🏘️', key: '3' },
    { id: 'emergency', name: 'Emergency', icon: '🚨', key: '4' },
    { id: 'wellbeing', name: 'Wellbeing', icon: '💚', key: '5' },
    { id: 'business', name: 'Business', icon: '🏢', key: '6' },
    { id: 'culture', name: 'Culture', icon: '📖', key: '7' },
    { id: 'skills', name: 'Skills', icon: '🎓', key: '8' }
  ];
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        className="bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Open navigation menu"
        aria-expanded={isExpanded}
      >
        <span className="sr-only">Navigation Menu</span>
        <span aria-hidden="true">🧭</span>
      </button>
      
      {isExpanded && (
        <div 
          className={`absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border min-w-64 ${
            enableReducedMotion ? '' : 'animate-fade-in'
          }`}
          role="menu"
          aria-label="Scene navigation"
        >
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Navigate Scene</h3>
            <p className="text-sm text-gray-600 mt-1">
              Use keyboard numbers 1-8 or click to navigate
            </p>
          </div>
          
          <div className="p-2">
            {viewpoints.map((viewpoint) => (
              <button
                key={viewpoint.id}
                className={`w-full text-left p-3 rounded-md hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors ${
                  currentViewpoint === viewpoint.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => {
                  onNavigate(viewpoint.id);
                  setIsExpanded(false);
                }}
                role="menuitem"
                aria-current={currentViewpoint === viewpoint.id ? 'location' : undefined}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl" aria-hidden="true">{viewpoint.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{viewpoint.name}</div>
                    <div className="text-sm text-gray-500">Press {viewpoint.key}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            <h4 className="font-medium text-gray-900 mb-2">Keyboard Shortcuts</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Arrow keys: Navigate between areas</div>
              <div>• Enter/Space: Describe current area</div>
              <div>• Numbers 1-8: Jump to specific areas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Audio description system
export const AudioDescriptions: React.FC<{
  enabled: boolean;
  currentScene: string;
  onDescriptionChange?: (description: string) => void;
}> = ({ enabled, currentScene, onDescriptionChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const sceneDescriptions = {
    overview: 'You are viewing a panoramic landscape of rural Australia. Rolling hills stretch into the distance, dotted with native eucalyptus trees and golden grasslands. The sky is a brilliant blue with scattered white clouds.',
    agriculture: 'This agricultural zone features modern farming equipment and crop monitoring stations. You can see organized rows of crops, weather monitoring devices, and irrigation systems across the fertile land.',
    community: 'The community area is a hub of social activity. There are gathering spaces, information kiosks, and pathways connecting different community resources. People can be seen interacting and sharing information.',
    emergency: 'This emergency response area contains alert systems and communication infrastructure. Emergency vehicles and response equipment are strategically positioned for rapid deployment across the region.',
    wellbeing: 'A peaceful wellness area surrounded by native Australian flora. The space is designed for reflection and mental health support, with quiet seating areas and natural elements promoting tranquility.',
    business: 'The business district showcases local commerce and economic activity. Various commercial buildings, market stalls, and business information centers create a bustling economic hub.',
    culture: 'This cultural heritage site celebrates local traditions and storytelling. Traditional elements, art installations, and gathering circles create spaces for cultural exchange and preservation.',
    skills: 'The skills sharing area features learning stations and workshop spaces. Educational resources, demonstration areas, and collaborative learning environments support knowledge exchange.'
  };
  
  useEffect(() => {
    if (enabled && currentScene) {
      const description = sceneDescriptions[currentScene as keyof typeof sceneDescriptions];
      if (description) {
        onDescriptionChange?.(description);
        
        // Use Web Speech API for audio descriptions
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(description);
          utterance.rate = 0.8;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          
          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => setIsPlaying(false);
          
          speechSynthesis.speak(utterance);
        }
      }
    }
  }, [enabled, currentScene, onDescriptionChange]);
  
  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };
  
  if (!enabled) return null;
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Audio Description</h4>
          {isPlaying && (
            <button
              onClick={stopAudio}
              className="text-red-400 hover:text-red-300"
              aria-label="Stop audio description"
            >
              ⏹️
            </button>
          )}
        </div>
        <p className="text-sm text-gray-300">
          {sceneDescriptions[currentScene as keyof typeof sceneDescriptions] || 'No description available'}
        </p>
        {isPlaying && (
          <div className="mt-2 flex items-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">Playing audio description</span>
          </div>
        )}
      </div>
    </div>
  );
};