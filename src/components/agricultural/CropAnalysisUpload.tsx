import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { agriculturalService } from '../../services/agriculturalService';
import { Crop, CropMonitoring } from '../../types/agriculture';

interface CropAnalysisUploadProps {
  farmId: string;
  crops: Crop[];
  onAnalysisComplete: () => void;
}

const CropAnalysisUpload: React.FC<CropAnalysisUploadProps> = ({ 
  farmId, 
  crops, 
  onAnalysisComplete 
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CropMonitoring | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!selectedCrop) {
      setError('Please select a crop type first');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      // Upload the photo
      const photoUrl = await agriculturalService.uploadCropPhoto(file);
      
      setUploading(false);
      setAnalyzing(true);

      // Analyze the photo
      const analysisResult = await agriculturalService.analyzeCropPhoto(
        farmId,
        selectedCrop,
        photoUrl,
        {
          captureDate: new Date(),
          location: navigator.geolocation ? await getCurrentLocation() : undefined
        }
      );

      setAnalysis(analysisResult);
      onAnalysisComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze photo');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
        () => reject(new Error('Location not available'))
      );
    });
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setSelectedCrop('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!analysis ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Crop Photo Analysis</h3>

            {/* Crop Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Crop Type
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Choose a crop...</option>
                {crops.map((crop, index) => (
                  <option key={index} value={crop.name}>
                    {crop.name} ({crop.variety})
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading || analyzing || !selectedCrop}
              />
              
              {uploading || analyzing ? (
                <div className="space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto"
                  />
                  <p className="text-gray-600">
                    {uploading ? 'Uploading photo...' : 'Analyzing crop health...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-4xl">📸</div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      Drop your crop photo here
                    </p>
                    <p className="text-gray-600">or click to browse</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, WebP up to 10MB
                  </p>
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700"
              >
                {error}
              </motion.div>
            )}

            {/* Tips */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📋 Photo Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Take photos in good natural lighting</li>
                <li>• Focus on leaves, stems, and any visible issues</li>
                <li>• Include multiple angles if possible</li>
                <li>• Avoid blurry or dark images</li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Analysis Results</h3>
              <button
                onClick={resetAnalysis}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Analyze Another Photo
              </button>
            </div>

            {/* Crop Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 capitalize">{analysis.cropName}</h4>
                  <p className="text-sm text-gray-600">
                    Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <img
                  src={analysis.photoUrl}
                  alt="Analyzed crop"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
            </div>

            {/* Health Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Overall Health Score</span>
                <span className={`text-2xl font-bold ${getHealthScoreColor(analysis.analysis.healthScore)}`}>
                  {analysis.analysis.healthScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.analysis.healthScore}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-3 rounded-full ${
                    analysis.analysis.healthScore >= 80 ? 'bg-green-500' :
                    analysis.analysis.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Growth Stage */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Growth Stage</h4>
              <p className="text-gray-600">{analysis.analysis.growthStage}</p>
            </div>

            {/* Issues Detected */}
            {(analysis.analysis.diseaseDetected.length > 0 || 
              analysis.analysis.pestDetected.length > 0 || 
              analysis.analysis.nutritionDeficiency.length > 0) && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Issues Detected</h4>
                <div className="space-y-2">
                  {analysis.analysis.diseaseDetected.map((disease, index) => (
                    <div key={index} className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm">
                      🦠 Disease: {disease}
                    </div>
                  ))}
                  {analysis.analysis.pestDetected.map((pest, index) => (
                    <div key={index} className="bg-orange-100 text-orange-800 px-3 py-2 rounded-lg text-sm">
                      🐛 Pest: {pest}
                    </div>
                  ))}
                  {analysis.analysis.nutritionDeficiency.map((deficiency, index) => (
                    <div key={index} className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm">
                      🌱 Nutrient Deficiency: {deficiency}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {analysis.analysis.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-green-50 border-l-4 border-green-500 p-3 text-sm"
                  >
                    {recommendation}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Confidence Score */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Analysis Confidence: <span className="font-medium">{Math.round(analysis.analysis.confidence * 100)}%</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Powered by {analysis.aiModel}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CropAnalysisUpload;