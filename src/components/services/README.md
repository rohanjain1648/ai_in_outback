# Service Navigator UI

The Service Navigator is a comprehensive UI for discovering and accessing rural services including health, transport, government, emergency, and other essential services.

## Features

### 🔍 Search & Discovery
- **Text Search**: Search services by name, description, or keywords
- **Voice Search**: Use voice commands to search for services hands-free
- **Category Filters**: Browse services by category (health, transport, emergency, etc.)
- **Location-Based**: Automatically shows services near your location with distance
- **Advanced Filters**: Filter by verified status, ratings, essential services, and offline availability

### 📱 Offline Support
- **Cached Essential Services**: Access critical services even when offline
- **Low Data Mode**: Simplified UI with reduced data usage
- **Online/Offline Indicator**: Clear status of connectivity

### 📋 Service Details
- **Comprehensive Information**: View full service details including contact info, hours, and location
- **Quick Actions**: Call, email, visit website, or get directions with one click
- **Accessibility Info**: View wheelchair access, parking, and other accessibility features
- **Reviews & Ratings**: Read reviews and submit your own ratings

### 🎤 Voice Integration
- Integrated with VoiceInterface component
- Natural language voice search
- Voice feedback for search results

## Components

### ServiceNavigator
Main component that provides the search interface and results display.

```tsx
import { ServiceNavigator } from '@/components/services';

<ServiceNavigator
  initialLocation={{ lat: -37.8136, lon: 144.9631 }}
  enableVoiceSearch={true}
/>
```

**Props:**
- `initialLocation?: { lat: number; lon: number }` - Initial user location
- `enableVoiceSearch?: boolean` - Enable voice search (default: true)
- `className?: string` - Additional CSS classes

### ServiceCard
Displays a service listing in card format.

```tsx
import { ServiceCard } from '@/components/services';

<ServiceCard
  service={serviceData}
  onClick={() => handleServiceClick(serviceData)}
  showDistance={true}
  lowDataMode={false}
/>
```

**Props:**
- `service: ServiceListing` - Service data to display
- `onClick?: () => void` - Click handler
- `showDistance?: boolean` - Show distance from user (default: true)
- `lowDataMode?: boolean` - Use simplified display (default: false)

### ServiceDetailView
Modal view showing full service details.

```tsx
import { ServiceDetailView } from '@/components/services';

<ServiceDetailView
  service={serviceData}
  onClose={() => setSelectedService(null)}
  onAddReview={(rating, comment) => handleReview(rating, comment)}
/>
```

**Props:**
- `service: ServiceListing` - Service to display
- `onClose: () => void` - Close handler
- `onAddReview?: (rating: number, comment: string) => void` - Review submission handler

## Service Directory Service

Frontend service for communicating with the backend API.

```typescript
import { serviceDirectoryService } from '@/services/serviceDirectoryService';

// Search services
const results = await serviceDirectoryService.searchServices(
  {
    query: 'health',
    category: 'health',
    location: { lat: -37.8136, lon: 144.9631 },
    verified: true,
    minRating: 4
  },
  {
    limit: 20,
    sortBy: 'distance',
    lowDataMode: false
  }
);

// Get essential services for offline
const essential = await serviceDirectoryService.getEssentialServices(location);

// Add a review
await serviceDirectoryService.addServiceReview(serviceId, 5, 'Great service!');

// Get service categories
const categories = await serviceDirectoryService.getServiceCategories();
```

## Usage Example

```tsx
import React from 'react';
import { ServiceNavigator } from '@/components/services';

function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ServiceNavigator
        enableVoiceSearch={true}
      />
    </div>
  );
}

export default ServicesPage;
```

## Voice Commands

The Service Navigator supports the following voice commands:

- "Search for health services"
- "Find transport near me"
- "Show emergency services"
- "Look for government services"

## Offline Functionality

The Service Navigator automatically:
1. Caches essential services for offline access
2. Detects online/offline status
3. Shows cached services when offline
4. Syncs data when connection is restored

## Low Data Mode

When enabled, Low Data Mode:
- Reduces the amount of data displayed per service
- Simplifies the UI
- Prioritizes essential information
- Caches more aggressively

## Accessibility

- Full keyboard navigation support
- ARIA labels for screen readers
- High contrast mode compatible
- Voice search for hands-free operation
- Clear visual indicators for all states

## Backend Integration

The Service Navigator integrates with the backend Service Directory API:

- `GET /api/services/search` - Search services
- `GET /api/services/:id` - Get service details
- `GET /api/services/essential` - Get essential services
- `POST /api/services/:id/review` - Add review
- `POST /api/services/:id/contact` - Record contact
- `GET /api/services/categories` - Get categories

## Requirements Validated

This implementation validates the following requirements:

- **5.1**: Search services using integrated Australian government APIs and local databases
- **5.2**: Process voice and text queries with natural language
- **5.3**: Display services with distance, availability, contact info, and ratings
- **5.4**: Use low-data mode with cached essential services
- **5.5**: Suggest alternatives and provide offline contact information

## Future Enhancements

- Map view integration
- Service booking/appointment scheduling
- Push notifications for service updates
- Multi-language support
- Service comparison feature
- Favorite services
- Service history tracking
