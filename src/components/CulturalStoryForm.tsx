import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface CreateStoryData {
  title: string;
  content: string;
  summary?: string;
  category: 'traditional' | 'historical' | 'personal' | 'community' | 'legend' | 'contemporary';
  tags: string[];
  location: {
    coordinates: [number, number];
    region: string;
    specificPlace?: string;
  };
  timeframe?: {
    period?: string;
    specificDate?: string;
    isOngoing?: boolean;
  };
  relatedPeople?: string[];
  relatedEvents?: string[];
  visibility: 'public' | 'community' | 'private';
}

interface CulturalStoryFormProps {
  onSubmit: (data: CreateStoryData, files: File[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateStoryData>;
}

const categories = [
  { value: 'traditional', label: 'Traditional', description: 'Stories passed down through generations' },
  { value: 'historical', label: 'Historical', description: 'Events and people from the past' },
  { value: 'personal', label: 'Personal', description: 'Individual experiences and memories' },
  { value: 'community', label: 'Community', description: 'Local events and community stories' },
  { value: 'legend', label: 'Legend', description: 'Myths, legends, and folklore' },
  { value: 'contemporary', label: 'Contemporary', description: 'Modern stories and current events' }
];

export const CulturalStoryForm: React.FC<CulturalStoryFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData
}) => {
  const [formData, setFormData] = useState<CreateStoryData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    summary: initialData?.summary || '',
    category: initialData?.category || 'personal',
    tags: initialData?.tags || [],
    location: initialData?.location || {
      coordinates: [133.7751, -25.2744], // Center of Australia
      region: '',
      specificPlace: ''
    },
    timeframe: initialData?.timeframe || {
      period: '',
      specificDate: '',
      isOngoing: false
    },
    relatedPeople: initialData?.relatedPeople || [],
    relatedEvents: initialData?.relatedEvents || [],
    visibility: initialData?.visibility || 'public'
  });

  const [tagInput, setTagInput] = useState('');
  const [personInput, setPersonInput] = useState('');
  const [eventInput, setEventInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CreateStoryData] as any,
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addPerson = () => {
    if (personInput.trim() && !formData.relatedPeople?.includes(personInput.trim())) {
      setFormData(prev => ({
        ...prev,
        relatedPeople: [...(prev.relatedPeople || []), personInput.trim()]
      }));
      setPersonInput('');
    }
  };

  const removePerson = (personToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      relatedPeople: prev.relatedPeople?.filter(person => person !== personToRemove) || []
    }));
  };

  const addEvent = () => {
    if (eventInput.trim() && !formData.relatedEvents?.includes(eventInput.trim())) {
      setFormData(prev => ({
        ...prev,
        relatedEvents: [...(prev.relatedEvents || []), eventInput.trim()]
      }));
      setEventInput('');
    }
  };

  const removeEvent = (eventToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      relatedEvents: prev.relatedEvents?.filter(event => event !== eventToRemove) || []
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Story content is required';
    if (formData.content.length < 50) newErrors.content = 'Story content must be at least 50 characters';
    if (!formData.location.region.trim()) newErrors.region = 'Region is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData, selectedFiles);
    } catch (error) {
      console.error('Error submitting story:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Your Cultural Story</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter a compelling title for your story"
            maxLength={200}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <label
                key={category.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.category === category.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={formData.category === category.value}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="sr-only"
                />
                <div className="flex flex-col">
                  <span className="block text-sm font-medium text-gray-900">
                    {category.label}
                  </span>
                  <span className="block text-sm text-gray-500">
                    {category.description}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={12}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell your story in detail. Share the emotions, the setting, the people involved..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
            <p className="text-sm text-gray-500">
              {formData.content.length} characters (minimum 50)
            </p>
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Summary (Optional)
          </label>
          <textarea
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A brief summary of your story (will be auto-generated if left empty)"
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.summary?.length || 0}/500 characters
          </p>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region *
            </label>
            <input
              type="text"
              value={formData.location.region}
              onChange={(e) => handleNestedInputChange('location', 'region', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.region ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., New South Wales, Queensland"
            />
            {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Place (Optional)
            </label>
            <input
              type="text"
              value={formData.location.specificPlace}
              onChange={(e) => handleNestedInputChange('location', 'specificPlace', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Sydney, Uluru, Kakadu National Park"
            />
          </div>
        </div>

        {/* Timeframe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period (Optional)
            </label>
            <input
              type="text"
              value={formData.timeframe?.period}
              onChange={(e) => handleNestedInputChange('timeframe', 'period', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1950s, Dreamtime, Colonial era"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Date (Optional)
            </label>
            <input
              type="date"
              value={formData.timeframe?.specificDate}
              onChange={(e) => handleNestedInputChange('timeframe', 'specificDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add tags to help others find your story"
              maxLength={50}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Related People */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related People (Optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.relatedPeople?.map((person, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {person}
                <button
                  type="button"
                  onClick={() => removePerson(person)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={personInput}
              onChange={(e) => setPersonInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPerson())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Names of people mentioned in the story"
              maxLength={100}
            />
            <button
              type="button"
              onClick={addPerson}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Related Events */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Events (Optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.relatedEvents?.map((event, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {event}
                <button
                  type="button"
                  onClick={() => removeEvent(event)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={eventInput}
              onChange={(e) => setEventInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEvent())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Historical events, festivals, or occasions"
              maxLength={200}
            />
            <button
              type="button"
              onClick={addEvent}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Files (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Choose Files
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Upload images, videos, audio, or documents to enhance your story
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibility
          </label>
          <select
            value={formData.visibility}
            onChange={(e) => handleInputChange('visibility', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public - Anyone can view</option>
            <option value="community">Community - Only community members can view</option>
            <option value="private">Private - Only you can view</option>
          </select>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sharing...' : 'Share Story'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};