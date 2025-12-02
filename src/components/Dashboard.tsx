import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Performance Dashboard
      </h3>
      <p className="text-gray-600">
        This dashboard demonstrates lazy loading and performance optimization features.
      </p>
    </div>
  );
};

export default Dashboard;