import React from 'react';
import { motion } from 'framer-motion';
import { WeatherData } from '../../types/agriculture';

interface WeatherWidgetProps {
  weather: WeatherData;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  const { current, agricultural, forecast } = weather;

  const getSprayingConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Weather & Conditions</h3>
        <div className="text-sm text-gray-500">
          {weather.location.name}, {weather.location.region}
        </div>
      </div>

      {/* Current Weather */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{current.temperature}°C</div>
          <div className="text-sm text-gray-600">Temperature</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-500">{current.humidity}%</div>
          <div className="text-sm text-gray-600">Humidity</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{current.rainfall}mm</div>
          <div className="text-sm text-gray-600">Rainfall</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{current.uvIndex}</div>
          <div className="text-sm text-gray-600">UV Index</div>
        </div>
      </div>

      {/* Agricultural Conditions */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-gray-800 mb-4">Agricultural Conditions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Soil Moisture</span>
              <span className="text-lg font-bold text-blue-600">{agricultural.soilMoisture}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${agricultural.soilMoisture}%` }}
              />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Growing Degree Days</span>
              <span className="text-lg font-bold text-green-600">{agricultural.growingDegreeDays}</span>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Evapotranspiration</span>
              <span className="text-lg font-bold text-yellow-600">{agricultural.evapotranspiration}mm</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${getSprayingConditionColor(agricultural.sprayingConditions)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Spraying Conditions</span>
              <span className="text-lg font-bold capitalize">{agricultural.sprayingConditions}</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Irrigation:</span>
            <span className="text-sm text-blue-600">{agricultural.irrigationRecommendation}</span>
          </div>
          {agricultural.frostRisk && (
            <div className="flex items-center space-x-2 text-red-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Frost Risk Alert</span>
            </div>
          )}
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div className="border-t pt-6 mt-6">
        <h4 className="font-semibold text-gray-800 mb-4">3-Day Forecast</h4>
        <div className="grid grid-cols-3 gap-4">
          {forecast.slice(0, 3).map((day, index) => (
            <div key={index} className="text-center bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-600 mb-1">
                {new Date(day.date).toLocaleDateString('en-AU', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold text-gray-800">
                {day.maxTemp}° / {day.minTemp}°
              </div>
              <div className="text-sm text-blue-600">{day.rainfall}mm</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;