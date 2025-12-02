import React, { useState, useEffect } from 'react';
import { SearchFilters, ResourceCategory } from '../types/resource';
import { resourceService } from '../services/resourceService';

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  aggregations?: {
    categories: { key: string; doc_count: number }[];
    states: { key: string; doc_count: number }[];
    pricing_types: { key: string; doc_count: number }[];
    availability_status: { key: string; doc_count: number }[];
    popular_tags: { key: string; doc_count: number }[];
  };
}

const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  aggregations
}) => {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // Load categories
    resourceService.getCategories().then(result => {
      setCategories(result.categories);
    }).catch(console.error);
  }, []);

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      category: category === filters.category ? undefined : category
    });
  };

  const handleAvailabilityChange = (availability: string) => {
    onFiltersChange({
      availability: availability === filters.availability ? undefined : availability
    });
  };

  const handlePricingChange = (pricing: string) => {
    onFiltersChange({
      pricing: pricing === filters.pricing ? undefined : pricing
    });
  };

  const handleVerifiedChange = (verified: boolean) => {
    onFiltersChange({
      verified: verified === filters.verified ? undefined : verified
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      minRating: rating === filters.minRating ? undefined : rating
    });
  };

  const handleRadiusChange = (radius: string) => {
    onFiltersChange({ radius });
  };

  const handleTagAdd = (tag: string) => {
    if (!tag.trim()) return;
    
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tag.trim())) {
      onFiltersChange({
        tags: [...currentTags, tag.trim()]
      });
    }
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    const currentTags = filters.tags || [];
    onFiltersChange({
      tags: currentTags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd(tagInput);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: undefined,
      availability: undefined,
      pricing: undefined,
      tags: undefined,
      verified: undefined,
      minRating: undefined,
      radius: '50km'
    });
  };

  const hasActiveFilters = !!(
    filters.category ||
    filters.availability ||
    filters.pricing ||
    (filters.tags && filters.tags.length > 0) ||
    filters.verified !== undefined ||
    filters.minRating
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Category Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Category</h4>
          <div className="space-y-2">
            {(aggregations?.categories || categories.map(cat => ({ key: cat.category, doc_count: cat.count }))).map((category) => (
              <label key={category.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.category === category.key}
                  onChange={() => handleCategoryChange(category.key)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {resourceService.getCategoryDisplayName(category.key)}
                  <span className="text-gray-500 ml-1">({category.doc_count})</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
          <div className="space-y-2">
            {['available', 'limited', 'unavailable'].map((status) => {
              const count = aggregations?.availability_status?.find(a => a.key === status)?.doc_count || 0;
              return (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.availability === status}
                    onChange={() => handleAvailabilityChange(status)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {resourceService.getAvailabilityDisplayName(status)}
                    {aggregations && <span className="text-gray-500 ml-1">({count})</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Pricing Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Pricing</h4>
          <div className="space-y-2">
            {['free', 'paid', 'donation', 'barter'].map((type) => {
              const count = aggregations?.pricing_types?.find(p => p.key === type)?.doc_count || 0;
              return (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.pricing === type}
                    onChange={() => handlePricingChange(type)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {resourceService.getPricingDisplayName(type)}
                    {aggregations && <span className="text-gray-500 ml-1">({count})</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Distance Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Distance</h4>
          <select
            value={filters.radius || '50km'}
            onChange={(e) => handleRadiusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="5km">Within 5km</option>
            <option value="10km">Within 10km</option>
            <option value="25km">Within 25km</option>
            <option value="50km">Within 50km</option>
            <option value="100km">Within 100km</option>
            <option value="200km">Within 200km</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Minimum Rating</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.minRating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center">
                  {rating}+ stars
                  <div className="ml-1 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Verified Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Verification</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.verified === true}
              onChange={() => handleVerifiedChange(true)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Verified resources only
            </span>
          </label>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
        
        {/* Tag Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={() => handleTagAdd(tagInput)}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
          >
            Add
          </button>
        </div>

        {/* Current Tags */}
        {filters.tags && filters.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {filters.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Popular Tags */}
        {aggregations?.popular_tags && aggregations.popular_tags.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
            <div className="flex flex-wrap gap-2">
              {aggregations.popular_tags.slice(0, 10).map((tag) => (
                <button
                  key={tag.key}
                  onClick={() => handleTagAdd(tag.key)}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  {tag.key} ({tag.doc_count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFiltersPanel;