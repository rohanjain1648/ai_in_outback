import React from 'react';
import { Resource } from '../types/resource';
import { resourceService } from '../services/resourceService';

interface ResourceCardProps {
  resource: Resource;
  onClick?: (resource: Resource) => void;
  showDistance?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  onClick,
  showDistance = true 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(resource);
    } else {
      // Default behavior - could navigate to resource detail page
      console.log('Resource clicked:', resource._id);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPricingColor = (type: string) => {
    switch (type) {
      case 'free':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'donation':
        return 'bg-purple-100 text-purple-800';
      case 'barter':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPricing = (pricing?: Resource['pricing']) => {
    if (!pricing) return 'Free';
    
    switch (pricing.type) {
      case 'paid':
        return pricing.amount ? `$${pricing.amount} ${pricing.currency || 'AUD'}` : 'Paid';
      case 'donation':
        return 'Donation';
      case 'barter':
        return 'Barter/Trade';
      default:
        return 'Free';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
      onClick={handleClick}
    >
      {/* Image */}
      {resource.images && resource.images.length > 0 ? (
        <img
          src={resource.images[0]}
          alt={resource.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {resource.title}
          </h3>
          {resource.isVerified && (
            <div className="flex-shrink-0 ml-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Category and Location */}
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            {resourceService.getCategoryDisplayName(resource.category)}
          </span>
          <span>•</span>
          <span>{resource.location.region}, {resource.location.state}</span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {resource.description}
        </p>

        {/* Status and Pricing */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(resource.availability.status)}`}>
            {resourceService.getAvailabilityDisplayName(resource.availability.status)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPricingColor(resource.pricing?.type || 'free')}`}>
            {formatPricing(resource.pricing)}
          </span>
        </div>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{resource.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-1">
            {/* Rating */}
            {resource.rating.count > 0 ? (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{resource.rating.average.toFixed(1)}</span>
                <span>({resource.rating.count})</span>
              </div>
            ) : (
              <span>No ratings yet</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Distance */}
            {showDistance && resource.distance && (
              <span>{resourceService.formatDistance(resource.distance)}</span>
            )}
            
            {/* View count */}
            <span>{resource.viewCount} views</span>
          </div>
        </div>

        {/* AI Explanation */}
        {resource.aiExplanation && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <strong>AI Match:</strong> {resource.aiExplanation}
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Contact: {resource.contact.name}
            </span>
            <span className="text-xs text-gray-500">
              {resourceService.getContactMethod(resource.contact)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;