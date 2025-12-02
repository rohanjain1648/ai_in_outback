import React, { useState } from 'react';
import { motion } from 'framer-motion';
import wellbeingService from '../services/wellbeingService';
import { WellbeingCheckIn, WellbeingCheckInForm as WellbeingCheckInFormType } from '../types/wellbeing';

interface Props {
  onSubmit: (checkIn: WellbeingCheckIn) => void;
}

const WellbeingCheckInForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<WellbeingCheckInFormType>({
    moodScore: 5,
    stressLevel: 5,
    sleepQuality: 5,
    socialConnection: 5,
    physicalActivity: 5,
    notes: '',
    tags: [],
    isAnonymous: false
  });

  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleSliderChange = (field: keyof WellbeingCheckInFormType, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = wellbeingService.validateCheckInForm(formData);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const checkIn = await wellbeingService.submitCheckIn(formData);
      onSubmit(checkIn);
      
      // Reset form
      setFormData({
        moodScore: 5,
        stressLevel: 5,
        sleepQuality: 5,
        socialConnection: 5,
        physicalActivity: 5,
        notes: '',
        tags: [],
        isAnonymous: false
      });
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  const getSliderColor = (value: number) => {
    if (value <= 3) return 'bg-red-500';
    if (value <= 5) return 'bg-yellow-500';
    if (value <= 7) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getSliderLabel = (field: string, value: number) => {
    const labels: { [key: string]: string[] } = {
      moodScore: ['Very Low', 'Low', 'Poor', 'Below Average', 'Average', 'Above Average', 'Good', 'Very Good', 'Great', 'Excellent'],
      stressLevel: ['No Stress', 'Very Low', 'Low', 'Mild', 'Moderate', 'Noticeable', 'High', 'Very High', 'Severe', 'Overwhelming'],
      sleepQuality: ['Terrible', 'Very Poor', 'Poor', 'Below Average', 'Average', 'Above Average', 'Good', 'Very Good', 'Great', 'Excellent'],
      socialConnection: ['Very Isolated', 'Isolated', 'Disconnected', 'Somewhat Lonely', 'Average', 'Connected', 'Well Connected', 'Very Connected', 'Highly Social', 'Thriving Socially'],
      physicalActivity: ['None', 'Very Little', 'Minimal', 'Light', 'Moderate', 'Regular', 'Active', 'Very Active', 'Highly Active', 'Extremely Active']
    };
    
    return labels[field]?.[value - 1] || value.toString();
  };

  const SliderInput: React.FC<{
    label: string;
    field: keyof WellbeingCheckInFormType;
    value: number;
    description: string;
    icon: string;
  }> = ({ label, field, value, description, icon }) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>1</span>
          <span className="font-medium text-gray-700">{getSliderLabel(field, value)}</span>
          <span>10</span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={value}
            onChange={(e) => handleSliderChange(field, parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, ${getSliderColor(value)} 0%, ${getSliderColor(value)} ${(value - 1) * 11.11}%, #e5e7eb ${(value - 1) * 11.11}%, #e5e7eb 100%)`
            }}
          />
          <div 
            className={`absolute w-4 h-4 ${getSliderColor(value)} rounded-full -mt-1 pointer-events-none`}
            style={{ left: `calc(${(value - 1) * 11.11}% - 8px)` }}
          />
        </div>
        
        <div className="text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getSliderColor(value)}`}>
            {value}/10
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Wellbeing Check-in</h2>
        <p className="text-gray-600">Take a moment to reflect on how you're feeling today</p>
        
        {/* Progress indicator */}
        <div className="mt-4 flex items-center space-x-2">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`flex-1 h-2 rounded-full ${
                step >= stepNum ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">Step {step} of 3</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling today?</h3>
            
            <SliderInput
              label="Overall Mood"
              field="moodScore"
              value={formData.moodScore}
              description="How would you rate your overall mood today?"
              icon="😊"
            />
            
            <SliderInput
              label="Stress Level"
              field="stressLevel"
              value={formData.stressLevel}
              description="How stressed or overwhelmed do you feel?"
              icon="😰"
            />
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your daily habits</h3>
            
            <SliderInput
              label="Sleep Quality"
              field="sleepQuality"
              value={formData.sleepQuality}
              description="How well did you sleep last night?"
              icon="😴"
            />
            
            <SliderInput
              label="Social Connection"
              field="socialConnection"
              value={formData.socialConnection}
              description="How connected do you feel to others?"
              icon="👥"
            />
            
            <SliderInput
              label="Physical Activity"
              field="physicalActivity"
              value={formData.physicalActivity}
              description="How active were you today?"
              icon="🏃"
            />
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional details</h3>
            
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How are you feeling? What's on your mind? Any specific concerns or positive moments?"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.notes?.length || 0}/1000 characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
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
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a mood tag (e.g., anxious, hopeful, tired)"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!currentTag.trim() || formData.tags.length >= 10}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.tags.length}/10 tags
              </p>
            </div>

            {/* Privacy */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Submit anonymously (your data will be used for insights but not linked to your profile)
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Check-in'}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default WellbeingCheckInForm;