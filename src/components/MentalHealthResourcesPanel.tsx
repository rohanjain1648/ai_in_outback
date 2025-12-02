import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import wellbeingService from '../services/wellbeingService';
import { MentalHealthResource } from '../types/wellbeing';

interface Props {
  resources: MentalHealthResource[];
}

const MentalHealthResourcesPanel: React.FC<Props> = ({ resources: initialResources }) => {
  const [resources, setResources] = useState<MentalHealthResource[]>(initialResources);
  const [filteredResources, setFilteredResources] = useState<MentalHealthResource[]>(initialResources);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    cost: '',
    resourceType: '',
    state: ''
  });

  useEffect(() => {
    setResources(initialResources);
    setFilteredResources(initialResources);
  }, [initialResources]);

  useEffect(() => {
    applyFilters();
  }, [filters, resources]);

  const applyFilters = () => {
    let filtered = resources;

    if (filters.category) {
      filtered = filtered.filter(resource => resource.category === filters.category);
    }

    if (filters.cost) {
      filtered = filtered.filter(resource => resource.cost === filters.cost);
    }

    if (filters.resourceType) {
      filtered = filtered.filter(resource => resource.resourceType === filters.resourceType);
    }

    if (filters.state) {
      filtered = filtered.filter(resource => 
        resource.location.state === filters.state || resource.location.isNational
      );
    }

    setFilteredResources(filtered);
  };

  const loadMoreResources = async () => {
    try {
      setLoading(true);
      const newResources = await wellbeingService.getResources(filters.category, filters.state);
      setResources(newResources);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'telehealth': return '💻';
      case 'crisis': return '🚨';
      case 'support_group': return '👥';
      case 'self_help': return '📚';
      case 'professional': return '👨‍⚕️';
      case 'emergency': return '🆘';
      default: return '🏥';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'telehealth': return 'bg-blue-100 text-blue-800';
      case 'crisis': return 'bg-red-100 text-red-800';
      case 'support_group': return 'bg-green-100 text-green-800';
      case 'self_help': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-indigo-100 text-indigo-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'free': return 'text-green-600';
      case 'bulk_billed': return 'text-blue-600';
      case 'private': return 'text-orange-600';
      case 'sliding_scale': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatCost = (cost: string) => {
    switch (cost) {
      case 'bulk_billed': return 'Bulk Billed';
      case 'sliding_scale': return 'Sliding Scale';
      default: return cost.charAt(0).toUpperCase() + cost.slice(1);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mental Health Resources</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="telehealth">Telehealth</option>
              <option value="crisis">Crisis Support</option>
              <option value="support_group">Support Groups</option>
              <option value="self_help">Self Help</option>
              <option value="professional">Professional</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
            <select
              value={filters.cost}
              onChange={(e) => setFilters(prev => ({ ...prev, cost: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Costs</option>
              <option value="free">Free</option>
              <option value="bulk_billed">Bulk Billed</option>
              <option value="private">Private</option>
              <option value="sliding_scale">Sliding Scale</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.resourceType}
              onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="phone">Phone</option>
              <option value="website">Website</option>
              <option value="app">App</option>
              <option value="in_person">In Person</option>
              <option value="online_chat">Online Chat</option>
              <option value="video_call">Video Call</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All States</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="QLD">QLD</option>
              <option value="WA">WA</option>
              <option value="SA">SA</option>
              <option value="TAS">TAS</option>
              <option value="ACT">ACT</option>
              <option value="NT">NT</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredResources.length} of {resources.length} resources
          </p>
          <button
            onClick={loadMoreResources}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Resources'}
          </button>
        </div>
      </div>

      {/* Resources List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Found</h3>
            <p className="text-gray-600">Try adjusting your filters to find more resources.</p>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <motion.div
              key={resource._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">{getCategoryIcon(resource.category)}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {resource.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                        {resource.category.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${getCostColor(resource.cost)}`}>
                        {formatCost(resource.cost)}
                      </span>
                      {resource.isVerified && (
                        <span className="text-green-600 text-sm">✓ Verified</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(resource.rating)}
                      <span className="text-sm text-gray-600 ml-2">
                        ({resource.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {resource.location.isNational ? 'National' : resource.location.state}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {resource.resourceType.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{resource.description}</p>

              {/* Services */}
              {resource.services.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.services.map((service) => (
                      <span
                        key={service}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specializations */}
              {resource.specializations.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Specializations:</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info and Availability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Contact:</p>
                  <div className="space-y-1 text-sm">
                    {resource.contactInfo.phone && (
                      <p>📞 <a href={`tel:${resource.contactInfo.phone}`} className="text-blue-600 hover:underline">
                        {resource.contactInfo.phone}
                      </a></p>
                    )}
                    {resource.contactInfo.website && (
                      <p>🌐 <a href={resource.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a></p>
                    )}
                    {resource.contactInfo.email && (
                      <p>✉️ <a href={`mailto:${resource.contactInfo.email}`} className="text-blue-600 hover:underline">
                        Email
                      </a></p>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Availability:</p>
                  <div className="text-sm">
                    <p>{resource.availability.hours}</p>
                    {resource.availability.is24x7 && (
                      <p className="text-green-600 font-medium">24/7 Available</p>
                    )}
                    <p className="text-gray-600">
                      Languages: {resource.languages.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              {resource.targetAudience.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Target Audience:</p>
                  <div className="flex flex-wrap gap-2">
                    {resource.targetAudience.map((audience) => (
                      <span
                        key={audience}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default MentalHealthResourcesPanel;