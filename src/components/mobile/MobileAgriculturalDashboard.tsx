import React, { useState } from 'react';
import { Camera, Upload, TrendingUp, Droplets, Sun, Wind } from 'lucide-react';
import MobileCamera from './MobileCamera';
import TouchButton from './TouchButton';
import TouchInput from './TouchInput';
import ResponsiveContainer from './ResponsiveContainer';
import { useDeviceDetection } from '../../utils/mobileDetection';

interface CropAnalysisResult {
  id: string;
  imageUrl: string;
  cropType: string;
  healthScore: number;
  issues: string[];
  recommendations: string[];
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  uvIndex: number;
  conditions: string;
}

const MobileAgriculturalDashboard: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<CropAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [cropType, setCropType] = useState('');
  const deviceInfo = useDeviceDetection();

  // Mock weather data
  const weatherData: WeatherData = {
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    rainfall: 2.5,
    uvIndex: 7,
    conditions: 'Partly Cloudy'
  };

  const handleCameraCapture = async (imageData: string, metadata?: any) => {
    setShowCamera(false);
    setIsAnalyzing(true);

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));

      const analysisResult: CropAnalysisResult = {
        id: `analysis_${Date.now()}`,
        imageUrl: imageData,
        cropType: cropType || 'Wheat',
        healthScore: Math.floor(Math.random() * 30) + 70, // 70-100
        issues: [
          'Minor leaf discoloration detected',
          'Slight nutrient deficiency indicators'
        ],
        recommendations: [
          'Consider nitrogen-rich fertilizer application',
          'Monitor soil moisture levels',
          'Schedule follow-up inspection in 1 week'
        ],
        timestamp: new Date(),
        location: metadata?.location ? {
          latitude: metadata.location.coords.latitude,
          longitude: metadata.location.coords.longitude
        } : undefined
      };

      setAnalysisResults(prev => [analysisResult, ...prev]);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (showCamera) {
    return (
      <MobileCamera
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        aspectRatio="4:3"
        quality={0.8}
        overlayText="Position your crop in the center of the frame for best analysis results"
        enableFlash={true}
      />
    );
  }

  return (
    <ResponsiveContainer className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h1 className={`font-bold text-gray-900 mb-2 ${
          deviceInfo.isMobile ? 'text-xl' : 'text-2xl'
        }`}>
          🚜 Agricultural Intelligence
        </h1>
        <p className="text-gray-600 text-sm">
          AI-powered crop analysis and farm management
        </p>
      </div>

      {/* Farm Setup */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Farm Information</h2>
        <div className="space-y-4">
          <TouchInput
            label="Farm Name"
            value={farmName}
            onChange={setFarmName}
            placeholder="Enter your farm name"
            icon={<Sun className="w-5 h-5" />}
          />
          <TouchInput
            label="Current Crop"
            value={cropType}
            onChange={setCropType}
            placeholder="e.g., Wheat, Corn, Soybeans"
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Weather Widget */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Conditions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{weatherData.temperature}°C</p>
            <p className="text-xs text-gray-600">Temperature</p>
          </div>
          <div className="text-center">
            <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{weatherData.humidity}%</p>
            <p className="text-xs text-gray-600">Humidity</p>
          </div>
          <div className="text-center">
            <Wind className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{weatherData.windSpeed} km/h</p>
            <p className="text-xs text-gray-600">Wind Speed</p>
          </div>
          <div className="text-center">
            <Droplets className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{weatherData.rainfall} mm</p>
            <p className="text-xs text-gray-600">Rainfall</p>
          </div>
        </div>
      </div>

      {/* Camera Action */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="text-center">
          <Camera className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Crop Health Analysis
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Take a photo of your crops for AI-powered health analysis and recommendations
          </p>
          
          <TouchButton
            onClick={() => setShowCamera(true)}
            variant="primary"
            size="lg"
            fullWidth={deviceInfo.isMobile}
            icon={<Camera className="w-6 h-6" />}
            disabled={!deviceInfo.hasCamera}
          >
            {deviceInfo.hasCamera ? 'Analyze Crops' : 'Camera Not Available'}
          </TouchButton>
          
          {!deviceInfo.hasCamera && (
            <p className="text-sm text-gray-500 mt-2">
              Camera access is required for crop analysis
            </p>
          )}
        </div>
      </div>

      {/* Analysis Loading */}
      {isAnalyzing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analyzing Your Crop...
            </h3>
            <p className="text-gray-600 text-sm">
              Our AI is examining the image for health indicators, diseases, and growth patterns
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Analysis Results</h2>
          
          {analysisResults.map((result) => (
            <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Image */}
              <div className="aspect-video bg-gray-100">
                <img
                  src={result.imageUrl}
                  alt="Crop analysis"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{result.cropType}</h3>
                    <p className="text-sm text-gray-600">
                      {result.timestamp.toLocaleDateString()} at {result.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthScoreColor(result.healthScore)}`}>
                    {result.healthScore}% Healthy
                  </div>
                </div>
                
                {/* Issues */}
                {result.issues.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-2">Issues Detected:</h4>
                    <ul className="space-y-1">
                      {result.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Recommendations */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Location */}
                {result.location && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      📍 Location: {result.location.latitude.toFixed(4)}, {result.location.longitude.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {analysisResults.length === 0 && !isAnalyzing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Analysis Results Yet
          </h3>
          <p className="text-gray-600 text-sm">
            Take your first crop photo to get started with AI-powered analysis
          </p>
        </div>
      )}
    </ResponsiveContainer>
  );
};

export default MobileAgriculturalDashboard;