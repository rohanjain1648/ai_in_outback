import React, { useState, useEffect } from 'react';
import { communityService, Skill, Interest, Availability, MatchingPreferences } from '../services/communityService';

interface CommunityProfileSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const skillCategories = [
  'agricultural', 'technical', 'creative', 'business', 
  'health', 'education', 'trades', 'other'
];

const interestCategories = [
  'agriculture', 'technology', 'arts', 'sports', 'community', 
  'environment', 'business', 'health', 'education', 'other'
];

const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
const intensityLevels = ['casual', 'moderate', 'passionate'];
const meetingTypes = ['in-person', 'video-call', 'phone-call', 'text-chat'];
const responseTimeOptions = ['immediate', 'within-hour', 'within-day', 'within-week'];
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const CommunityProfileSetup: React.FC<CommunityProfileSetupProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [availability, setAvailability] = useState<Availability>({
    timeSlots: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredMeetingTypes: ['video-call'],
    responseTime: 'within-day',
  });
  const [matchingPreferences, setMatchingPreferences] = useState<MatchingPreferences>({
    maxDistance: 50,
    preferredSkillLevels: ['intermediate', 'advanced'],
    priorityCategories: [],
    requireMutualInterests: false,
    minimumSharedInterests: 1,
  });

  // Temporary form states
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    level: 'intermediate',
    canTeach: false,
    wantsToLearn: true,
    category: 'agricultural',
  });

  const [newInterest, setNewInterest] = useState<Partial<Interest>>({
    name: '',
    category: 'agriculture',
    intensity: 'moderate',
  });

  const [newTimeSlot, setNewTimeSlot] = useState({
    day: 'monday' as const,
    startTime: '09:00',
    endTime: '17:00',
  });

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const profile = await communityService.getProfile();
      if (profile) {
        setSkills(profile.skills);
        setInterests(profile.interests);
        setAvailability(profile.availability);
        setMatchingPreferences(profile.matchingPreferences);
      }
    } catch (error) {
      console.error('Failed to load existing profile:', error);
    }
  };

  const addSkill = () => {
    if (newSkill.name && newSkill.category && newSkill.level) {
      setSkills([...skills, newSkill as Skill]);
      setNewSkill({
        name: '',
        level: 'intermediate',
        canTeach: false,
        wantsToLearn: true,
        category: 'agricultural',
      });
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    if (newInterest.name && newInterest.category) {
      setInterests([...interests, newInterest as Interest]);
      setNewInterest({
        name: '',
        category: 'agriculture',
        intensity: 'moderate',
      });
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const addTimeSlot = () => {
    if (newTimeSlot.startTime && newTimeSlot.endTime) {
      setAvailability({
        ...availability,
        timeSlots: [...availability.timeSlots, newTimeSlot],
      });
      setNewTimeSlot({
        day: 'monday',
        startTime: '09:00',
        endTime: '17:00',
      });
    }
  };

  const removeTimeSlot = (index: number) => {
    setAvailability({
      ...availability,
      timeSlots: availability.timeSlots.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await communityService.createOrUpdateProfile({
        skills,
        interests,
        availability,
        matchingPreferences,
      });

      onComplete?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return skills.length > 0;
      case 2:
        return interests.length > 0;
      case 3:
        return availability.timeSlots.length > 0 && availability.preferredMeetingTypes.length > 0;
      case 4:
        return matchingPreferences.priorityCategories.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Profile Setup</h2>
        <p className="text-gray-600">
          Complete your community profile to connect with like-minded rural community members.
        </p>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Skills</span>
            <span>Interests</span>
            <span>Availability</span>
            <span>Preferences</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Step 1: Skills */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Your Skills</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Name
              </label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Cattle farming, Web development"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {skillCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Level
              </label>
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {skillLevels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience (optional)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={newSkill.yearsExperience || ''}
                onChange={(e) => setNewSkill({ ...newSkill, yearsExperience: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newSkill.canTeach}
                onChange={(e) => setNewSkill({ ...newSkill, canTeach: e.target.checked })}
                className="mr-2"
              />
              I can teach this skill
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newSkill.wantsToLearn}
                onChange={(e) => setNewSkill({ ...newSkill, wantsToLearn: e.target.checked })}
                className="mr-2"
              />
              I want to learn more about this skill
            </label>
          </div>
          
          <button
            onClick={addSkill}
            disabled={!newSkill.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
          >
            Add Skill
          </button>
          
          {skills.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Added Skills:</h4>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({skill.level}, {skill.category})
                        {skill.canTeach && ' • Can teach'}
                        {skill.wantsToLearn && ' • Wants to learn'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Interests */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Your Interests</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Name
              </label>
              <input
                type="text"
                value={newInterest.name}
                onChange={(e) => setNewInterest({ ...newInterest, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sustainable farming, Photography"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newInterest.category}
                onChange={(e) => setNewInterest({ ...newInterest, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {interestCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Level
              </label>
              <select
                value={newInterest.intensity}
                onChange={(e) => setNewInterest({ ...newInterest, intensity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {intensityLevels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={addInterest}
            disabled={!newInterest.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
          >
            Add Interest
          </button>
          
          {interests.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Added Interests:</h4>
              <div className="space-y-2">
                {interests.map((interest, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{interest.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({interest.intensity}, {interest.category})
                      </span>
                    </div>
                    <button
                      onClick={() => removeInterest(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Availability */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Your Availability</h3>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Add Time Slots</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={newTimeSlot.day}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, day: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={addTimeSlot}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Time Slot
            </button>
          </div>
          
          {availability.timeSlots.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Available Time Slots:</h4>
              <div className="space-y-2">
                {availability.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span>
                      {slot.day.charAt(0).toUpperCase() + slot.day.slice(1)}: {slot.startTime} - {slot.endTime}
                    </span>
                    <button
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Preferred Meeting Types</h4>
            <div className="space-y-2">
              {meetingTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={availability.preferredMeetingTypes.includes(type as any)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAvailability({
                          ...availability,
                          preferredMeetingTypes: [...availability.preferredMeetingTypes, type as any],
                        });
                      } else {
                        setAvailability({
                          ...availability,
                          preferredMeetingTypes: availability.preferredMeetingTypes.filter(t => t !== type),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Time
              </label>
              <select
                value={availability.responseTime}
                onChange={(e) => setAvailability({ ...availability, responseTime: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {responseTimeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Travel Distance (km, optional)
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={availability.maxTravelDistance || ''}
                onChange={(e) => setAvailability({ 
                  ...availability, 
                  maxTravelDistance: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Matching Preferences */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Matching Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Distance (km)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={matchingPreferences.maxDistance}
                onChange={(e) => setMatchingPreferences({ 
                  ...matchingPreferences, 
                  maxDistance: parseInt(e.target.value) || 50 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Shared Interests
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={matchingPreferences.minimumSharedInterests}
                onChange={(e) => setMatchingPreferences({ 
                  ...matchingPreferences, 
                  minimumSharedInterests: parseInt(e.target.value) || 1 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Preferred Skill Levels</h4>
            <div className="grid grid-cols-2 gap-2">
              {skillLevels.map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={matchingPreferences.preferredSkillLevels.includes(level as any)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMatchingPreferences({
                          ...matchingPreferences,
                          preferredSkillLevels: [...matchingPreferences.preferredSkillLevels, level as any],
                        });
                      } else {
                        setMatchingPreferences({
                          ...matchingPreferences,
                          preferredSkillLevels: matchingPreferences.preferredSkillLevels.filter(l => l !== level),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Priority Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              {[...skillCategories, ...interestCategories].filter((v, i, a) => a.indexOf(v) === i).map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={matchingPreferences.priorityCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setMatchingPreferences({
                          ...matchingPreferences,
                          priorityCategories: [...matchingPreferences.priorityCategories, category],
                        });
                      } else {
                        setMatchingPreferences({
                          ...matchingPreferences,
                          priorityCategories: matchingPreferences.priorityCategories.filter(c => c !== category),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={matchingPreferences.requireMutualInterests}
                onChange={(e) => setMatchingPreferences({ 
                  ...matchingPreferences, 
                  requireMutualInterests: e.target.checked 
                })}
                className="mr-2"
              />
              Require mutual interests (both parties must share the same interests)
            </label>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <div>
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Previous
            </button>
          )}
        </div>
        
        <div className="space-x-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};