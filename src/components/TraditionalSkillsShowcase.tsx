import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { skillsService } from '../services/skillsService';
import { Skill, SkillMatch } from '../types/skills';

const TraditionalSkillsShowcase: React.FC = () => {
  const [traditionalSkills, setTraditionalSkills] = useState<Skill[]>([]);
  const [experts, setExperts] = useState<SkillMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'experts'>('skills');

  useEffect(() => {
    loadTraditionalSkillsData();
  }, []);

  const loadTraditionalSkillsData = async () => {
    try {
      setLoading(true);
      const [skillsData, expertsData] = await Promise.all([
        skillsService.getTraditionalSkills(),
        skillsService.getTraditionalSkillExperts()
      ]);
      setTraditionalSkills(skillsData);
      setExperts(expertsData);
    } catch (error) {
      console.error('Failed to load traditional skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillIcon = (skillName: string): string => {
    const icons: { [key: string]: string } = {
      'Bushcraft': '🏕️',
      'Traditional Cooking': '🍲',
      'Weaving': '🧶',
      'Pottery': '🏺',
      'Woodworking': '🪵',
      'Blacksmithing': '🔨',
      'Herbalism': '🌿',
      'Storytelling': '📚',
      'Traditional Music': '🎵',
      'Aboriginal Art': '🎨',
      'Farming': '🚜',
      'Beekeeping': '🐝',
      'Cheese Making': '🧀',
      'Bread Making': '🍞',
      'Preserving': '🥫'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
      if (skillName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '🏛️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Traditional Skills Preservation</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Preserving and sharing traditional knowledge and skills that have been passed down through generations.
          Connect with experts and help keep these valuable skills alive in our community.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'skills'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Traditional Skills ({traditionalSkills.length})
          </button>
          <button
            onClick={() => setActiveTab('experts')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'experts'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Skill Keepers ({experts.length})
          </button>
        </div>
      </div>

      {/* Traditional Skills Tab */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {traditionalSkills.map((skill, index) => (
            <motion.div
              key={skill._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{getSkillIcon(skill.name)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{skill.name}</h3>
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    {skill.category}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {skill.description}
              </p>
              
              {skill.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {skill.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {skill.tags.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                      +{skill.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-600 font-medium">
                  🏛️ Traditional Knowledge
                </span>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Find Teachers →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Skill Keepers Tab */}
      {activeTab === 'experts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert, index) => (
            <motion.div
              key={expert._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">
                    {expert.userId.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{expert.userId.name}</h3>
                  <p className="text-sm text-gray-600">
                    {expert.proficiencyLevel} • {expert.yearsOfExperience} years
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{getSkillIcon(expert.skillId.name)}</span>
                  <span className="font-medium text-gray-800">{expert.skillId.name}</span>
                </div>
                {expert.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {expert.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📍</span>
                  {expert.userId.location?.address || 'Location not specified'}
                </div>
                
                {expert.teachingPreferences && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">💻</span>
                    {expert.teachingPreferences.format.join(', ')}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {expert.availableForTeaching && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✅ Available
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  🏛️ Keeper
                </span>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                  Connect
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty States */}
      {activeTab === 'skills' && traditionalSkills.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏛️</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No traditional skills found</h3>
          <p className="text-gray-500">
            Traditional skills will appear here as they are added to the community.
          </p>
        </div>
      )}

      {activeTab === 'experts' && experts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No skill keepers found</h3>
          <p className="text-gray-500">
            Traditional skill experts will appear here as community members add their expertise.
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Help Preserve Traditional Knowledge
        </h3>
        <p className="text-gray-600 mb-4">
          Do you have traditional skills or knowledge to share? Join our community of skill keepers
          and help preserve valuable cultural heritage for future generations.
        </p>
        <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          Become a Skill Keeper
        </button>
      </div>
    </div>
  );
};

export default TraditionalSkillsShowcase;