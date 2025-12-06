# Metrics Dashboard

## Overview

The Metrics Dashboard provides comprehensive analytics and insights into the Rural Connect AI platform's performance, user engagement, and community impact. Built with Chart.js and React, it offers real-time visualizations and export capabilities for demo and administrative purposes.

## Features

### Core Metrics
- **Total Users**: Active platform users across rural Australia
- **Connections Made**: Meaningful connections facilitated between community members
- **Jobs Completed**: Gig economy jobs successfully completed
- **Services Accessed**: Government and community services accessed through the platform

### Impact Metrics
- **Time Saved**: Calculated hours saved by the community through platform efficiency
- **Economic Value**: Total economic value generated (AUD) from jobs and service access
- **Connections Facilitated**: Number of meaningful connections made

### Engagement Metrics
- Skill exchanges completed
- Emergency responses coordinated
- Service usage statistics
- Gig jobs completed
- Cultural stories shared

### Geographic Distribution
- User density by rural region
- Interactive map visualization
- Top regions ranking

### Visualizations
- **Line Chart**: User growth over time (30-day trend)
- **Bar Chart**: Geographic distribution by region
- **Doughnut Chart**: Engagement metrics breakdown
- **Metric Cards**: Real-time key performance indicators

## Usage

### Basic Implementation

```tsx
import { MetricsDashboard } from './components/admin/MetricsDashboard';

function App() {
  return <MetricsDashboard />;
}
```

### Demo Mode

```tsx
import { MetricsDashboardDemo } from './components/admin/MetricsDashboardDemo';

function DemoPage() {
  return <MetricsDashboardDemo />;
}
```

## Data Generation

The dashboard uses simulated data for demonstration purposes:

```typescript
import { metricsService } from './services/metricsService';

// Generate simulated metrics
const metrics = metricsService.generateSimulatedMetrics();

// Generate geographic data
const geographic = metricsService.generateGeographicData();

// Calculate impact metrics
const impact = metricsService.calculateImpactMetrics(metrics);
```

## Export Functionality

### JSON Export
```typescript
metricsService.downloadMetricsReport('last-30-days');
```

### CSV Export
```typescript
metricsService.downloadMetricsCSV('last-30-days');
```

## Auto-Refresh

The dashboard supports auto-refresh functionality:
- Refreshes every 30 seconds when enabled
- Toggle on/off via the UI
- Manual refresh button available

## Customization

### Adding New Metrics

1. Update the `MetricsData` type in `src/types/metrics.ts`
2. Add generation logic in `metricsService.generateSimulatedMetrics()`
3. Create a new `MetricCard` in the dashboard component

### Adding New Charts

1. Import the chart type from `react-chartjs-2`
2. Prepare the data in the required format
3. Add the chart component to the dashboard layout

## Requirements Validation

This component validates the following requirements:

- **8.1**: Displays total users, connections made, and jobs completed ✓
- **8.2**: Shows geographic distribution of users across rural regions ✓
- **8.3**: Displays engagement metrics (skill exchanges, emergency responses, service usage) ✓
- **8.4**: Calculates and shows impact metrics (time saved, economic value, connections) ✓
- **8.5**: Uses simulated realistic data for demonstration purposes ✓

## Technical Stack

- **React**: Component framework
- **Chart.js**: Charting library
- **react-chartjs-2**: React wrapper for Chart.js
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **TypeScript**: Type safety

## Performance Considerations

- Charts use `maintainAspectRatio: false` for responsive sizing
- Auto-refresh interval set to 30 seconds to balance real-time feel with performance
- Simulated data generation is lightweight and fast
- Export functions use Blob API for efficient file downloads

## Future Enhancements

- Real API integration for production data
- Date range selector for historical analysis
- Comparison views (month-over-month, year-over-year)
- Drill-down capabilities for detailed insights
- Custom metric filtering and sorting
- PDF export functionality
- Email report scheduling
