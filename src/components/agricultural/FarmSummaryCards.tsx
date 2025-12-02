import React from 'react';
import { motion } from 'framer-motion';

interface FarmSummaryCardsProps {
  summary: {
    totalCrops: number;
    totalLivestock: number;
    healthyCrops: number;
    alertsCount: number;
    avgHealthScore: number;
  };
}

const FarmSummaryCards: React.FC<FarmSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Crops',
      value: summary.totalCrops,
      icon: '🌾',
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Livestock Count',
      value: summary.totalLivestock,
      icon: '🐄',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Healthy Crops',
      value: summary.healthyCrops,
      icon: '✅',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Active Alerts',
      value: summary.alertsCount,
      icon: '⚠️',
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Avg Health Score',
      value: `${summary.avgHealthScore}%`,
      icon: '📊',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${card.bgColor} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            <div className={`${card.color} p-3 rounded-full text-white text-xl`}>
              {card.icon}
            </div>
          </div>
          
          {card.title === 'Avg Health Score' && summary.avgHealthScore > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${summary.avgHealthScore}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className={`h-2 rounded-full ${
                    summary.avgHealthScore >= 80 ? 'bg-green-500' :
                    summary.avgHealthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default FarmSummaryCards;