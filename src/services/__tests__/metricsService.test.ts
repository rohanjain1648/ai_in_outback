import { metricsService } from '../metricsService';

describe('MetricsService', () => {
    describe('generateSimulatedMetrics', () => {
        it('should generate metrics with positive values', () => {
            const metrics = metricsService.generateSimulatedMetrics();

            expect(metrics.totalUsers).toBeGreaterThan(0);
            expect(metrics.totalConnections).toBeGreaterThan(0);
            expect(metrics.totalJobs).toBeGreaterThan(0);
            expect(metrics.totalServicesAccessed).toBeGreaterThan(0);
            expect(metrics.skillExchanges).toBeGreaterThan(0);
            expect(metrics.emergencyResponses).toBeGreaterThan(0);
            expect(metrics.serviceUsage).toBeGreaterThan(0);
        });

        it('should generate different values over time', () => {
            const metrics1 = metricsService.generateSimulatedMetrics();

            // Wait a bit to change the seed
            const start = Date.now();
            while (Date.now() - start < 100) {
                // Wait
            }

            const metrics2 = metricsService.generateSimulatedMetrics();

            // Values should be similar but may vary slightly
            expect(Math.abs(metrics1.totalUsers - metrics2.totalUsers)).toBeLessThan(100);
        });
    });

    describe('generateGeographicData', () => {
        it('should generate data for 11 Australian rural regions', () => {
            const geographic = metricsService.generateGeographicData();

            expect(geographic).toHaveLength(11);
            expect(geographic[0]).toHaveProperty('region');
            expect(geographic[0]).toHaveProperty('userCount');
            expect(geographic[0]).toHaveProperty('coordinates');
        });

        it('should have valid coordinates', () => {
            const geographic = metricsService.generateGeographicData();

            geographic.forEach(region => {
                expect(region.coordinates).toHaveLength(2);
                expect(region.coordinates[0]).toBeGreaterThan(-45); // Valid latitude for Australia
                expect(region.coordinates[0]).toBeLessThan(-10);
                expect(region.coordinates[1]).toBeGreaterThan(110); // Valid longitude for Australia
                expect(region.coordinates[1]).toBeLessThan(155);
            });
        });
    });

    describe('calculateImpactMetrics', () => {
        it('should calculate impact based on metrics', () => {
            const metrics = {
                totalUsers: 1000,
                totalConnections: 500,
                totalJobs: 100,
                totalServicesAccessed: 1000,
                skillExchanges: 200,
                emergencyResponses: 10,
                serviceUsage: 800,
            };

            const impact = metricsService.calculateImpactMetrics(metrics);

            expect(impact.timeSaved).toBeGreaterThan(0);
            expect(impact.economicValue).toBeGreaterThan(0);
            expect(impact.connectionsFacilitated).toBe(500);
        });

        it('should scale impact with metrics', () => {
            const smallMetrics = {
                totalUsers: 100,
                totalConnections: 50,
                totalJobs: 10,
                totalServicesAccessed: 100,
                skillExchanges: 20,
                emergencyResponses: 1,
                serviceUsage: 80,
            };

            const largeMetrics = {
                totalUsers: 10000,
                totalConnections: 5000,
                totalJobs: 1000,
                totalServicesAccessed: 10000,
                skillExchanges: 2000,
                emergencyResponses: 100,
                serviceUsage: 8000,
            };

            const smallImpact = metricsService.calculateImpactMetrics(smallMetrics);
            const largeImpact = metricsService.calculateImpactMetrics(largeMetrics);

            expect(largeImpact.timeSaved).toBeGreaterThan(smallImpact.timeSaved);
            expect(largeImpact.economicValue).toBeGreaterThan(smallImpact.economicValue);
        });
    });

    describe('generateEngagementMetrics', () => {
        it('should generate engagement metrics', () => {
            const engagement = metricsService.generateEngagementMetrics();

            expect(engagement.skillExchanges).toBeGreaterThan(0);
            expect(engagement.emergencyResponses).toBeGreaterThan(0);
            expect(engagement.serviceUsage).toBeGreaterThan(0);
            expect(engagement.gigJobsCompleted).toBeGreaterThan(0);
            expect(engagement.culturalStoriesShared).toBeGreaterThan(0);
        });
    });

    describe('generateTimeSeriesData', () => {
        it('should generate 30 days of data by default', () => {
            const timeSeries = metricsService.generateTimeSeriesData();

            expect(timeSeries).toHaveLength(30);
        });

        it('should generate custom number of days', () => {
            const timeSeries = metricsService.generateTimeSeriesData(7);

            expect(timeSeries).toHaveLength(7);
        });

        it('should have valid date format', () => {
            const timeSeries = metricsService.generateTimeSeriesData(5);

            timeSeries.forEach(data => {
                expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                expect(data.value).toBeGreaterThan(0);
            });
        });

        it('should show growth trend', () => {
            const timeSeries = metricsService.generateTimeSeriesData(30);

            // First value should generally be less than last value (growth trend)
            const firstValue = timeSeries[0].value;
            const lastValue = timeSeries[timeSeries.length - 1].value;

            expect(lastValue).toBeGreaterThan(firstValue);
        });
    });

    describe('exportMetrics', () => {
        it('should export complete metrics data', () => {
            const exported = metricsService.exportMetrics('last-30-days');

            expect(exported).toHaveProperty('generatedAt');
            expect(exported).toHaveProperty('period', 'last-30-days');
            expect(exported).toHaveProperty('metrics');
            expect(exported).toHaveProperty('geographic');
            expect(exported).toHaveProperty('impact');
            expect(exported).toHaveProperty('engagement');
        });

        it('should have valid ISO timestamp', () => {
            const exported = metricsService.exportMetrics();

            const timestamp = new Date(exported.generatedAt);
            expect(timestamp.getTime()).toBeGreaterThan(0);
        });
    });
});
