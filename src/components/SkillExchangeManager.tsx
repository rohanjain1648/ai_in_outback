import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { skillsService } from '../services/skillsService';
import { SkillExchange, UserSkill, CreateSkillExchangeRequest } from '../types/skills';

interface SkillExchangeManagerProps {
  exchanges: SkillExchange[];
  userSkills: UserSkill[];
  onExchangeUpdate: () => void;
}

const SkillExchangeManager: React.FC<SkillExchangeManagerProps> = ({
  exchanges,
  userSkills,
  onExchangeUpdate
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateSkillExchangeRequest>({
    participantB: '',
    skillOfferedByA: '',
    skillRequestedByA: '',
    skillOfferedByB: '',
    skillRequestedByB: '',
    exchangeType: 'Direct',
    timeCommitment: {
      hoursOfferedByA: 5,
      hoursOfferedByB: 5
    }
  });
  const [loading, setLoading] = useState(false);

  const teachableSkills = userSkills.filter(skill => skill.canTeach);
  const learningSkills = userSkills.filter(skill => skill.wantsToLearn);

  const handleCreateExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await skillsService.createSkillExchange(formData);
      setShowCreateForm(false);
      setFormData({
        participantB: '',
        skillOfferedByA: '',
        skillRequestedByA: '',
        skillOfferedByB: '',
        skillRequestedByB: '',
        exchangeType: 'Direct',
        timeCommitment: {
          hoursOfferedByA: 5,
          hoursOfferedByB: 5
        }
      });
      onExchangeUpdate();
    } catch (error) {
      console.error('Failed to create exchange:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExchange = async (exchangeId: string, updates: Partial<SkillExchange>) => {
    try {
      await skillsService.updateSkillExchange(exchangeId, updates);
      onExchangeUpdate();
    } catch (error) {
      console.error('Failed to update exchange:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      Proposed: 'bg-yellow-100 text-yellow-800',
      Accepted: 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getProgressPercentage = (exchange: SkillExchange): number => {
    const totalSessions = exchange.completionTracking.totalSessionsAtoB + exchange.completionTracking.totalSessionsBtoA;
    const completedSessions = exchange.completionTracking.sessionsCompletedAtoB + exchange.completionTracking.sessionsCompletedBtoA;
    return totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Skill Exchanges</h2>
        {teachableSkills.length > 0 && learningSkills.length > 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Propose Exchange
          </button>
        )}
      </div>

      {/* Create Exchange Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Propose Skill Exchange</h3>
          <form onSubmit={handleCreateExchange} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What I Offer */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">What I Offer</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill I Can Teach
                  </label>
                  <select
                    value={formData.skillOfferedByA}
                    onChange={(e) => setFormData({ ...formData, skillOfferedByA: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a skill</option>
                    {teachableSkills.map(skill => (
                      <option key={skill._id} value={skill.skillId._id}>
                        {skill.skillId.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours I Can Offer
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.timeCommitment.hoursOfferedByA}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeCommitment: {
                        ...formData.timeCommitment,
                        hoursOfferedByA: parseInt(e.target.value) || 1
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* What I Want */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">What I Want</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill I Want to Learn
                  </label>
                  <select
                    value={formData.skillRequestedByA}
                    onChange={(e) => setFormData({ ...formData, skillRequestedByA: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a skill</option>
                    {learningSkills.map(skill => (
                      <option key={skill._id} value={skill.skillId._id}>
                        {skill.skillId.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours I Want to Receive
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.timeCommitment.hoursOfferedByB}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeCommitment: {
                        ...formData.timeCommitment,
                        hoursOfferedByB: parseInt(e.target.value) || 1
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exchange Type
              </label>
              <select
                value={formData.exchangeType}
                onChange={(e) => setFormData({ ...formData, exchangeType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Direct">Direct Exchange</option>
                <option value="Time Bank">Time Bank</option>
                <option value="Skill Credits">Skill Credits</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Proposing...' : 'Propose Exchange'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Exchanges List */}
      <div className="space-y-4">
        {exchanges.map((exchange, index) => (
          <motion.div
            key={exchange._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {exchange.skillOfferedByA.name} ↔ {exchange.skillRequestedByA.name}
                </h3>
                <p className="text-sm text-gray-600">
                  with {exchange.participantB.name}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exchange.status)}`}>
                {exchange.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">You Teach</h4>
                <p className="text-sm text-gray-600">{exchange.skillOfferedByA.name}</p>
                <p className="text-sm text-gray-600">
                  {exchange.timeCommitment.hoursOfferedByA} hours committed
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">You Learn</h4>
                <p className="text-sm text-gray-600">{exchange.skillRequestedByA.name}</p>
                <p className="text-sm text-gray-600">
                  {exchange.timeCommitment.hoursOfferedByB} hours to receive
                </p>
              </div>
            </div>

            {exchange.status === 'In Progress' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(getProgressPercentage(exchange))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(exchange)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="mr-4">Type: {exchange.exchangeType}</span>
                <span>Points: {exchange.reputation.pointsEarnedByA}</span>
              </div>
              
              <div className="flex space-x-2">
                {exchange.status === 'Proposed' && (
                  <>
                    <button
                      onClick={() => handleUpdateExchange(exchange._id, { status: 'Cancelled' })}
                      className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {exchange.status === 'Accepted' && (
                  <button
                    onClick={() => handleUpdateExchange(exchange._id, { status: 'In Progress' })}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Start Exchange
                  </button>
                )}
                {exchange.status === 'In Progress' && (
                  <button
                    onClick={() => handleUpdateExchange(exchange._id, { status: 'Completed' })}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {exchanges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔄</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No skill exchanges yet</h3>
          <p className="text-gray-500 mb-4">
            {teachableSkills.length > 0 && learningSkills.length > 0
              ? 'Propose your first skill exchange to start learning and teaching.'
              : 'Add both teachable and learning skills to your profile to create exchanges.'
            }
          </p>
          {teachableSkills.length > 0 && learningSkills.length > 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Propose Your First Exchange
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillExchangeManager;