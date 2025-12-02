import React, { useState, useEffect } from 'react';
import { Business, BUSINESS_CATEGORIES, AUSTRALIAN_STATES, BUSINESS_TYPES, REVENUE_RANGES } from '../types/business';
import { businessService } from '../services/businessService';

interface BusinessProfileProps {
  businessId?: string;
  onSave?: (business: Business) => void;
  onCancel?: () => void;
}

const BusinessProfile: React.FC<BusinessProfileProps> = ({ businessId, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    services: [''],
    capabilities: [''],
    location: {
      address: '',
      suburb: '',
      state: 'NSW',
      postcode: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    contact: {
      phone: '',
      email: '',
      website: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        linkedin: ''
      }
    },
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: true },
      sunday: { open: '09:00', close: '17:00', closed: true }
    },
    economicData: {
      employeeCount: 1,
      annualRevenue: 'under-50k',
      establishedYear: new Date().getFullYear(),
      businessType: 'sole-trader' as const
    },
    verification: {
      abn: '',
      acn: ''
    },
    tags: ['']
  });

  useEffect(() => {
    if (businessId) {
      loadBusiness();
    }
  }, [businessId]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const business = await businessService.getBusinessById(businessId!);
      setFormData({
        name: business.name,
        description: business.description,
        category: business.category,
        subcategory: business.subcategory,
        services: business.services.length > 0 ? business.services : [''],
        capabilities: business.capabilities.length > 0 ? business.capabilities : [''],
        location: business.location,
        contact: {
          phone: business.contact.phone || '',
          email: business.contact.email || '',
          website: business.contact.website || '',
          socialMedia: {
            facebook: business.contact.socialMedia?.facebook || '',
            instagram: business.contact.socialMedia?.instagram || '',
            linkedin: business.contact.socialMedia?.linkedin || ''
          }
        },
        businessHours: business.businessHours,
        economicData: business.economicData,
        verification: {
          abn: business.verification.abn || '',
          acn: business.verification.acn || ''
        },
        tags: business.tags.length > 0 ? business.tags : ['']
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load business');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Clean up empty strings from arrays
      const cleanedData = {
        ...formData,
        services: formData.services.filter(s => s.trim()),
        capabilities: formData.capabilities.filter(c => c.trim()),
        tags: formData.tags.filter(t => t.trim())
      };

      let business: Business;
      if (businessId) {
        business = await businessService.updateBusiness(businessId, cleanedData);
      } else {
        business = await businessService.createBusiness(cleanedData);
      }

      if (onSave) {
        onSave(business);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save business');
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: 'services' | 'capabilities' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'services' | 'capabilities' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'services' | 'capabilities' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const geocodeAddress = async () => {
    const address = `${formData.location.address}, ${formData.location.suburb}, ${formData.location.state} ${formData.location.postcode}, Australia`;
    
    try {
      // This is a simplified geocoding - in a real app, you'd use a proper geocoding service
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon)
            }
          }
        }));
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  };

  if (loading && businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {businessId ? 'Edit Business Profile' : 'Create Business Profile'}
            </h1>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {BUSINESS_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="e.g., Organic Farming, Web Development"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    required
                    value={formData.economicData.businessType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      economicData: { ...prev.economicData, businessType: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {BUSINESS_TYPES.map(type => (
                      <option key={type} value={type}>
                        {businessService.formatBusinessType(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your business, what you do, and what makes you unique..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Services and Capabilities */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Services & Capabilities</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services Offered *
                  </label>
                  {formData.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => updateArrayItem('services', index, e.target.value)}
                        placeholder="e.g., Crop Consulting, Web Design"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('services', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('services')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Service
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capabilities
                  </label>
                  {formData.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={capability}
                        onChange={(e) => updateArrayItem('capabilities', index, e.target.value)}
                        placeholder="e.g., 24/7 Support, Mobile Service"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.capabilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('capabilities', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('capabilities')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Capability
                  </button>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, address: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suburb *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location.suburb}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, suburb: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    required
                    value={formData.location.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, state: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {AUSTRALIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="\d{4}"
                    value={formData.location.postcode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, postcode: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={geocodeAddress}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Get Coordinates
                  </button>
                  {formData.location.coordinates.latitude !== 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {formData.location.coordinates.latitude.toFixed(6)}, 
                      Lng: {formData.location.coordinates.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="0412 345 678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.contact.website}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, website: e.target.value }
                    }))}
                    placeholder="https://www.example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (businessId ? 'Update Business' : 'Create Business')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;