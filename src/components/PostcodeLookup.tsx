import React, { useState, useEffect, useRef } from 'react';
import { PostcodeUtils, PostcodeInfo } from '../utils/postcodeUtils';
import { Coordinates } from '../types/location';

interface PostcodeLookupProps {
  onLocationSelect: (coordinates: Coordinates, address: any) => void;
  placeholder?: string;
  className?: string;
}

export const PostcodeLookup: React.FC<PostcodeLookupProps> = ({
  onLocationSelect,
  placeholder = "Enter postcode or suburb...",
  className = ''
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<PostcodeInfo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update suggestions when input changes
  useEffect(() => {
    if (input.trim().length >= 2) {
      setLoading(true);
      // Simulate API delay for better UX
      const timer = setTimeout(() => {
        const results = PostcodeUtils.getSuggestions(input, 8);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSelectedIndex(-1);
        setLoading(false);
      }, 150);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setLoading(false);
    }
  }, [input]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (postcodeInfo: PostcodeInfo) => {
    const address = PostcodeUtils.getAddressFromPostcodeInfo(postcodeInfo);
    
    setInput(`${postcodeInfo.suburb}, ${postcodeInfo.state} ${postcodeInfo.postcode}`);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    onLocationSelect(postcodeInfo.coordinates, address);
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur (with delay to allow for clicks)
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Get region type badge color
  const getRegionTypeColor = (type: 'urban' | 'rural' | 'remote') => {
    switch (type) {
      case 'urban': return 'bg-green-100 text-green-800';
      case 'rural': return 'bg-yellow-100 text-yellow-800';
      case 'remote': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Search icon */}
        {!loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.postcode}-${suggestion.suburb}`}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {suggestion.suburb}
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.city}, {suggestion.state} {suggestion.postcode}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getRegionTypeColor(suggestion.regionType)}`}>
                  {suggestion.regionType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && input.trim().length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-3 py-2 text-gray-500 text-sm">
            No locations found for "{input}"
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-1 text-xs text-gray-500">
        Search by postcode (e.g., 2000) or suburb name (e.g., Sydney)
      </div>
    </div>
  );
};

export default PostcodeLookup;