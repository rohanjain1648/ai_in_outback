import React from 'react';
import { motion } from 'framer-motion';
import { Crop, CropMonitoring } from '../../types/agriculture';

interface CropHealthOverviewProps {
  crops: Crop[];
  recentAnalyses: CropMonitoring[];
}

const CropHealthOverview: React.FC<CropHealthOverviewProps> = ({ crops, recentAnalyses }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return 'bg-blue-100 text-blue-800';
      case 'growing': return 'bg-green-100 text-green-800';
      case 'flowering': return 'bg-purple-100 text-purple-800';
      case 'harvesting': return 'bg-orange-100 text-orange-800';
      case 'harvested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCropAnalysis = (cropName: string) => {
    return recentAnalyses.find(analysis => 
      analysis.cropName.toLowerCase() === cropName.toLowerCase()
    );
  };

  const getDaysToHarvest = (harvestDate: Date) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Crop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map((crop, index) => {
          const analysis = getCropAnalysis(crop.name);
          const daysToHarvest = getDaysToHarvest(crop.expectedHarvestDate);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              {/* Crop Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 capitalize">
                    {crop.name}
                  </h3>
                  <p className="text-sm text-gray-600">{crop.variety}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
                  {crop.status}
                </span>
              </div>

              {/* Crop Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">{crop.area} hectares</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Planted:</span>
                  <span className="font-medium">
                    {new Date(crop.plantingDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Harvest:</span>
                  <span className={`font-medium ${daysToHarvest < 30 ? 'text-orange-600' : ''}`}>
                    {daysToHarvest > 0 ? `${daysToHarvest} days` : 'Overdue'}
                  </span>
                </div>
              </div>

              {/* Health Analysis */}
              {analysis ? (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Health Score</span>
                    <span className={`text-lg font-bold ${getHealthScoreColor(analysis.analysis.healthScore)}`}>
                      {analysis.analysis.healthScore}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        analysis.analysis.healthScore >= 80 ? 'bg-green-500' :
                        analysis.analysis.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${analysis.analysis.healthScore}%` }}
                    />
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    Growth Stage: <span className="font-medium">{analysis.analysis.growthStage}</span>
                  </div>

                  {/* Issues */}
                  {(analysis.analysis.diseaseDetected.length > 0 || 
                    analysis.analysis.pestDetected.length > 0 || 
                    analysis.analysis.nutritionDeficiency.length > 0) && (
                    <div className="space-y-1">
                      {analysis.analysis.diseaseDetected.map((disease, i) => (
                        <div key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Disease: {disease}
                        </div>
                      ))}
                      {analysis.analysis.pestDetected.map((pest, i) => (
                        <div key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          Pest: {pest}
                        </div>
                      ))}
                      {analysis.analysis.nutritionDeficiency.map((deficiency, i) => (
                        <div key={i} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          Deficiency: {deficiency}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    Last analyzed: {new Date(analysis.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4 text-center">
                  <div className="text-gray-400 mb-2">📸</div>
                  <p className="text-sm text-gray-500">No recent analysis</p>
                  <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                    Upload Photo
                  </button>
                </div>
              )}

              {/* Notes */}
              {crop.notes && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {crop.notes}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add New Crop Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-flex items-center space-x-2">
          <span>➕</span>
          <span>Add New Crop</span>
        </button>
      </motion.div>

      {/* No Crops Message */}
      {crops.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Crops Added</h3>
          <p className="text-gray-600 mb-6">Start by adding your first crop to track its health and progress</p>
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
            Add Your First Crop
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CropHealthOverview;