import React, { useState, useEffect, useCallback } from 'react';
import { Resource, SearchFilters, SearchResult } from '../types/resource';
import { resourceService } from '../services/resourceService';
import { useGeolocation } from '../hooks/useGeolocation';
import ResourceCard from './ResourceCard';
import SearchFiltersPanel from './SearchFiltersPanel';
import SearchSuggestions from './SearchSuggestions';

interface ResourceSearchProps {
  initialQuery?: string;
  initialCategory?: string;
  showFilters?: boolean;
}

const ResourceSearch: React.FC<ResourceSearchProps> = ({
  initialQuery = '',
  initialCategory = '',
  showFilters = true
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    category: initialCategory,
    limit: 20,
    offset: 0,
    sortBy: 'relevance',
    useAI: false
  });
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const { location, loading: locationLoading } = useGeolocation();

  // Update filters with user location when available
  useEffect(() => {
    if (location && !filters.lat && !filters.lon) {
      setFilters(prev => ({
        ...prev,
        lat: location.latitude,
        lon: location.longitude,
        radius: '50km'
      }));
    }
  }, [location, filters.lat, filters.lon]);

  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await resourceService.searchResources(searchFilters);
      setSearchResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Perform search when filters change
  useEffect(() => {
    if (filters.query || filters.category || filters.lat) {
      performSearch(filters);
    }
  }, [filters, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      query: searchQuery,
      offset: 0
    }));
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const handleLoadMore = () => {
    if (searchResult && searchResult.resources.length < searchResult.total) {
      setFilters(prev => ({
        ...prev,
        offset: prev.offset! + prev.limit!
      }));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setFilters(prev => ({
      ...prev,
      query: suggestion,
      offset: 0
    }));
  };

  const toggleAISearch = () => {
    setFilters(prev => ({
      ...prev,
      useAI: !prev.useAI,
      offset: 0
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Community Resources
        </h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for equipment, services, knowledge, or anything you need..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* AI Search Toggle */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.useAI}
              onChange={toggleAISearch}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              Use AI-powered search (understands natural language)
            </span>
          </label>
          
          {showFilters && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-green-600 hover:text-green-700"
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </button>
          )}
        </div>

        {/* Location Status */}
        {locationLoading && (
          <div className="text-sm text-gray-600 mb-2">
            Getting your location for better results...
          </div>
        )}
        
        {location && (
          <div className="text-sm text-gray-600 mb-2">
            Searching near your location ({filters.radius || '50km'} radius)
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <SearchFiltersPanel
          filters={filters}
          onFiltersChange={handleFilterChange}
          aggregations={searchResult?.aggregations}
        />
      )}

      {/* AI Insights */}
      {searchResult?.aiInsights && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">AI Search Insights</h3>
          <div className="text-sm text-blue-800">
            {searchResult.aiInsights.urgency && (
              <span className="inline-block bg-blue-100 px-2 py-1 rounded mr-2 mb-1">
                Urgency: {searchResult.aiInsights.urgency}
              </span>
            )}
            {searchResult.aiInsights.category && (
              <span className="inline-block bg-blue-100 px-2 py-1 rounded mr-2 mb-1">
                Category: {resourceService.getCategoryDisplayName(searchResult.aiInsights.category)}
              </span>
            )}
            {searchResult.aiInsights.tags.length > 0 && (
              <div className="mt-2">
                <span className="text-blue-700">Detected keywords: </span>
                {searchResult.aiInsights.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-blue-100 px-2 py-1 rounded mr-1 mb-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {searchResult?.suggestions && searchResult.suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={searchResult.suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResult && (
        <div>
          {/* Results Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {searchResult.total > 0 ? (
                <>
                  {searchResult.total} resource{searchResult.total !== 1 ? 's' : ''} found
                  {filters.query && ` for "${filters.query}"`}
                </>
              ) : (
                'No resources found'
              )}
            </h2>
            
            {searchResult.total > 0 && (
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="relevance">Most Relevant</option>
                <option value="distance">Nearest First</option>
                <option value="rating">Highest Rated</option>
                <option value="date">Most Recent</option>
                <option value="popularity">Most Popular</option>
              </select>
            )}
          </div>

          {/* Results Grid */}
          {searchResult.resources.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {searchResult.resources.map((resource) => (
                  <ResourceCard key={resource._id} resource={resource} />
                ))}
              </div>

              {/* Load More Button */}
              {searchResult.resources.length < searchResult.total && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : `Load More (${searchResult.total - searchResult.resources.length} remaining)`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              {searchResult.suggestions && searchResult.suggestions.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Try these suggestions:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {searchResult.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceSearch;