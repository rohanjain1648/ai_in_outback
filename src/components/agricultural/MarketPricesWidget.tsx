import React from 'react';
import { motion } from 'framer-motion';
import { MarketPrice, MarketAlert } from '../../types/agriculture';

interface MarketPricesWidgetProps {
  prices: MarketPrice[];
  alerts: MarketAlert[];
  detailed?: boolean;
}

const MarketPricesWidget: React.FC<MarketPricesWidgetProps> = ({ 
  prices, 
  alerts, 
  detailed = false 
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Market Prices</h3>
        <div className="text-sm text-gray-500">
          Updated {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Market Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Market Alerts</h4>
          <div className="space-y-2">
            {alerts.slice(0, detailed ? alerts.length : 3).map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{alert.commodity}</span>
                    <span className="text-sm">•</span>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <span className="text-xs">
                    {new Date(alert.date).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Price Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Commodity</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">Price</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-700">Change</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Trend</th>
              {detailed && (
                <>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Market</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Date</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {prices.map((price, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-2">
                  <div>
                    <div className="font-medium text-gray-800 capitalize">{price.commodity}</div>
                    {price.variety && (
                      <div className="text-sm text-gray-500">{price.variety}</div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="font-semibold text-gray-800">
                    ${price.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">{price.unit}</div>
                </td>
                <td className={`py-3 px-2 text-right font-medium ${getTrendColor(price.trend)}`}>
                  {price.change > 0 ? '+' : ''}{price.change.toFixed(1)}%
                </td>
                <td className="py-3 px-2 text-center text-lg">
                  {getTrendIcon(price.trend)}
                </td>
                {detailed && (
                  <>
                    <td className="py-3 px-2 text-sm text-gray-600">{price.market}</td>
                    <td className="py-3 px-2 text-right text-sm text-gray-500">
                      {new Date(price.date).toLocaleDateString()}
                    </td>
                  </>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {!detailed && prices.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            View All Prices →
          </button>
        </div>
      )}

      {prices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No market data available</p>
          <p className="text-sm">Add crops to your farm to see relevant prices</p>
        </div>
      )}
    </motion.div>
  );
};

export default MarketPricesWidget;