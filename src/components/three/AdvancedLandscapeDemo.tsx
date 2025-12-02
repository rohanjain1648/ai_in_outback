import React, { useState, useEffect } from 'react';
import { EnhancedAustralianLandscape } from './EnhancedAustralianLandscape';

interface DemoControlsProps {
  onSettingsChange: (settings: DemoSettings) => void;
  settings: DemoSettings;
}

interface DemoSettings {
  section: string;
  timeOfDay: number;
  weatherType: 'sunny' | 'rainy' | 'cloudy' | 'windy' | 'stormy';
  enableMobileControls: boolean;
  enableAccessibility: boolean;
  enablePerformanceMonitoring: boolean;
  enableWildlife: boolean;
  enableParticleEffects: boolean;
}

const DemoControls: React.FC<DemoControlsProps> = ({ onSettingsChange, settings }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sections = [
    { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
    { id: 'community', name: 'Community', icon: '🏘️' },
    { id: 'emergency', name: 'Emergency', icon: '🚨' },
    { id: 'wellbeing', name: 'Wellbeing', icon: '💚' },
    { id: 'business', name: 'Business', icon: '🏢' },
    { id: 'culture', name: 'Culture', icon: '📖' },
    { id: 'skills', name: 'Skills', icon: '🎓' }
  ];
  
  const weatherTypes = [
    { id: 'sunny', name: 'Sunny', icon: '☀️' },
    { id: 'cloudy', name: 'Cloudy', icon: '☁️' },
    { id: 'rainy', name: 'Rainy', icon: '🌧️' },
    { id: 'windy', name: 'Windy', icon: '💨' },
    { id: 'stormy', name: 'Stormy', icon: '⛈️' }
  ];
  
  const updateSetting = (key: keyof DemoSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  
  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        className="bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="mr-2">🎛️</span>
        Demo Controls
      </button>
      
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border min-w-80 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Advanced Three.js Demo</h3>
            <p className="text-sm text-gray-600 mt-1">
              Explore the enhanced 3D landscape features
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Section Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Section
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`p-2 rounded text-sm transition-colors ${
                      settings.section === section.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => updateSetting('section', section.id)}
                  >
                    <span className="mr-1">{section.icon}</span>
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Time of Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time of Day: {settings.timeOfDay}:00
              </label>
              <input
                type="range"
                min="0"
                max="23"
                value={settings.timeOfDay}
                onChange={(e) => updateSetting('timeOfDay', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Midnight</span>
                <span>Noon</span>
                <span>Midnight</span>
              </div>
            </div>
            
            {/* Weather Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weather Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {weatherTypes.map((weather) => (
                  <button
                    key={weather.id}
                    className={`p-2 rounded text-sm transition-colors ${
                      settings.weatherType === weather.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => updateSetting('weatherType', weather.id)}
                  >
                    <span className="mr-1">{weather.icon}</span>
                    {weather.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Feature Toggles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                {[
                  { key: 'enableWildlife', label: 'Australian Wildlife', icon: '🦘' },
                  { key: 'enableParticleEffects', label: 'Particle Effects', icon: '✨' },
                  { key: 'enableMobileControls', label: 'Mobile Controls', icon: '📱' },
                  { key: 'enableAccessibility', label: 'Accessibility Features', icon: '♿' },
                  { key: 'enablePerformanceMonitoring', label: 'Performance Monitor', icon: '📊' }
                ].map((feature) => (
                  <label key={feature.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings[feature.key as keyof DemoSettings] as boolean}
                      onChange={(e) => updateSetting(feature.key, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      <span className="mr-1">{feature.icon}</span>
                      {feature.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            <h4 className="font-medium text-gray-900 mb-2">New Features Showcase</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Smooth section transitions with camera movement</div>
              <div>• Interactive 3D hotspots with hover effects</div>
              <div>• Advanced particle systems for weather</div>
              <div>• Animated Australian wildlife (kangaroos, koalas, etc.)</div>
              <div>• Touch and gesture controls for mobile</div>
              <div>• Accessibility features with keyboard navigation</div>
              <div>• Performance monitoring and adaptive quality</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdvancedLandscapeDemo: React.FC = () => {
  const [settings, setSettings] = useState<DemoSettings>({
    section: 'community',
    timeOfDay: 12,
    weatherType: 'sunny',
    enableMobileControls: true,
    enableAccessibility: true,
    enablePerformanceMonitoring: true,
    enableWildlife: true,
    enableParticleEffects: true
  });
  
  const [interactionLog, setInteractionLog] = useState<string[]>([]);
  
  // Auto-cycle through sections for demo
  const [autoCycle, setAutoCycle] = useState(false);
  
  useEffect(() => {
    if (!autoCycle) return;
    
    const sections = ['agriculture', 'community', 'emergency', 'wellbeing', 'business', 'culture', 'skills'];
    let currentIndex = sections.indexOf(settings.section);
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % sections.length;
      setSettings(prev => ({ ...prev, section: sections[currentIndex] }));
    }, 8000); // Change section every 8 seconds
    
    return () => clearInterval(interval);
  }, [autoCycle, settings.section]);
  
  // Auto-cycle time of day for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setSettings(prev => ({
        ...prev,
        timeOfDay: (prev.timeOfDay + 1) % 24
      }));
    }, 30000); // Change time every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSectionChange = (section: string) => {
    setSettings(prev => ({ ...prev, section }));
    setInteractionLog(prev => [...prev, `Section changed to: ${section}`]);
  };
  
  const handleInteraction = (type: string, data: any) => {
    setInteractionLog(prev => [...prev, `Interaction: ${type} - ${data.action || 'unknown'}`]);
  };
  
  return (
    <div className="w-full h-screen relative">
      <EnhancedAustralianLandscape
        initialSection={settings.section}
        timeOfDay={settings.timeOfDay}
        weatherType={settings.weatherType}
        enableMobileControls={settings.enableMobileControls}
        enableAccessibility={settings.enableAccessibility}
        enablePerformanceMonitoring={settings.enablePerformanceMonitoring}
        enableWildlife={settings.enableWildlife}
        enableParticleEffects={settings.enableParticleEffects}
        onSectionChange={handleSectionChange}
        onInteraction={handleInteraction}
      />
      
      <DemoControls
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      {/* Auto-cycle toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          className={`p-3 rounded-lg shadow-lg transition-colors ${
            autoCycle ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
          }`}
          onClick={() => setAutoCycle(!autoCycle)}
        >
          <span className="mr-2">{autoCycle ? '⏸️' : '▶️'}</span>
          {autoCycle ? 'Stop Auto-Demo' : 'Start Auto-Demo'}
        </button>
      </div>
      
      {/* Interaction log */}
      {interactionLog.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 max-w-md">
          <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg max-h-32 overflow-y-auto">
            <h4 className="font-medium mb-2">Interaction Log</h4>
            <div className="text-sm space-y-1">
              {interactionLog.slice(-5).map((log, index) => (
                <div key={index} className="text-gray-300">
                  {log}
                </div>
              ))}
            </div>
            {interactionLog.length > 5 && (
              <div className="text-xs text-gray-400 mt-1">
                ... and {interactionLog.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Feature showcase overlay */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold mb-2">🎉 New Features</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>✨ Enhanced particle effects</div>
            <div>🦘 Animated Australian wildlife</div>
            <div>📱 Mobile touch controls</div>
            <div>♿ Accessibility support</div>
            <div>🎯 Interactive 3D hotspots</div>
            <div>🎬 Smooth scene transitions</div>
          </div>
        </div>
      </div>
    </div>
  );
};