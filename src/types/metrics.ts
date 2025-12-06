export interface MetricsData {
    totalUsers: number;
    totalConnections: number;
    totalJobs: number;
    totalServicesAccessed: number;
    skillExchanges: number;
    emergencyResponses: number;
    serviceUsage: number;
}

export interface GeographicData {
    region: string;
    userCount: number;
    coordinates: [number, number];
}

export interface ImpactMetrics {
    timeSaved: number; // hours
    economicValue: number; // AUD
    connectionsFacilitated: number;
}

export interface EngagementMetrics {
    skillExchanges: number;
    emergencyResponses: number;
    serviceUsage: number;
    gigJobsCompleted: number;
    culturalStoriesShared: number;
}

export interface TimeSeriesData {
    date: string;
    value: number;
}

export interface MetricsExport {
    generatedAt: string;
    period: string;
    metrics: MetricsData;
    geographic: GeographicData[];
    impact: ImpactMetrics;
    engagement: EngagementMetrics;
}
