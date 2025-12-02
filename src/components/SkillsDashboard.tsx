import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { skillsService } from '../services/skillsService';
import { useAuth } from '../hooks/useAuth';
import { UserSkill, Skill, LearningSession, SkillExchange } from '../types/skills';
import SkillsDirectory from './SkillsDirectory';
import UserSkillsManager from './UserSkillsManager';
import SkillMatching from './SkillMatching';
import LearningSessionManager from './LearningSessionManager';
import SkillExchangeManager from './SkillExchangeManager';
import TraditionalSkillsShowcase from './TraditionalSkillsShowcase';

interface SkillsDashboardProps {
  className?: string;
}

const SkillsDashboard: React.FC<SkillsDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('my-skills');
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([]);
  const [skillExchanges, setSkillExchanges] = useState<SkillExchange[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'my-skills', label: 'My Skills', icon: '🎯' },
    { id: 'directory', label: 'Skills Directory', icon: '📚' },
    { id: 'matching', label: 'Find Matches', icon: '🤝' },
    { id: 'sessions', label: 'Learning Sessions', icon: '📅' },
    { id: 'exchanges', label: 'Skill Exchanges', icon: '🔄' },
    { id: 'traditional', label: 'Traditional Skills', icon: '🏛️' }
  ];

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [skills, sessions, exchanges] = await Promise.all([
        skillsService.getUserSkills(user.id),
        skillsService.getUserLearningSessions(),
        skillsService.getUserSkillExchanges()
      ]);
      
      setUserSkills(skills);
      setLearningSessions(sessions);
      setSkillExchanges(exchanges);
    } catch (error) {
      console.error('Failed to load user skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillUpdate = () => {
    loadUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-blue-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Skills Sharing & Learning Network
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connect with your community to share knowledge, learn new skills, and preserve traditional wisdom.
            Build meaningful relationships through skill exchange and collaborative learning.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{userSkills.length}</div>
            <div className="text-gray-600">My Skills</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {userSkills.filter(s => s.canTeach).length}
            </div>
            <div className="text-gray-600">Can Teach</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{learningSessions.length}</div>
            <div className="text-gray-600">Learning Sessions</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{skillExchanges.length}</div>
            <div className="text-gray-600">Skill Exchanges</div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center mb-8"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mx-2 mb-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 shadow-md'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          {activeTab === 'my-skills' && (
            <UserSkillsManager
              userSkills={userSkills}
              onSkillUpdate={handleSkillUpdate}
            />
          )}
          
          {activeTab === 'directory' && (
            <SkillsDirectory />
          )}
          
          {activeTab === 'matching' && (
            <SkillMatching userSkills={userSkills} />
          )}
          
          {activeTab === 'sessions' && (
            <LearningSessionManager
              sessions={learningSessions}
              userSkills={userSkills}
              onSessionUpdate={handleSkillUpdate}
            />
          )}
          
          {activeTab === 'exchanges' && (
            <SkillExchangeManager
              exchanges={skillExchanges}
              userSkills={userSkills}
              onExchangeUpdate={handleSkillUpdate}
            />
          )}
          
          {activeTab === 'traditional' && (
            <TraditionalSkillsShowcase />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SkillsDashboard;