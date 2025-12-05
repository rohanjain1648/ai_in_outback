import React from 'react';
import { MetricsDashboard } from './MetricsDashboard';

/**
 * Demo page for the Metrics Dashboard
 * 
 * This component showcases the metrics dashboard with simulated data
 * for demonstration purposes during the hackathon presentation.
 * 
 * Features demonstrated:
 * - Real-time metrics updates
 * - Geographic distribution visualization
 * - Impact calculations
 * - Engagement metrics
 * - Export functionality (JSON/CSV)
 */
export const MetricsDashboardDemo: React.FC = () => {
    return (
        <div className="min-h-screen">
            <MetricsDashboard />
        </div>
    );
};

export default MetricsDashboardDemo;
