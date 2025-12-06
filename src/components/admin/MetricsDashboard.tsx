import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { metricsService } from '../../services/metricsService';
import {
    MetricsData,
    GeographicData,
    ImpactMetrics,
    EngagementMetrics,
} from '../../types/metrics';
import {
    Users,
    Link2,
    Briefcase,
    Server,
    TrendingUp,
    Download,
    RefreshCw,
    MapPin,
    Clock,
    DollarSign,
    Activity,
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
                <p className="text-white text-3xl font-bold">{value}</p>
                {trend && (
                    <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </p>
                )}
            </div>
            <div className="text-white/90">{icon}</div>
        </div>
    </div>
);

export const MetricsDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [geographic, setGeographic] = useState<GeographicData[]>([]);
    const [impact, setImpact] = useState<ImpactMetrics | null>(null);
    const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const loadMetrics = () => {
        setIsRefreshing(true);
        const metricsData = metricsService.generateSimulatedMetrics();
        const geographicData = metricsService.generateGeographicData();
        const impactData = metricsService.calculateImpactMetrics(metricsData);
        const engagementData = metricsService.generateEngagementMetrics();

        setMetrics(metricsData);
        setGeographic(geographicData);
        setImpact(impactData);
        setEngagement(engagementData);

        setTimeout(() => setIsRefreshing(false), 500);
    };

    useEffect(() => {
        loadMetrics();
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
        return undefined;
    }, [autoRefresh]);

    const handleExportJSON = () => {
        metricsService.downloadMetricsReport('last-30-days');
    };

    const handleExportCSV = () => {
        metricsService.downloadMetricsCSV('last-30-days');
    };

    if (!metrics || !impact || !engagement) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading metrics...</p>
                </div>
            </div>
        );
    }

    // Time series data for user growth
    const timeSeriesData = metricsService.generateTimeSeriesData(30);

    const userGrowthData = {
        labels: timeSeriesData.map(d => d.date),
        datasets: [
            {
                label: 'Total Users',
                data: timeSeriesData.map(d => d.value),
                borderColor: 'rgb(147, 51, 234)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Geographic distribution data
    const geographicChartData = {
        labels: geographic.slice(0, 8).map(g => g.region),
        datasets: [
            {
                label: 'Users by Region',
                data: geographic.slice(0, 8).map(g => g.userCount),
                backgroundColor: [
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(192, 132, 252, 0.8)',
                    'rgba(216, 180, 254, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(96, 165, 250, 0.8)',
                    'rgba(147, 197, 253, 0.8)',
                    'rgba(191, 219, 254, 0.8)',
                ],
            },
        ],
    };

    // Engagement metrics data
    const engagementChartData = {
        labels: ['Skill Exchanges', 'Emergency Responses', 'Service Usage', 'Gig Jobs', 'Cultural Stories'],
        datasets: [
            {
                label: 'Engagement Metrics',
                data: [
                    engagement.skillExchanges,
                    engagement.emergencyResponses,
                    engagement.serviceUsage,
                    engagement.gigJobsCompleted,
                    engagement.culturalStoriesShared,
                ],
                backgroundColor: [
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                ],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Platform Metrics Dashboard
                            </h1>
                            <p className="text-purple-200">
                                Real-time insights into Rural Connect AI platform performance
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${autoRefresh
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-700 text-gray-300'
                                    }`}
                            >
                                {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
                            </button>
                            <button
                                onClick={loadMetrics}
                                disabled={isRefreshing}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={handleExportJSON}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export JSON
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-200 text-sm">
                            📊 Demo Mode: Displaying simulated data for demonstration purposes
                        </p>
                    </div>
                </div>

                {/* Core Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Users"
                        value={metrics.totalUsers.toLocaleString()}
                        icon={<Users className="w-8 h-8" />}
                        trend="+12% this month"
                        color="from-purple-600 to-purple-800"
                    />
                    <MetricCard
                        title="Connections Made"
                        value={metrics.totalConnections.toLocaleString()}
                        icon={<Link2 className="w-8 h-8" />}
                        trend="+18% this month"
                        color="from-blue-600 to-blue-800"
                    />
                    <MetricCard
                        title="Jobs Completed"
                        value={metrics.totalJobs.toLocaleString()}
                        icon={<Briefcase className="w-8 h-8" />}
                        trend="+8% this month"
                        color="from-green-600 to-green-800"
                    />
                    <MetricCard
                        title="Services Accessed"
                        value={metrics.totalServicesAccessed.toLocaleString()}
                        icon={<Server className="w-8 h-8" />}
                        trend="+15% this month"
                        color="from-orange-600 to-orange-800"
                    />
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-purple-400" />
                            <h3 className="text-xl font-semibold text-white">Time Saved</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-2">
                            {impact.timeSaved.toLocaleString()}
                        </p>
                        <p className="text-purple-200">hours saved by community</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSign className="w-6 h-6 text-green-400" />
                            <h3 className="text-xl font-semibold text-white">Economic Value</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-2">
                            ${impact.economicValue.toLocaleString()}
                        </p>
                        <p className="text-green-200">generated for rural communities</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-6 h-6 text-blue-400" />
                            <h3 className="text-xl font-semibold text-white">Connections</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-2">
                            {impact.connectionsFacilitated.toLocaleString()}
                        </p>
                        <p className="text-blue-200">meaningful connections made</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* User Growth Chart */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            User Growth (Last 30 Days)
                        </h3>
                        <div className="h-64">
                            <Line data={userGrowthData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Geographic Distribution */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            Geographic Distribution
                        </h3>
                        <div className="h-64">
                            <Bar data={geographicChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Engagement Metrics Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-400" />
                            Engagement Breakdown
                        </h3>
                        <div className="h-64">
                            <Doughnut data={engagementChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Top Regions List */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-orange-400" />
                            Top Regions by User Count
                        </h3>
                        <div className="space-y-3">
                            {geographic
                                .sort((a, b) => b.userCount - a.userCount)
                                .slice(0, 8)
                                .map((region, index) => (
                                    <div
                                        key={region.region}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-purple-400 font-bold text-lg">
                                                #{index + 1}
                                            </span>
                                            <span className="text-white font-medium">{region.region}</span>
                                        </div>
                                        <span className="text-purple-300 font-semibold">
                                            {region.userCount} users
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricsDashboard;
