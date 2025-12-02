import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { skillsService } from '../services/skillsService';
import { UserSkill, SkillMatch } from '../types/skills';

interface SkillMatchingProps {
  userSkills: UserSkill[];
}

const SkillMatching: React.FC<SkillMatchingProps> = ({ userSkills }) => {
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [matchType, setMatchType] = useState<'teacher' | 'learner'>('teacher');
  const [matches, setMatches] = useState<SkillMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFindMatches = async () => {
    if (!selectedSkill) return;

    try {
      setLoading(true);
      const matchResults = await skillsService.findSkillMatches(selectedSkill, matchType);
      setMatches(matchResults);
    } catch (error) {
      console.error('Failed to find matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDistanceText = (coordinates?: [number, number]) => {
    if (!coordinates) return 'Location not available';
    // This would calculate actual distance in a real implementation
    return 'Within 50km';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Skill Matches</h2>
        <p className="text-gray-600">
          Connect with community members to learn new skills or share your expertise.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Choose a skill</option>
              {userSkills.map(userSkill => (
                <option key={userSkill._id} value={userSkill.skillId._id}>
                  {userSkill.skillId.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I want to find
            </label>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as 'teacher' | 'learner')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="teacher">Teachers (I want to learn)</option>
              <option value="learner">Learners (I want to teach)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFindMatches}
              disabled={!selectedSkill || loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Find Matches'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {matches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Found {matches.length} {matchType === 'teacher' ? 'teachers' : 'learners'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-lg">
                      {match.userId.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{match.userId.name}</h4>
                    <p className="text-sm text-gray-600">
                      {match.proficiencyLevel} • {match.yearsOfExperience} years
                    </p>
                  </div>
                </div>

                {match.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {match.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    {getDistanceText(match.userId.location?.coordinates)}
                  </div>
                  
                  {match.teachingPreferences && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">💻</span>
                      {match.teachingPreferences.format.join(', ')}
                    </div>
                  )}
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
        </div>
      )}

      {matches.length === 0 && selectedSkill && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No matches found</h3>
          <p className="text-gray-500">
            Try searching for a different skill or check back later as more members join.
          </p>
        </div>
      )}

      {userSkills.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Add skills to find matches</h3>
          <p className="text-gray-500">
            You need to add skills to your profile before you can find matches.
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillMatching;