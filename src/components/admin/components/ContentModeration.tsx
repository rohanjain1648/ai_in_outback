/**
 * Content Moderation Component for Admin Dashboard
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FlaggedContent {
  _id: string;
  type: 'resource' | 'story' | 'chat' | 'profile';
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
  flaggedBy: {
    name: string;
    reason: string;
  };
  flaggedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
  severity: 'low' | 'medium' | 'high';
}

export const ContentModeration: React.FC = () => {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const fetchFlaggedContent = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockContent: FlaggedContent[] = [
        {
          _id: '1',
          type: 'resource',
          title: 'Farm Equipment Rental Service',
          content: 'Offering tractor rental services in the Central West region...',
          author: {
            name: 'John Smith',
            email: 'john.smith@example.com'
          },
          flaggedBy: {
            name: 'Sarah Johnson',
            reason: 'Inappropriate pricing information'
          },
          flaggedAt: '2024-01-20T10:30:00Z',
          status: 'pending',
          severity: 'low'
        },
        {
          _id: '2',
          type: 'story',
          title: 'My Family\'s Farming Heritage',
          content: 'This story contains some questionable historical claims...',
          author: {
            name: 'Mike Wilson',
            email: 'mike.wilson@example.com'
          },
          flaggedBy: {
            name: 'Admin System',
            reason: 'AI detected potentially misleading information'
          },
          flaggedAt: '2024-01-20T09:15:00Z',
          status: 'pending',
          severity: 'medium'
        }
      ];
      
      setFlaggedContent(mockContent);
    } catch (error) {
      console.error('Failed to fetch flagged content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentAction = async (contentId: string, action: 'approve' | 'reject' | 'remove') => {
    try {
      // In real implementation, make API call
      setFlaggedContent(prev => 
        prev.map(content => 
          content._id === contentId 
            ? { ...content, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'removed' }
            : content
        )
      );
    } catch (error) {
      console.error('Failed to update content status:', error);
    }
  };

  const filteredContent = flaggedContent.filter(content => {
    const matchesType = filterType === 'all' || content.type === filterType;
    const matchesStatus = filterStatus === 'all' || content.status === filterStatus;
    return matchesType && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Content Moderation</h2>
        <div className="flex items-center space-x-2">
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {filteredContent.filter(c => c.status === 'pending').length} pending review
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="resource">Resources</option>
              <option value="story">Stories</option>
              <option value="chat">Chat Messages</option>
              <option value="profile">Profiles</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flagged Content List */}
      <div className="space-y-4">
        {filteredContent.map((content) => (
          <motion.div
            key={content._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    content.type === 'resource' ? 'bg-blue-100 text-blue-800' :
                    content.type === 'story' ? 'bg-green-100 text-green-800' :
                    content.type === 'chat' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {content.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    content.severity === 'high' ? 'bg-red-100 text-red-800' :
                    content.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {content.severity} priority
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    content.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    content.status === 'approved' ? 'bg-green-100 text-green-800' :
                    content.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {content.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{content.content}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Author:</span> {content.author.name} ({content.author.email})
                  </div>
                  <div>
                    <span className="font-medium">Flagged by:</span> {content.flaggedBy.name}
                  </div>
                  <div>
                    <span className="font-medium">Reason:</span> {content.flaggedBy.reason}
                  </div>
                  <div>
                    <span className="font-medium">Flagged:</span> {new Date(content.flaggedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {content.status === 'pending' && (
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleContentAction(content._id, 'approve')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleContentAction(content._id, 'reject')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleContentAction(content._id, 'remove')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  View Full Content
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flagged content</h3>
          <p className="text-gray-500">All content is currently approved or there are no items matching your filters.</p>
        </div>
      )}
    </div>
  );
};