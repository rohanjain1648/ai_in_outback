import React, { useState } from 'react';
import { BusinessSearchFilters, BUSINESS_CATEGORIES, BUSINESS_TYPES } from '../types/business';

interface BusinessFiltersProps {
  filters: BusinessSearchFilters;
  onFilterChange: (filters: Partial<BusinessSearchFilters>) => void;
  onClearFilters: () => void;
}

const BusinessFilters: React.FC<BusinessFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (category: string) => {
    onFilterChange({ 
      category: category === filters.category ? undefined : category,
      subcategory: undefined // Clear subcategory when category changes
    });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    onFilterChange({ 
      subcategory: subcategory === filters.subcategory ? undefined : subcategory 
    });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ 
      rating: rating === filters.rating ? undefined : rating 
    });
  };

  const handleVerifiedChange = (verified: boolean) => {
    onFilterChange({ 
      verified: verified === filters.verified ? undefined : verified 
    });
  };

  const handleBusinessTypeChange = (businessType: string) => {
    onFilterChange({ 
      businessType: businessType === filters.businessType ? undefined : businessType 
    });
  };

  const hasActiveFilters = !!(
    filters.category || 
    filters.subcategory || 
    filters.rating || 
    filters.verified !== undefined || 
    filters.businessType ||
    filters.tags?.length ||
    filters.services?.length
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <span>Filter Options</span>
          <svg
            className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className={`space-y-6 ${!isExpanded ? 'hidden lg:block' : ''}`}>
        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {BUSINESS_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.category === category}
                  onChange={() => handleCategoryChange(category)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Business Type Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Business Type</h4>
          <div className="space-y-2">
            {BUSINESS_TYPES.map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.businessType === type}
                  onChange={() => handleBusinessTypeChange(type)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {type.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 flex items-center">
                  <div className="flex items-center">
                    {[...Array(rating)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    {[...Array(5 - rating)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">& up</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Verification</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.verified === true}
                onChange={() => handleVerifiedChange(true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Only
              </span>
            </label>
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Location</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search Radius (km)
              </label>
              <select
                value={filters.location?.radius || 25}
                onChange={(e) => onFilterChange({
                  location: {
                    ...filters.location,
                    radius: parseInt(e.target.value)
                  } as any
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
                <option value={250}>250 km</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      onFilterChange({
                        location: {
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude,
                          radius: filters.location?.radius || 25
                        }
                      });
                    },
                    (error) => {
                      console.error('Error getting location:', error);
                      alert('Unable to get your location. Please enable location services.');
                    }
                  );
                } else {
                  alert('Geolocation is not supported by this browser.');
                }
              }}
              className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Location
            </button>
            
            {filters.location && (
              <div className="text-xs text-gray-500">
                <p>Searching within {filters.location.radius}km of your location</p>
                <button
                  onClick={() => onFilterChange({ location: undefined })}
                  className="text-blue-600 hover:text-blue-800 mt-1"
                >
                  Clear location filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessFilters;