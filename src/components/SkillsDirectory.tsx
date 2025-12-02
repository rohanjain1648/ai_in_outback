import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { skillsService } from '../services/skillsService';
import { Skill, SkillCategory } from '../types/skills';

const SkillsDirectory: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | ''>('');
  const [showTraditionalOnly, setShowTraditionalOnly] = useState(false);

  const categories: SkillCategory[] = [
    'Agriculture', 'Crafts', 'Technology', 'Business', 'Health',
    'Education', 'Traditional', 'Mechanical', 'Creative', 'Other'
  ];

  useEffect(() => {
    loadSkills();
  }, []);

  useEffect(() => {
    filterSkills();
  }, [skills, searchTerm, selectedCategory, showTraditionalOnly]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const skillsData = await skillsService.getSkills();
      setSkills(skillsData);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = skills;

    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    if (showTraditionalOnly) {
      filtered = filtered.filter(skill => skill.isTraditional);
    }

    setFilteredSkills(filtered);
  };

  const getCategoryColor = (category: SkillCategory): string => {
    const colors = {
      Agriculture: 'bg-green-100 text-green-800',
      Crafts: 'bg-purple-100 text-purple-800',
      Technology: 'bg-blue-100 text-blue-800',
      Business: 'bg-yellow-100 text-yellow-800',
      Health: 'bg-red-100 text-red-800',
      Education: 'bg-indigo-100 text-indigo-800',
      Traditional: 'bg-orange-100 text-orange-800',
      Mechanical: 'bg-gray-100 text-gray-800',
      Creative: 'bg-pink-100 text-pink-800',
      Other: 'bg-teal-100 text-teal-800'
    };
    return colors[category];
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Skills Directory</h2>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTraditionalOnly}
              onChange={(e) => setShowTraditionalOnly(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Traditional Skills Only</span>
          </label>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill, index) => (
          <motion.div
            key={skill._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{skill.name}</h3>
              {skill.isTraditional && (
                <span className="text-orange-500 text-xl" title="Traditional Skill">
                  🏛️
                </span>
              )}
            </div>
            
            <div className="mb-3">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(skill.category)}`}>
                {skill.category}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {skill.description}
            </p>
            
            {skill.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {skill.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {skill.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{skill.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No skills found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or browse all skills.
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillsDirectory;