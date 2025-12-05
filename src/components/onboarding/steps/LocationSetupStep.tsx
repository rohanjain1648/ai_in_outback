/**
 * Location Setup Step - Third step of onboarding
 */

import React from 'react';
import { motion } from 'framer-motion';
import { OnboardingData } from '../OnboardingFlow';

interface LocationSetupStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: Partial<OnboardingData>) => void;
  isLoading: boolean;
}

export const LocationSetupStep: React.FC<LocationSetupStepProps> = ({
  data,
  onNext,
  onPrevious,
  onDataChange,
  isLoading
}) => {
  const handleInputChange = (field: keyof OnboardingData['location'], value: string) => {
    onDataChange({
      location: {
        ...data.location,
        [field]: value
      }
    });
  };

  const australianStates = [
    { code: 'NSW', name: 'New South Wales' },
    { code: 'VIC', name: 'Victoria' },
    { code: 'QLD', name: 'Queensland' },
    { code: 'WA', name: 'Western Australia' },
    { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' },
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NT', name: 'Northern Territory' }
  ];

  const regions = {
    NSW: ['Central West', 'Hunter Valley', 'Riverina', 'New England', 'South Coast', 'Western Plains'],
    VIC: ['Gippsland', 'Western District', 'Mallee', 'High Country', 'Central Victoria', 'Wimmera'],
    QLD: ['Darling Downs', 'Wide Bay', 'Central Queensland', 'North Queensland', 'Gulf Country', 'Cape York'],
    WA: ['Wheatbelt', 'Great Southern', 'Mid West', 'Pilbara', 'Kimberley', 'Goldfields'],
    SA: ['Riverland', 'Barossa Valley', 'Adelaide Hills', 'Fleurieu Peninsula', 'Eyre Peninsula', 'Outback'],
    TAS: ['North West', 'North East', 'Central', 'South East', 'West Coast'],
    ACT: ['Canberra Region'],
    NT: ['Top End', 'Central Australia', 'Barkly']
  };

  const isValid = data.location.postcode && data.location.state;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Where are you located?
        </h2>
        <p className="text-gray-600">
          Help us connect you with your local community and relevant resources
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postcode *
          </label>
          <input
            type="text"
            value={data.location.postcode || ''}
            onChange={(e) => handleInputChange('postcode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your postcode"
            maxLength={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State/Territory *
          </label>
          <select
            value={data.location.state || ''}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select your state</option>
            {australianStates.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {data.location.state && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={data.location.region || ''}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select your region (optional)</option>
              {regions[data.location.state as keyof typeof regions]?.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Town/City
          </label>
          <input
            type="text"
            value={data.location.town || ''}
            onChange={(e) => handleInputChange('town', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your town or city (optional)"
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-blue-600 text-xl">🔒</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Privacy Note</h4>
            <p className="text-sm text-blue-800">
              Your location information helps us show you relevant local content and connect you with nearby community members.
              You can adjust your privacy settings later to control how much location information is shared.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid || isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );
};