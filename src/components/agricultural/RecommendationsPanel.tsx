import React from 'react';
import { motion } from 'framer-motion';

interface RecommendationsPanelProps {
  recommendations: string[];
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations }) => {
  const getRecommendationIcon = (recommendation: string) => {
    const lower = recommendation.toLowerCase();
    if (lower.includes('water') || lower.includes('irrigat')) return '💧';
    if (lower.includes('pest') || lower.includes('spray')) return '🐛';
    if (lower.includes('harvest') || lower.includes('crop')) return '🌾';
    if (lower.includes('soil') || lower.includes('fertiliz')) return '🌱';
    if (lower.includes('weather') || lower.includes('forecast')) return '🌤️';
    if (lower.includes('market') || lower.includes('price')) return '💰';
    if (lower.includes('equipment') || lower.includes('maintenance')) return '🔧';
    return '📋';
  };

  const getPriorityColor = (index: number) => {
    if (index < 2) return 'border-l-red-500 bg-red-50';
    if (index < 4) return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-green-500 bg-green-50';
  };

  const getPriorityLabel = (index: number) => {
    if (index < 2) return 'High Priority';
    if (index < 4) return 'Medium Priority';
    return 'Low Priority';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">AI Recommendations</h3>
        <div className="text-sm text-gray-500">
          Updated {new Date().toLocaleDateString()}
        </div>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(index)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl flex-shrink-0 mt-1">
                  {getRecommendationIcon(recommendation)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      index < 2 ? 'bg-red-100 text-red-800' :
                      index < 4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getPriorityLabel(index)}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{recommendation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🤖</div>
          <p className="font-medium">No recommendations available</p>
          <p className="text-sm">Add farm data and crop analyses to get AI-powered insights</p>
        </div>
      )}

      {/* Action Buttons */}
      {recommendations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
              Mark All as Read
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Export Recommendations
            </button>
            <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm">
              Schedule Reminders
            </button>
          </div>
        </div>
      )}

      {/* Recommendation Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600">
              {recommendations.filter((_, i) => i < 2).length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {recommendations.filter((_, i) => i >= 2 && i < 4).length}
            </div>
            <div className="text-sm text-gray-600">Medium Priority</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {recommendations.filter((_, i) => i >= 4).length}
            </div>
            <div className="text-sm text-gray-600">Low Priority</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationsPanel;