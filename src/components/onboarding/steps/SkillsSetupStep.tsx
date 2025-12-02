/**
 * Skills Setup Step - Fifth step of onboarding
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { OnboardingData } from '../OnboardingFlow';

interface SkillsSetupStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: Partial<OnboardingData>) => void;
  isLoading: boolean;
}

export const SkillsSetupStep: React.FC<SkillsSetupStepProps> = ({
  data,
  onNext,
  onPrevious,
  onDataChange,
  isLoading
}) => {
  const [customSkill, setCustomSkill] = useState('');

  const skillCategories = [
    {
      category: 'Agricultural Skills',
      skills: [
        'Crop Management',
        'Animal Husbandry',
        'Farm Equipment Operation',
        'Irrigation Systems',
        'Soil Testing',
        'Pest Management',
        'Harvesting',
        'Farm Planning'
      ]
    },
    {
      category: 'Technical Skills',
      skills: [
        'Computer Literacy',
        'Social Media',
        'Website Development',
        'Data Analysis',
        'Equipment Repair',
        'Electrical Work',
        'Plumbing',
        'Mechanical Repair'
      ]
    },
    {
      category: 'Business Skills',
      skills: [
        'Bookkeeping',
        'Marketing',
        'Sales',
        'Project Management',
        'Leadership',
        'Customer Service',
        'Financial Planning',
        'Business Development'
      ]
    },
    {
      category: 'Creative Skills',
      skills: [
        'Photography',
        'Writing',
        'Graphic Design',
        'Arts & Crafts',
        'Music',
        'Cooking',
        'Gardening',
        'Woodworking'
      ]
    },
    {
      category: 'Community Skills',
      skills: [
        'Event Planning',
        'Public Speaking',
        'Teaching',
        'Mentoring',
        'Counseling',
        'First Aid',
        'Emergency Response',
        'Volunteer Coordination'
      ]
    },
    {
      category: 'Traditional Skills',
      skills: [
        'Traditional Farming',
        'Heritage Crafts',
        'Local History',
        'Cultural Knowledge',
        'Traditional Medicine',
        'Storytelling',
        'Indigenous Practices',
        'Folk Arts'
      ]
    }
  ];

  const handleSkillToggle = (skill: string) => {
    const currentSkills = data.skills || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];

    onDataChange({
      skills: updatedSkills
    });
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !(data.skills || []).includes(customSkill.trim())) {
      const updatedSkills = [...(data.skills || []), customSkill.trim()];
      onDataChange({
        skills: updatedSkills
      });
      setCustomSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    const updatedSkills = (data.skills || []).filter(s => s !== skill);
    onDataChange({
      skills: updatedSkills
    });
  };

  const selectedSkills = data.skills || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What skills do you have?
        </h2>
        <p className="text-gray-600">
          Share your skills to help others in your community and find opportunities to teach or learn
        </p>
      </div>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Your Selected Skills ({selectedSkills.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-blue-200 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Skill */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Add a Custom Skill</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a skill not listed below"
          />
          <button
            onClick={handleAddCustomSkill}
            disabled={!customSkill.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Skill Categories */}
      <div className="space-y-6">
        {skillCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h3 className="font-semibold text-gray-900 mb-3">{category.category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {category.skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-green-600 text-xl">🤝</span>
          <div>
            <h4 className="font-medium text-green-900 mb-1">Skills Sharing</h4>
            <p className="text-sm text-green-800">
              Your skills will help us connect you with community members who might need your expertise, 
              and help you find others who can teach you new skills. This creates a valuable skills exchange network.
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
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );
};