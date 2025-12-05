# Advanced Three.js Animations and Interactions

This directory contains the enhanced Three.js components that provide advanced animations, interactions, and accessibility features for the Rural Connect AI platform's 3D landscape.

## 🎯 Task 14 Implementation

### ✅ Completed Features

#### 1. **Smooth Scene Transitions** (`SceneTransitions.tsx`)
- **Seamless camera transitions** between different platform sections (agriculture, community, emergency, etc.)
- **Easing animations** with cubic interpolation for natural movement
- **Section-specific environments** with unique camera positions, lighting, and atmospheric settings
- **Responsive environment animations** that adapt to the current section context

#### 2. **Interactive 3D Elements** (`InteractiveElements.tsx`)
- **Clickable 3D hotspots** with hover effects and visual feedback
- **Multiple interaction types**: info-points, action-triggers, navigation-markers, resource-nodes
- **Floating labels** with contextual information
- **Particle ring effects** around interactive elements
- **Connection lines** between related interactive elements

#### 3. **Advanced Particle Systems** (`ParticleEffects.tsx`)
- **Weather-based particles**: rain, dust, leaves, embers, pollen, snow
- **Atmospheric effects**: fireflies, sparkles, floating lights for magical moments
- **Wind simulation** affecting particle movement and behavior
- **Performance-optimized** particle rendering with instancing

#### 4. **Animated Australian Wildlife** (`AustralianWildlife.tsx`)
- **Native Australian animals**: kangaroos, koalas, wombats, emus, birds (kookaburra, cockatoo, magpie)
- **Realistic animations**: hopping kangaroos, flying birds, swaying koalas
- **Time-based behavior**: animals are more/less active based on time of day
- **Weather-responsive**: animals seek shelter during rain
- **Region-specific distribution**: different animals appear in different landscapes

#### 5. **Mobile Touch Controls** (`MobileControls.tsx`)
- **Multi-touch gestures**: pinch to zoom, drag to rotate, swipe navigation
- **Gyroscope integration** for device orientation-based camera control
- **Haptic feedback** for interaction confirmation
- **Touch-friendly UI overlay** with section navigation
- **Gesture recognition**: tap, double-tap, swipe directions

#### 6. **Accessibility Features** (`AccessibilityFeatures.tsx`)
- **Keyboard navigation** with arrow keys and number shortcuts
- **Screen reader support** with live announcements
- **Alternative navigation UI** for users who can't use 3D controls
- **Audio descriptions** using Web Speech API
- **High contrast mode** and reduced motion options
- **Focus management** and ARIA labels

#### 7. **Performance Monitoring** (`PerformanceOptimizer.tsx`)
- **Real-time FPS monitoring** and frame time analysis
- **Adaptive quality system** that adjusts rendering quality based on performance
- **Memory usage tracking** (when available)
- **LOD (Level of Detail) system** for distance-based quality optimization
- **Frustum culling** to hide objects outside camera view
- **Debug overlay** for development monitoring

## 🚀 Usage Examples

### Basic Enhanced Landscape
```tsx
import { EnhancedAustralianLandscape } from './three/EnhancedAustralianLandscape';

function App() {
  return (
    <EnhancedAustralianLandscape
      initialSection="community"
      timeOfDay={12}
      weatherType="sunny"
      enableWildlife={true}
      enableParticleEffects={true}
      onSectionChange={(section) => console.log('Section changed:', section)}
      onInteraction={(type, data) => console.log('Interaction:', type, data)}
    />
  );
}
```

### Demo with Controls
```tsx
import { AdvancedLandscapeDemo } from './three/AdvancedLandscapeDemo';

function DemoPage() {
  return <AdvancedLandscapeDemo />;
}
```

### Individual Components
```tsx
// Scene transitions
import { SceneTransitions, useSectionTransition } from './three/SceneTransitions';

// Interactive elements
import { InteractiveHotspots } from './three/InteractiveElements';

// Particle effects
import { WeatherParticles, AtmosphericEffects } from './three/ParticleEffects';

// Wildlife
import { AustralianWildlife } from './three/AustralianWildlife';

// Mobile controls
import { MobileControls, MobileUI } from './three/MobileControls';

// Accessibility
import { AccessibilityFeatures, AlternativeNavigationUI } from './three/AccessibilityFeatures';
```

## 🎮 Controls and Interactions

### Desktop Controls
- **Mouse**: Click and drag to rotate camera
- **Scroll**: Zoom in/out
- **Keyboard**: 
  - `1-8`: Jump to specific sections
  - `Arrow keys`: Navigate between sections
  - `Enter/Space`: Describe current area (accessibility)
  - `WASD`: Move camera (when enabled)

### Mobile Controls
- **Single touch**: Drag to rotate camera
- **Pinch**: Zoom in/out
- **Swipe left/right**: Navigate between sections
- **Double tap**: Reset camera view
- **Device tilt**: Subtle camera movement (gyroscope)

### Accessibility Controls
- **Tab navigation**: Focus on interactive elements
- **Screen reader**: Automatic announcements of scene changes
- **High contrast**: Toggle for better visibility
- **Reduced motion**: Disable animations for motion sensitivity
- **Audio descriptions**: Spoken descriptions of visual content

## 🌟 Advanced Features

### Section-Based Environments
Each platform section has unique environmental settings:

- **Agriculture**: Grassland region, afternoon lighting, farming equipment hotspots
- **Community**: Central gathering area, midday lighting, social interaction points
- **Emergency**: Outback region, evening lighting, alert systems
- **Wellbeing**: Forest region, morning lighting, peaceful atmosphere
- **Business**: Coastal region, business hours lighting, commercial hotspots
- **Culture**: Outback region, golden hour lighting, storytelling elements
- **Skills**: Forest region, afternoon lighting, learning stations

### Weather Effects
Dynamic weather system with particle effects:

- **Sunny**: Pollen particles in forest/grassland areas
- **Rainy**: Rain particles with wind effects
- **Cloudy**: Atmospheric fog and cloud particles
- **Windy**: Dust particles (outback) or leaves (forest)
- **Stormy**: Heavy rain with strong wind effects

### Wildlife Behavior
Realistic animal behavior patterns:

- **Time-based activity**: Animals are less active during hot midday hours
- **Weather response**: Animals seek shelter during rain
- **Region-specific**: Different animals in different landscapes
- **Natural animations**: Species-appropriate movement patterns

### Performance Optimization
Intelligent performance management:

- **Adaptive quality**: Automatically reduces quality when FPS drops
- **LOD system**: Lower detail for distant objects
- **Frustum culling**: Hide objects outside camera view
- **Memory monitoring**: Track and optimize memory usage
- **Mobile optimization**: Reduced particle counts and effects on mobile

## 🔧 Configuration Options

### EnhancedAustralianLandscape Props
```tsx
interface EnhancedLandscapeProps {
  initialSection?: string;           // Starting section
  timeOfDay?: number;               // 0-23 hours
  weatherType?: WeatherType;        // Weather conditions
  enableMobileControls?: boolean;   // Touch/gesture controls
  enableAccessibility?: boolean;    // Accessibility features
  enablePerformanceMonitoring?: boolean; // Performance tracking
  enableWildlife?: boolean;         // Australian animals
  enableParticleEffects?: boolean;  // Weather/atmospheric particles
  onSectionChange?: (section: string) => void;
  onInteraction?: (type: string, data: any) => void;
}
```

### Accessibility Settings
```tsx
interface AccessibilitySettings {
  enableAltNavigation: boolean;     // Keyboard navigation
  enableAudioDescriptions: boolean; // Spoken descriptions
  enableHighContrast: boolean;      // High contrast mode
  enableReducedMotion: boolean;     // Disable animations
}
```

## 🎨 Customization

### Adding New Interactive Elements
```tsx
// In InteractiveElements.tsx
const newHotspot = {
  position: [x, y, z],
  type: 'info-point',
  title: 'Custom Hotspot',
  description: 'Custom description',
  icon: '🎯',
  color: '#FF6B35',
  data: { action: 'custom-action' }
};
```

### Creating Custom Particle Effects
```tsx
// In ParticleEffects.tsx
<ParticleSystem
  count={500}
  type="custom"
  intensity={0.8}
  windDirection={[1, 0, 0]}
  windStrength={0.5}
/>
```

### Adding New Wildlife
```tsx
// In AustralianWildlife.tsx
const CustomAnimal: React.FC<AnimalProps> = ({ position, isActive }) => {
  // Custom animal implementation
  return (
    <group position={position} visible={isActive}>
      {/* 3D model components */}
    </group>
  );
};
```

## 📱 Mobile Optimization

The system automatically detects mobile devices and:
- Enables touch controls
- Reduces particle counts
- Simplifies animations
- Shows mobile-friendly UI
- Provides haptic feedback
- Optimizes performance settings

## ♿ Accessibility Compliance

The implementation follows WCAG 2.1 guidelines:
- **Keyboard navigation** for all interactive elements
- **Screen reader support** with proper ARIA labels
- **Focus management** and visual indicators
- **Alternative input methods** for 3D navigation
- **Customizable display options** (contrast, motion)
- **Audio descriptions** for visual content

## 🔍 Performance Monitoring

Real-time performance metrics:
- **FPS (Frames Per Second)**: Target 60 FPS
- **Frame time**: Milliseconds per frame
- **Draw calls**: Number of render operations
- **Triangle count**: Geometry complexity
- **Memory usage**: JavaScript heap size
- **Quality level**: Current rendering quality (low/medium/high)

## 🐛 Debugging

Enable debug mode by setting `NODE_ENV=development`:
- Performance overlay shows real-time stats
- Console logs for interactions and transitions
- Visual indicators for interactive elements
- Camera position logging
- Error boundaries for graceful failure handling

## 🌟 Spirit Trails (Task 8)

### Overview
Spirit Trails create ethereal, animated connections between nearby users and glowing beacon markers for events, visualizing community connections in an immersive way.

### Features
- **Animated spirit trail lines** with custom GLSL shaders
- **Glowing beacon markers** with pulsing animations
- **Particle systems** flowing along trails
- **Dynamic LOD** based on device performance
- **Frustum culling** for optimization
- **AR overlay mode** (framework prepared)

### Usage
```tsx
import { SpiritTrails } from './three/SpiritTrails';

<SpiritTrails
  users={nearbyUsers}
  events={communityEvents}
  maxDistance={50}
  trailColor="#4A90E2"
  beaconColor="#FF6B35"
  enableParticles={true}
  performanceMode="medium"
/>
```

### Demo
```tsx
import { SpiritTrailsDemo } from './three/SpiritTrailsDemo';

function App() {
  return <SpiritTrailsDemo />;
}
```

See `SPIRIT_TRAILS_README.md` for detailed documentation.

## 🚀 Future Enhancements

Potential improvements for future iterations:
- **WebXR support** for VR/AR experiences
- **Multiplayer interactions** with real-time synchronization
- **Advanced AI behaviors** for wildlife
- **Procedural landscape generation**
- **Weather API integration** for real-time conditions
- **Voice control** integration
- **Eye tracking** support for accessibility
- **Advanced physics** with Cannon.js or similar

## 📚 Dependencies

Key libraries used:
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers and components
- **three**: Core 3D library
- **framer-motion**: Animation library (for UI elements)

## 🤝 Contributing

When adding new features:
1. Follow the existing component structure
2. Add proper TypeScript types
3. Include accessibility considerations
4. Test on both desktop and mobile
5. Update this documentation
6. Add performance considerations
7. Include proper error handling

---

This advanced Three.js system provides a comprehensive, accessible, and performant 3D experience that showcases the Rural Connect AI platform's capabilities while ensuring usability for all users across different devices and abilities.