import {
    MetricsData,
    GeographicData,
    ImpactMetrics,
    EngagementMetrics,
    TimeSeriesData,
    MetricsExport,
} from '../types/metrics';

// Australian rural regions for geographic distribution
const RURAL_REGIONS = [
    { name: 'Far North Queensland', coordinates: [-16.9186, 145.7781] as [number, number] },
    { name: 'Central Queensland', coordinates: [-23.3382, 150.5136] as [number, number] },
    { name: 'Northern Territory', coordinates: [-19.4914, 132.5510] as [number, number] },
    { name: 'Kimberley WA', coordinates: [-17.5217, 124.8553] as [number, number] },
    { name: 'Pilbara WA', coordinates: [-22.5858, 117.8644] as [number, number] },
    { name: 'Central West NSW', coordinates: [-32.9595, 147.3494] as [number, number] },
    { name: 'Riverina NSW', coordinates: [-35.1082, 147.3598] as [number, number] },
    { name: 'Gippsland VIC', coordinates: [-37.8333, 147.1333] as [number, number] },
    { name: 'Western Victoria', coordinates: [-37.5622, 143.8503] as [number, number] },
    { name: 'South Australia Outback', coordinates: [-30.0002, 136.2092] as [number, number] },
    { name: 'Tasmania Rural', coordinates: [-42.0409, 146.5740] as [number, number] },
];

class MetricsService {
    /**
     * Generate simulated metrics data for demo purposes
     */
    generateSimulatedMetrics(): MetricsData {
        const now = Date.now();
        const seed = Math.floor(now / 60000); // Changes every minute for "real-time" effect

        return {
            totalUsers: 1247 + Math.floor(Math.sin(seed) * 50),
            totalConnections: 3842 + Math.floor(Math.cos(seed) * 100),
            totalJobs: 567 + Math.floor(Math.sin(seed * 1.5) * 30),
            totalServicesAccessed: 8934 + Math.floor(Math.cos(seed * 2) * 200),
            skillExchanges: 892 + Math.floor(Math.sin(seed * 0.8) * 40),
            emergencyResponses: 34 + Math.floor(Math.cos(seed * 1.2) * 5),
            serviceUsage: 5621 + Math.floor(Math.sin(seed * 1.8) * 150),
        };
    }

    /**
     * Generate geographic distribution data
     */
    generateGeographicData(): GeographicData[] {
        return RURAL_REGIONS.map((region, index) => ({
            region: region.name,
            userCount: Math.floor(50 + Math.random() * 200 + index * 10),
            coordinates: region.coordinates,
        }));
    }

    /**
     * Calculate impact metrics based on platform usage
     */
    calculateImpactMetrics(metrics: MetricsData): ImpactMetrics {
        // Average time saved per connection (hours)
        const avgTimeSavedPerConnection = 2.5;
        // Average economic value per job (AUD)
        const avgEconomicValuePerJob = 450;
        // Additional economic value from service access
        const avgValuePerServiceAccess = 75;

        return {
            timeSaved: Math.floor(metrics.totalConnections * avgTimeSavedPerConnection),
            economicValue: Math.floor(
                metrics.totalJobs * avgEconomicValuePerJob +
                metrics.totalServicesAccessed * avgValuePerServiceAccess
            ),
            connectionsFacilitated: metrics.totalConnections,
        };
    }

    /**
     * Generate engagement metrics
     */
    generateEngagementMetrics(): EngagementMetrics {
        const seed = Date.now() / 60000;

        return {
            skillExchanges: 892 + Math.floor(Math.sin(seed * 0.8) * 40),
            emergencyResponses: 34 + Math.floor(Math.cos(seed * 1.2) * 5),
            serviceUsage: 5621 + Math.floor(Math.sin(seed * 1.8) * 150),
            gigJobsCompleted: 423 + Math.floor(Math.cos(seed * 1.5) * 25),
            culturalStoriesShared: 156 + Math.floor(Math.sin(seed * 2.1) * 15),
        };
    }

    /**
     * Generate time series data for charts (last 30 days)
     */
    generateTimeSeriesData(days: number = 30): TimeSeriesData[] {
        const data: TimeSeriesData[] = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            // Generate realistic growth pattern
            const baseValue = 100;
            const growth = (days - i) * 5;
            const variance = Math.sin(i * 0.5) * 20;

            data.push({
                date: date.toISOString().split('T')[0] || date.toISOString(),
                value: Math.floor(baseValue + growth + variance),
            });
        }

        return data;
    }

    /**
     * Export metrics data as JSON
     */
    exportMetrics(period: string = 'last-30-days'): MetricsExport {
        const metrics = this.generateSimulatedMetrics();
        const geographic = this.generateGeographicData();
        const impact = this.calculateImpactMetrics(metrics);
        const engagement = this.generateEngagementMetrics();

        return {
            generatedAt: new Date().toISOString(),
            period,
            metrics,
            geographic,
            impact,
            engagement,
        };
    }

    /**
     * Download metrics as JSON file
     */
    downloadMetricsReport(period: string = 'last-30-days'): void {
        const data = this.exportMetrics(period);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rural-connect-metrics-${period}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Download metrics as CSV file
     */
    downloadMetricsCSV(period: string = 'last-30-days'): void {
        const data = this.exportMetrics(period);

        // Create CSV content
        const csvRows = [
            ['Metric', 'Value'],
            ['Generated At', data.generatedAt],
            ['Period', data.period],
            [''],
            ['Core Metrics', ''],
            ['Total Users', data.metrics.totalUsers.toString()],
            ['Total Connections', data.metrics.totalConnections.toString()],
            ['Total Jobs', data.metrics.totalJobs.toString()],
            ['Services Accessed', data.metrics.totalServicesAccessed.toString()],
            [''],
            ['Engagement Metrics', ''],
            ['Skill Exchanges', data.engagement.skillExchanges.toString()],
            ['Emergency Responses', data.engagement.emergencyResponses.toString()],
            ['Service Usage', data.engagement.serviceUsage.toString()],
            ['Gig Jobs Completed', data.engagement.gigJobsCompleted.toString()],
            ['Cultural Stories Shared', data.engagement.culturalStoriesShared.toString()],
            [''],
            ['Impact Metrics', ''],
            ['Time Saved (hours)', data.impact.timeSaved.toString()],
            ['Economic Value (AUD)', `$${data.impact.economicValue.toLocaleString()}`],
            ['Connections Facilitated', data.impact.connectionsFacilitated.toString()],
        ];

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rural-connect-metrics-${period}-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

export const metricsService = new MetricsService();
