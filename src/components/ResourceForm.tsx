import React, { useState, useEffect } from 'react';
import { CreateResourceData, ResourceCategory } from '../types/resource';
import { resourceService } from '../services/resourceService';
import { useGeolocation } from '../hooks/useGeolocation';

interface ResourceFormProps {
  onSubmit: (resourceData: CreateResourceData) => void;
  onCancel: () => void;
  initialData?: Partial<CreateResourceData>;
  isEditing?: boolean;
}

const ResourceForm: React.FC<ResourceFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<CreateResourceData>({
    title: '',
    description: '',
    category: 'equipment',
    subcategory: '',
    availability: {
      status: 'available'
    },
    location: {
      coordinates: [0, 0],
      address: '',
      postcode: '',
      state: '',
      region: ''
    },
    contact: {
      name: '',
      preferredMethod: 'email'
    },
    tags: [],
    pricing: {
      type: 'free'
    },
    ...initialData
  });

  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { location, loading: locationLoading, error: locationError } = useGeolocation();

  useEffect(() => {
    // Load categories
    resourceService.getCategories().then(result => {
      setCategories(result.categories);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    // Auto-fill location if available and not already set
    if (location && formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: [location.longitude, location.latitude]
        }
      }));
    }
  }, [location, formData.location.coordinates]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof CreateResourceData],
            [keys[1]]: value
          }
        };
      } else if (keys.length === 3) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof CreateResourceData],
            [keys[1]]: {
              ...(prev[keys[0] as keyof CreateResourceData] as any)[keys[1]],
              [keys[2]]: value
            }
          }
        };
      }
      return prev;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'Address is required';
    }

    if (!formData.location.postcode.trim()) {
      newErrors['location.postcode'] = 'Postcode is required';
    }

    if (!formData.location.state.trim()) {
      newErrors['location.state'] = 'State is required';
    }

    if (!formData.location.region.trim()) {
      newErrors['location.region'] = 'Region is required';
    }

    if (!formData.contact.name.trim()) {
      newErrors['contact.name'] = 'Contact name is required';
    }

    if (formData.contact.preferredMethod === 'email' && !formData.contact.email) {
      newErrors['contact.email'] = 'Email is required when email is the preferred contact method';
    }

    if (formData.contact.preferredMethod === 'phone' && !formData.contact.phone) {
      newErrors['contact.phone'] = 'Phone is required when phone is the preferred contact method';
    }

    if (formData.pricing?.type === 'paid' && !formData.pricing.amount) {
      newErrors['pricing.amount'] = 'Amount is required for paid resources';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: string) => errors[field];

  const australianStates = [
    'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Resource' : 'Share a Resource'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${getFieldError('title') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              placeholder="What resource are you sharing?"
            />
            {getFieldError('title') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="equipment">Equipment & Tools</option>
              <option value="services">Services</option>
              <option value="knowledge">Knowledge & Skills</option>
              <option value="materials">Materials & Supplies</option>
              <option value="transportation">Transportation</option>
              <option value="accommodation">Accommodation</option>
              <option value="emergency">Emergency Resources</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <input
              type="text"
              value={formData.subcategory || ''}
              onChange={(e) => handleInputChange('subcategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="More specific category (optional)"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md ${getFieldError('description') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            placeholder="Describe your resource in detail..."
          />
          {getFieldError('description') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
          )}
        </div>

        {/* Availability */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.availability.status}
                onChange={(e) => handleInputChange('availability.status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="limited">Limited Availability</option>
                <option value="unavailable">Not Available</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Available
              </label>
              <input
                type="number"
                min="0"
                value={formData.availability.quantity || ''}
                onChange={(e) => handleInputChange('availability.quantity', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="How many available?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.availability.maxQuantity || ''}
                onChange={(e) => handleInputChange('availability.maxQuantity', parseInt(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Max per person/request"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
          {locationLoading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">Getting your location...</p>
            </div>
          )}
          {locationError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">Could not get your location. Please enter manually.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${getFieldError('location.address') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                placeholder="Street address or general area"
              />
              {getFieldError('location.address') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('location.address')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postcode *
              </label>
              <input
                type="text"
                value={formData.location.postcode}
                onChange={(e) => handleInputChange('location.postcode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${getFieldError('location.postcode') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                placeholder="e.g. 2000"
              />
              {getFieldError('location.postcode') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('location.postcode')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                value={formData.location.state}
                onChange={(e) => handleInputChange('location.state', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${getFieldError('location.state') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              >
                <option value="">Select state</option>
                {australianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {getFieldError('location.state') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('location.state')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <input
                type="text"
                value={formData.location.region}
                onChange={(e) => handleInputChange('location.region', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${getFieldError('location.region') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                placeholder="e.g. Central Coast, Hunter Valley"
              />
              {getFieldError('location.region') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('location.region')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accessibility Notes
              </label>
              <input
                type="text"
                value={formData.location.accessibilityNotes || ''}
                onChange={(e) => handleInputChange('location.accessibilityNotes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any access requirements or notes"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.contact.name}
                onChange={(e) => handleInputChange('contact.name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${getFieldError('contact.name') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                placeholder="Your name or organization"
              />
              {getFieldError('contact.name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('contact.name')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method *
              </label>
              <select
                value={formData.contact.preferredMethod}
                onChange={(e) => handleInputChange('contact.preferredMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="in-person">In Person</option>
              </select>
            </div>

            {formData.contact.preferredMethod === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.contact.email || ''}
                  onChange={(e) => handleInputChange('contact.email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${getFieldError('contact.email') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="your.email@example.com"
                />
                {getFieldError('contact.email') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('contact.email')}</p>
                )}
              </div>
            )}

            {formData.contact.preferredMethod === 'phone' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.contact.phone || ''}
                  onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${getFieldError('contact.phone') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  placeholder="04XX XXX XXX"
                />
                {getFieldError('contact.phone') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('contact.phone')}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.pricing?.type || 'free'}
                onChange={(e) => handleInputChange('pricing.type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="donation">Donation</option>
                <option value="barter">Barter/Trade</option>
              </select>
            </div>

            {formData.pricing?.type === 'paid' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricing.amount || ''}
                    onChange={(e) => handleInputChange('pricing.amount', parseFloat(e.target.value) || undefined)}
                    className={`w-full px-3 py-2 border rounded-md ${getFieldError('pricing.amount') ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="0.00"
                  />
                  {getFieldError('pricing.amount') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('pricing.amount')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.pricing.currency || 'AUD'}
                    onChange={(e) => handleInputChange('pricing.currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="AUD">AUD</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add tags to help people find your resource"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Resource' : 'Share Resource')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;