import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { skillsService } from '../services/skillsService';
import { LearningSession, UserSkill, CreateLearningSessionRequest } from '../types/skills';

interface LearningSessionManagerProps {
  sessions: LearningSession[];
  userSkills: UserSkill[];
  onSessionUpdate: () => void;
}

const LearningSessionManager: React.FC<LearningSessionManagerProps> = ({
  sessions,
  userSkills,
  onSessionUpdate
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateLearningSessionRequest>({
    learnerId: '',
    skillId: '',
    title: '',
    description: '',
    format: 'In-person',
    scheduledDate: '',
    duration: 60,
    maxParticipants: 1
  });
  const [loading, setLoading] = useState(false);

  const teachableSkills = userSkills.filter(skill => skill.canTeach && skill.availableForTeaching);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await skillsService.createLearningSession(formData);
      setShowCreateForm(false);
      setFormData({
        learnerId: '',
        skillId: '',
        title: '',
        description: '',
        format: 'In-person',
        scheduledDate: '',
        duration: 60,
        maxParticipants: 1
      });
      onSessionUpdate();
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async (sessionId: string, updates: Partial<LearningSession>) => {
    try {
      await skillsService.updateLearningSession(sessionId, updates);
      onSessionUpdate();
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      Scheduled: 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Learning Sessions</h2>
        {teachableSkills.length > 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Session
          </button>
        )}
      </div>

      {/* Create Session Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Create Learning Session</h3>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill to Teach
                </label>
                <select
                  value={formData.skillId}
                  onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
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
                  Format
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="In-person">In-person</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Introduction to Organic Gardening"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Describe what will be covered in this session..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
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
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session, index) => (
          <motion.div
            key={session._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{session.title}</h3>
                <p className="text-sm text-gray-600">{session.skillId.name}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                {session.status}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{session.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="mr-2">📅</span>
                {formatDate(session.scheduledDate)}
              </div>
              <div className="flex items-center">
                <span className="mr-2">⏱️</span>
                {session.duration} minutes
              </div>
              <div className="flex items-center">
                <span className="mr-2">{session.format === 'Online' ? '💻' : '📍'}</span>
                {session.format}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Teacher: {session.teacherId.name}</span>
                <span>Learner: {session.learnerId.name}</span>
              </div>
              
              {session.status === 'Scheduled' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateSession(session._id, { status: 'In Progress' })}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleUpdateSession(session._id, { status: 'Cancelled' })}
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No learning sessions yet</h3>
          <p className="text-gray-500 mb-4">
            {teachableSkills.length > 0 
              ? 'Create your first learning session to start teaching.'
              : 'Add teachable skills to your profile to create learning sessions.'
            }
          </p>
          {teachableSkills.length > 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Your First Session
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningSessionManager;