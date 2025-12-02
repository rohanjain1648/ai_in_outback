import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface MediaItem {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  filename: string;
  caption?: string;
  thumbnailUrl?: string;
  metadata?: {
    duration?: number;
    dimensions?: { width: number; height: number };
  };
}

interface StoryConnection {
  storyId: string;
  connectionType: 'related' | 'sequel' | 'prequel' | 'reference' | 'location' | 'family';
  description?: string;
  strength: number;
}

interface Comment {
  _id: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
  isApproved: boolean;
}

interface CulturalStory {
  _id: string;
  title: string;
  content: string;
  summary: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  category: 'traditional' | 'historical' | 'personal' | 'community' | 'legend' | 'contemporary';
  tags: string[];
  location: {
    coordinates: [number, number];
    region: string;
    specificPlace?: string;
  };
  timeframe?: {
    period?: string;
    specificDate?: string;
    isOngoing?: boolean;
  };
  media: MediaItem[];
  connections: StoryConnection[];
  relatedPeople: string[];
  relatedEvents: string[];
  views: number;
  likes: string[];
  comments: Comment[];
  culturalSignificance: 'high' | 'medium' | 'low';
  readingTime: number;
  createdAt: string;
  aiInsights: {
    themes: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
    complexity: number;
    recommendedAudience: string[];
  };
}

interface CulturalStoryViewerProps {
  story: CulturalStory;
  currentUserId?: string;
  onLike: (storyId: string) => void;
  onComment: (storyId: string, content: string) => void;
  onStoryClick: (storyId: string) => void;
  relatedStories?: CulturalStory[];
}

// 3D Story Visualization Component
const StoryVisualization: React.FC<{ story: CulturalStory }> = ({ story }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getCategoryColor = (category: string): string => {
    const colors = {
      traditional: '#f59e0b',
      historical: '#3b82f6',
      personal: '#10b981',
      community: '#8b5cf6',
      legend: '#ef4444',
      contemporary: '#6b7280'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Central story sphere */}
      <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color={getCategoryColor(story.category)} />
      </Sphere>
      
      {/* Story title */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {story.title}
      </Text>
      
      {/* Connection nodes */}
      {story.connections.slice(0, 6).map((connection, index) => {
        const angle = (index / story.connections.length) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={connection.storyId}>
            <Sphere args={[0.3, 16, 16]} position={[x, 0, z]}>
              <meshStandardMaterial 
                color={connection.connectionType === 'family' ? '#ef4444' : 
                       connection.connectionType === 'location' ? '#10b981' : '#3b82f6'} 
              />
            </Sphere>
            {/* Connection line */}
            <Box args={[0.05, 0.05, radius]} position={[x/2, 0, z/2]} rotation={[0, angle, 0]}>
              <meshStandardMaterial color="#ffffff" opacity={0.5} transparent />
            </Box>
          </group>
        );
      })}
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </Canvas>
  );
};

export const CulturalStoryViewer: React.FC<CulturalStoryViewerProps> = ({
  story,
  currentUserId,
  onLike,
  onComment,
  onStoryClick,
  relatedStories = []
}) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [show3DView, setShow3DView] = useState(false);
  const [isPlaying, setIsPlaying] = useState<{ [key: number]: boolean }>({});

  const isLiked = currentUserId && story.likes.includes(currentUserId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(story._id, commentText.trim());
      setCommentText('');
    }
  };

  const renderMediaItem = (media: MediaItem, index: number) => {
    switch (media.type) {
      case 'image':
        return (
          <div
            key={index}
            className="relative cursor-pointer group"
            onClick={() => setSelectedMediaIndex(index)}
          >
            <img
              src={media.thumbnailUrl || media.url}
              alt={media.caption || media.filename}
              className="w-full h-48 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm5 3a2 2 0 11-4 0 2 2 0 014 0zm4.5 8.5l-3-3-1.5 1.5-3-3V16h7.5z" clipRule="evenodd" />
              </svg>
            </div>
            {media.caption && (
              <p className="text-sm text-gray-600 mt-2">{media.caption}</p>
            )}
          </div>
        );
      
      case 'video':
        return (
          <div key={index} className="relative">
            <video
              controls
              className="w-full h-48 object-cover rounded-lg"
              poster={media.thumbnailUrl}
            >
              <source src={media.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {media.caption && (
              <p className="text-sm text-gray-600 mt-2">{media.caption}</p>
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{media.filename}</p>
                {media.metadata?.duration && (
                  <p className="text-sm text-gray-500">
                    Duration: {Math.floor(media.metadata.duration / 60)}:{(media.metadata.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
            <audio controls className="w-full mt-3">
              <source src={media.url} />
              Your browser does not support the audio element.
            </audio>
            {media.caption && (
              <p className="text-sm text-gray-600 mt-2">{media.caption}</p>
            )}
          </div>
        );
      
      case 'document':
        return (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{media.filename}</p>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Document
                </a>
              </div>
            </div>
            {media.caption && (
              <p className="text-sm text-gray-600 mt-2">{media.caption}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{story.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                {story.author.profilePicture ? (
                  <img
                    src={story.author.profilePicture}
                    alt={story.author.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-sm text-gray-600">
                      {story.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span>{story.author.name}</span>
              </div>
              <span>•</span>
              <span>{formatDate(story.createdAt)}</span>
              <span>•</span>
              <span>{story.readingTime} min read</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShow3DView(!show3DView)}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
              title="3D Story Visualization"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
            <button
              onClick={() => onLike(story._id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                isLiked 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{story.likes.length}</span>
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            story.category === 'traditional' ? 'bg-amber-100 text-amber-800' :
            story.category === 'historical' ? 'bg-blue-100 text-blue-800' :
            story.category === 'personal' ? 'bg-green-100 text-green-800' :
            story.category === 'community' ? 'bg-purple-100 text-purple-800' :
            story.category === 'legend' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {story.category}
          </span>
          
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            📍 {story.location.region}
            {story.location.specificPlace && `, ${story.location.specificPlace}`}
          </span>
          
          {story.timeframe?.period && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              🕐 {story.timeframe.period}
            </span>
          )}
          
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            👁 {story.views} views
          </span>
        </div>

        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {story.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3D Visualization */}
      <AnimatePresence>
        {show3DView && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 400, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 overflow-hidden"
          >
            <StoryVisualization story={story} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-6">
        <div className="prose prose-lg max-w-none">
          {story.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-800 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Media Gallery */}
        {story.media.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {story.media.map((media, index) => renderMediaItem(media, index))}
            </div>
          </div>
        )}

        {/* Related People and Events */}
        {(story.relatedPeople.length > 0 || story.relatedEvents.length > 0) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {story.relatedPeople.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Related People</h3>
                <div className="space-y-2">
                  {story.relatedPeople.map((person, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{person}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {story.relatedEvents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Events</h3>
                <div className="space-y-2">
                  {story.relatedEvents.map((event, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Insights */}
        {story.aiInsights.themes.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Story Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Themes</h4>
                <div className="flex flex-wrap gap-1">
                  {story.aiInsights.themes.map((theme, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Recommended For</h4>
                <div className="flex flex-wrap gap-1">
                  {story.aiInsights.recommendedAudience.map((audience, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                      {audience}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story Connections */}
        {story.connections.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {story.connections.map((connection, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onStoryClick(connection.storyId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      connection.connectionType === 'family' ? 'bg-red-100 text-red-800' :
                      connection.connectionType === 'location' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {connection.connectionType}
                    </span>
                    <div className="flex">
                      {Array.from({ length: Math.round(connection.strength * 5) }).map((_, i) => (
                        <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {connection.description && (
                    <p className="text-sm text-gray-600">{connection.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="border-t border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Comments ({story.comments.length})
            </h3>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showComments ? 'Hide Comments' : 'Show Comments'}
            </button>
          </div>

          {currentUserId && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts about this story..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {commentText.length}/1000 characters
                </span>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Comment
                </button>
              </div>
            </form>
          )}

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                {story.comments.filter(comment => comment.isApproved).map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    {comment.author.profilePicture ? (
                      <img
                        src={comment.author.profilePicture}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm text-gray-600">
                          {comment.author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author.name}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {story.comments.filter(comment => comment.isApproved).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Media Modal */}
      <AnimatePresence>
        {selectedMediaIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMediaIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={story.media[selectedMediaIndex].url}
                alt={story.media[selectedMediaIndex].caption || story.media[selectedMediaIndex].filename}
                className="max-w-full max-h-full object-contain"
              />
              {story.media[selectedMediaIndex].caption && (
                <p className="text-white text-center mt-4">
                  {story.media[selectedMediaIndex].caption}
                </p>
              )}
            </motion.div>
            <button
              onClick={() => setSelectedMediaIndex(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};