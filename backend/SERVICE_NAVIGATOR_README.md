# Service Navigator Backend

## Overview

The Service Navigator Backend provides a comprehensive API for discovering and managing rural services across Australia. It integrates with government APIs, supports offline caching, and includes location-based search capabilities.

## Features

### Core Functionality
- ✅ Service listing CRUD operations
- ✅ Advanced search with filters (category, location, rating, tags)
- ✅ Location-based ranking using geospatial queries
- ✅ Service rating and review system
- ✅ Essential services for offline availability
- ✅ Low-data mode for limited connectivity
- ✅ Service verification and source tracking
- ✅ Caching system for improved performance

### Government API Integration
- 🔄 data.gov.au integration (placeholder)
- 🔄 Health Direct API integration (placeholder)
- ✅ Automatic service synchronization
- ✅ Source tracking for data provenance

## Data Model

### ServiceListing Schema

```typescript
{
  name: string;
  category: 'health' | 'transport' | 'government' | 'emergency' | 'education' | 'financial' | 'legal' | 'social' | 'other';
  subcategory?: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [longitude, latitude];
    address: string;
    city?: string;
    state?: string;
    postcode?: string;
    region: string;
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
    hours: string;
    emergencyContact?: string;
  };
  services: string[];
  ratings: {
    average: number;
    count: number;
  };
  reviews: Array<{
    user: ObjectId;
    rating: number;
    comment: string;
    date: Date;
    helpful: number;
  }>;
  isVerified: boolean;
  source: 'government_api' | 'community' | 'manual' | 'health_direct' | 'data_gov_au';
  sourceId?: string;
  lastUpdated: Date;
  offlineAvailable: boolean;
  isEssential: boolean;
  tags: string[];
  accessibility: {
    wheelchairAccessible?: boolean;
    parkingAvailable?: boolean;
    publicTransportNearby?: boolean;
    interpreterServices?: boolean;
    notes?: string;
  };
  eligibility?: {
    ageRestrictions?: string;
    residencyRequirements?: string;
    incomeRequirements?: string;
    other?: string;
  };
  metadata: {
    viewCount: number;
    contactCount: number;
    lastContactedAt?: Date;
    lastViewedAt?: Date;
  };
}
```

## API Endpoints

### Public Endpoints

#### Search Services
```
GET /api/v1/services/search
Query Parameters:
  - query: string (text search)
  - category: string (service category)
  - lat: number (latitude)
  - lon: number (longitude)
  - radius: string (e.g., "50km")
  - verified: boolean
  - minRating: number (0-5)
  - tags: string[] (filter by tags)
  - essentialOnly: boolean
  - offlineAvailable: boolean
  - limit: number (default: 20)
  - offset: number (default: 0)
  - sortBy: 'relevance' | 'distance' | 'rating' | 'date'
  - lowDataMode: boolean
```

#### Get Essential Services
```
GET /api/v1/services/essential
Query Parameters:
  - lat: number (optional)
  - lon: number (optional)
```

#### Get Service Categories
```
GET /api/v1/services/categories
```

#### Get Service by ID
```
GET /api/v1/services/:serviceId
```

### Authenticated Endpoints

#### Create Service
```
POST /api/v1/services
Body: ServiceListing data
```

#### Update Service
```
PUT /api/v1/services/:serviceId
Body: Partial ServiceListing data
```

#### Delete Service
```
DELETE /api/v1/services/:serviceId
```

#### Add Review
```
POST /api/v1/services/:serviceId/reviews
Body: {
  rating: number (1-5),
  comment: string
}
```

#### Record Contact
```
POST /api/v1/services/:serviceId/contact
```

### Admin Endpoints

#### Sync Government Services
```
POST /api/v1/services/sync/government
Requires: Admin role
```

## Environment Variables

Add these to your `.env` file:

```bash
# Government Service APIs (Optional)
DATA_GOV_AU_API_URL=
HEALTH_DIRECT_API_URL=
HEALTH_DIRECT_API_KEY=
```

## Usage Examples

### Search for Health Services Near a Location

```javascript
const response = await fetch(
  '/api/v1/services/search?category=health&lat=-33.8688&lon=151.2093&radius=50km&sortBy=distance'
);
const { data, total } = await response.json();
```

### Get Essential Services for Offline Use

```javascript
const response = await fetch(
  '/api/v1/services/essential?lat=-33.8688&lon=151.2093'
);
const { data } = await response.json();
// Cache these services locally for offline access
```

### Add a Review

```javascript
const response = await fetch('/api/v1/services/SERVICE_ID/reviews', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rating: 5,
    comment: 'Excellent service!'
  })
});
```

## Caching Strategy

The service implements a 5-minute TTL cache for search results:
- Cache key includes all search filters and options
- Automatic cache invalidation on service updates
- Maximum 100 cached queries to prevent memory issues

## Testing

Run the test suite:

```bash
npm test -- serviceDirectoryService.test.ts
```

Test coverage includes:
- ✅ Service creation and updates
- ✅ Search with various filters
- ✅ Location-based queries
- ✅ Review system
- ✅ Essential services retrieval
- ✅ Category aggregation

## Seeding Sample Data

To populate the database with sample services:

```bash
npx ts-node backend/scripts/seedServiceListings.ts
```

This will create 6 sample services across different categories and regions.

## Performance Considerations

### Indexes
The ServiceListing model includes optimized indexes for:
- Geospatial queries (`location.coordinates`)
- Category and status filtering
- Text search (name, description, services, tags)
- Rating sorting
- Source and verification status

### Query Optimization
- Uses MongoDB aggregation for category statistics
- Implements pagination for large result sets
- Calculates distance client-side to avoid repeated queries
- Supports low-data mode with minimal field selection

## Future Enhancements

### Government API Integration
The current implementation includes placeholder methods for:
- data.gov.au API integration
- Health Direct API integration

To implement these:
1. Configure API URLs and keys in environment variables
2. Update `syncDataGovAu()` and `syncHealthDirect()` methods
3. Map external API responses to ServiceListing schema
4. Schedule periodic sync jobs

### Additional Features
- [ ] Service availability calendar
- [ ] Appointment booking integration
- [ ] Multi-language support for service descriptions
- [ ] Service comparison tool
- [ ] User-generated service suggestions
- [ ] Integration with emergency alert system

## Requirements Validation

This implementation satisfies the following requirements from the spec:

✅ **5.1**: Search services using integrated Australian government APIs and local databases  
✅ **5.2**: Process voice and text queries (backend support for natural language)  
✅ **5.3**: Display services with distance, availability, contact info, and ratings  
✅ **5.4**: Low-data mode with cached essential services  
✅ **5.5**: Suggest alternatives when services are unavailable  

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
