import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { skillsService } from '../services/skillsService';
import { UserSkill, Skill, ProficiencyLevel, AddUserSkillRequest } from '../types/skills';

interface UserSkillsManagerProps {
  userSkills: UserSkill[];
  onSkillUpdate: () => void;
}

const UserSkillsManager: React.FC<UserSkillsManagerProps> = ({ userSkills, onSkillUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState<AddUserSkillRequest>({
    skillId: '',
    proficiencyLevel: 'Beginner',
    canTeach: false,
    wantsToLearn: false,
    yearsOfExperience: 0,
    availableForTeaching: false,
    teachingPreferences: {
      format: ['In-person'],
      groupSize: 'Any',
      timeCommitment: 'Flexible'
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showAddForm) {
      loadAvailableSkills();
    }
  }, [showAddForm]);

  const loadAvailableSkills = async () => {
    try {
      const skills = await skillsService.getSkills();
      const userSkillIds = userSkills.map(us => us.skillId._id);
      const available = skills.filter(skill => !userSkillIds.includes(skill._id));
      setAvailableSkills(available);
    } catch (error) {
      console.error('Failed to load available skills:', error);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await skillsService.addUserSkill(formData);
      setShowAddForm(false);
      setFormData({
        skillId: '',
        proficiencyLevel: 'Beginner',
        canTeach: false,
        wantsToLearn: false,
        yearsOfExperience: 0,
        availableForTeaching: false,
        teachingPreferences: {
          format: ['In-person'],
          groupSize: 'Any',
          timeCommitment: 'Flexible'
        }
      });
      onSkillUpdate();
    } catch (error) {
      console.error('Failed to add skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkill = async (skillId: string, updates: Partial<AddUserSkillRequest>) => {
    try {
      await skillsService.updateUserSkill(skillId, updates);
      onSkillUpdate();
    } catch (error) {
      console.error('Failed to update skill:', error);
    }
  };

  const getProficiencyColor = (level: ProficiencyLevel): string => {
    const colors = {
      Beginner: 'bg-yellow-100 text-yellow-800',
      Intermediate: 'bg-blue-100 text-blue-800',
      Advanced: 'bg-green-100 text-green-800',
      Expert: 'bg-purple-100 text-purple-800'
    };
    return colors[level];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Skills</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Skill
        </button>
      </div>

      {/* Add Skill Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Add New Skill</h3>
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill
                </label>
                <select
                  value={formData.skillId}
                  onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a skill</option>
                  {availableSkills.map(skill => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proficiency Level
                </label>
                <select
                  value={formData.proficiencyLevel}
                  onChange={(e) => setFormData({ ...formData, proficiencyLevel: e.target.value as ProficiencyLevel })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.canTeach}
                  onChange={(e) => setFormData({ ...formData, canTeach: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">I can teach this skill</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.wantsToLearn}
                  onChange={(e) => setFormData({ ...formData, wantsToLearn: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">I want to learn more</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.availableForTeaching}
                  onChange={(e) => setFormData({ ...formData, availableForTeaching: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Available for teaching</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Skill'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Skills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userSkills.map((userSkill, index) => (
          <motion.div
            key={userSkill._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {userSkill.skillId.name}
              </h3>
              {userSkill.skillId.isTraditional && (
                <span className="text-orange-500 text-xl" title="Traditional Skill">
                  🏛️
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Proficiency:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(userSkill.proficiencyLevel)}`}>
                  {userSkill.proficiencyLevel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Experience:</span>
                <span className="text-sm font-medium">
                  {userSkill.yearsOfExperience} years
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {userSkill.canTeach && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  👨‍🏫 Can Teach
                </span>
              )}
              {userSkill.wantsToLearn && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  📚 Learning
                </span>
              )}
              {userSkill.availableForTeaching && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  ✅ Available
                </span>
              )}
            </div>

            {userSkill.endorsements.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{userSkill.endorsements.length}</span> endorsements
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {userSkills.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No skills added yet</h3>
          <p className="text-gray-500 mb-4">
            Start building your skill profile by adding your first skill.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Your First Skill
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSkillsManager;