import React from 'react';
import { WellbeingTrends } from '../types/wellbeing';

interface Props {
  trends: WellbeingTrends;
}

const WellbeingTrendsChart: React.FC<Props> = ({ trends }) => {
  const { mood, stress, sleep, social, activity, dates } = trends;

  if (!dates.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Wellbeing Trends</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No data available yet. Complete a few check-ins to see your trends!</p>
        </div>
      </div>
    );
  }

  // Simple line chart implementation using SVG
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = 40;
  const dataWidth = chartWidth - 2 * padding;
  const dataHeight = chartHeight - 2 * padding;

  const maxValue = 10;
  const minValue = 1;

  const getX = (index: number) => padding + (index / (dates.length - 1)) * dataWidth;
  const getY = (value: number) => padding + ((maxValue - value) / (maxValue - minValue)) * dataHeight;

  const createPath = (data: number[]) => {
    if (data.length === 0) return '';
    
    let path = `M ${getX(0)} ${getY(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      path += ` L ${getX(i)} ${getY(data[i])}`;
    }
    return path;
  };

  const metrics = [
    { name: 'Mood', data: mood, color: '#3B82F6', icon: '😊' },
    { name: 'Stress', data: stress.map(s => 11 - s), color: '#EF4444', icon: '😰' }, // Invert stress for better visualization
    { name: 'Sleep', data: sleep, color: '#8B5CF6', icon: '😴' },
    { name: 'Social', data: social, color: '#10B981', icon: '👥' },
    { name: 'Activity', data: activity, color: '#F59E0B', icon: '🏃' }
  ];

  const getAverage = (data: number[]) => {
    if (data.length === 0) return 0;
    return Math.round((data.reduce((a, b) => a + b, 0) / data.length) * 10) / 10;
  };

  const getTrend = (data: number[]) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3);
    const older = data.slice(0, -3);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.5) return 'up';
    if (difference < -0.5) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Wellbeing Trends</h2>
      
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {metrics.map((metric) => {
          const avg = getAverage(metric.data);
          const trend = getTrend(metric.data);
          const displayData = metric.name === 'Stress' ? stress : metric.data; // Use original stress data for average
          const displayAvg = metric.name === 'Stress' ? getAverage(stress) : avg;
          
          return (
            <div key={metric.name} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">{metric.icon}</div>
              <div className="text-sm font-medium text-gray-700">{metric.name}</div>
              <div className="text-lg font-bold" style={{ color: metric.color }}>
                {displayAvg}
              </div>
              <div className={`text-xs ${getTrendColor(trend)}`}>
                {getTrendIcon(trend)} {trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="w-full h-auto">
          {/* Grid lines */}
          {[2, 4, 6, 8, 10].map((value) => (
            <g key={value}>
              <line
                x1={padding}
                y1={getY(value)}
                x2={chartWidth - padding}
                y2={getY(value)}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={getY(value) + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {dates.map((date, index) => {
            if (index % Math.ceil(dates.length / 6) === 0 || index === dates.length - 1) {
              return (
                <text
                  key={index}
                  x={getX(index)}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {new Date(date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                </text>
              );
            }
            return null;
          })}

          {/* Data lines */}
          {metrics.map((metric) => (
            <path
              key={metric.name}
              d={createPath(metric.data)}
              fill="none"
              stroke={metric.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Data points */}
          {metrics.map((metric) =>
            metric.data.map((value, index) => (
              <circle
                key={`${metric.name}-${index}`}
                cx={getX(index)}
                cy={getY(value)}
                r="3"
                fill={metric.color}
                className="hover:r-4 transition-all cursor-pointer"
              >
                <title>{`${metric.name}: ${metric.name === 'Stress' ? stress[index] : value} on ${new Date(dates[index]).toLocaleDateString()}`}</title>
              </circle>
            ))
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.color }}
            />
            <span className="text-sm text-gray-700">{metric.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        * Stress values are inverted for better visualization (higher line = lower stress)
      </div>
    </div>
  );
};

export default WellbeingTrendsChart;