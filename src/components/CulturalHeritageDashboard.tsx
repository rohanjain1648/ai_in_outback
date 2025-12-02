import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CulturalStoryCard } from './CulturalStoryCard';
import { CulturalStoryForm } from './CulturalStoryForm';
import { CulturalStoryViewer } from './CulturalStoryViewer';

interface CulturalStory {
  _id: string;
  title: string;
  summary: string;
  content: string;
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
  media: any[];
  connections: any[];
  relatedPeople: string[];
  relatedEvents: string[];
  views: number;
  likes: string[];
  comments: any[];
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

interface CreateStoryData {
  title: string;
  content: string;
  summary?: string;
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
  relatedPeople?: string[];
  relatedEvents?: string[];
  visibility: 'public' | 'community' | 'private';
}

interface Filters {
  category?: string;
  region?: string;
  tags?: string[];
  culturalSignificance?: string;
  timeframe?: string;
  searchQuery?: string;
}

export const CulturalHeritageDashboard: React.FC = () => {
  const [stories, setStories] = useState<CulturalStory[]>([]);
  const [recommendations, setRecommendations] = useState<CulturalStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<CulturalStory | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'discover' | 'recommendations' | 'my-stories'>('discover');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock current user - in real app this would come from auth context
  const currentUserId = 'user123';

  useEffect(() => {
    fetchStories();
    fetchRecommendations();
  }, [filters, currentPage]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const mockStories: CulturalStory[] = [
        {
          _id: '1',
          title: 'The Dreamtime Story of Uluru',
          summary: 'A traditional Aboriginal story about the creation of Uluru and its spiritual significance to the Anangu people.',
          content: 'Long ago, in the Dreamtime, the great ancestral spirits traveled across the land, creating the mountains, rivers, and sacred sites. The story of Uluru begins with the Kuniya (python) and Liru (poisonous snake) who came to this place...',
          author: {
            _id: 'author1',
            name: 'Mary Nganyinurpa',
            profilePicture: '/api/placeholder/40/40'
          },
          category: 'traditional',
          tags: ['dreamtime', 'uluru', 'aboriginal', 'sacred-site'],
          location: {
            coordinates: [131.0369, -25.3444],
            region: 'Northern Territory',
            specificPlace: 'Uluru-Kata Tjuta National Park'
          },
          timeframe: {
            period: 'Dreamtime',
            isOngoing: true
          },
          media: [],
          connections: [],
          relatedPeople: ['Kuniya', 'Liru', 'Anangu ancestors'],
          relatedEvents: ['Creation of Uluru', 'First ceremonies'],
          views: 1250,
          likes: ['user1', 'user2', 'user3'],
          comments: [],
          culturalSignificance: 'high',
          readingTime: 8,
          createdAt: '2024-01-15T10:30:00Z',
          aiInsights: {
            themes: ['spirituality', 'creation', 'cultural heritage', 'land connection'],
            sentiment: 'positive',
            complexity: 0.7,
            recommendedAudience: ['adults', 'cultural enthusiasts', 'tourists']
          }
        },
        {
          _id: '2',
          title: 'My Grandmother\'s Bush Telegraph',
          summary: 'A personal story about how my grandmother used traditional communication methods in remote Queensland.',
          content: 'Growing up in the 1960s in remote Queensland, my grandmother had an incredible network of communication that we called the "bush telegraph." Without phones or internet, news traveled faster than you could imagine...',
          author: {
            _id: 'author2',
            name: 'James Mitchell',
            profilePicture: '/api/placeholder/40/40'
          },
          category: 'personal',
          tags: ['family', 'communication', 'queensland', '1960s'],
          location: {
            coordinates: [145.7781, -16.9186],
            region: 'Queensland',
            specificPlace: 'Cairns region'
          },
          timeframe: {
            period: '1960s',
            specificDate: '1965-03-15'
          },
          media: [],
          connections: [],
          relatedPeople: ['Grandmother Rose', 'Uncle Bill', 'Mrs. Henderson'],
          relatedEvents: ['Cyclone season', 'School holidays'],
          views: 890,
          likes: ['user4', 'user5'],
          comments: [],
          culturalSignificance: 'medium',
          readingTime: 5,
          createdAt: '2024-01-20T14:15:00Z',
          aiInsights: {
            themes: ['family bonds', 'rural life', 'communication', 'community'],
            sentiment: 'positive',
            complexity: 0.4,
            recommendedAudience: ['adults', 'families', 'history enthusiasts']
          }
        }
      ];

      setStories(mockStories);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Mock recommendations based on user interests
      const mockRecommendations: CulturalStory[] = [
        {
          _id: '3',
          title: 'The Legend of the Rainbow Serpent',
          summary: 'An ancient Aboriginal creation story about the Rainbow Serpent who shaped the landscape.',
          content: 'The Rainbow Serpent is one of the most important creation ancestors in Aboriginal culture...',
          author: {
            _id: 'author3',
            name: 'David Unaipon',
            profilePicture: '/api/placeholder/40/40'
          },
          category: 'legend',
          tags: ['rainbow-serpent', 'creation', 'aboriginal', 'mythology'],
          location: {
            coordinates: [133.7751, -25.2744],
            region: 'Central Australia'
          },
          media: [],
          connections: [],
          relatedPeople: ['Rainbow Serpent'],
          relatedEvents: ['Land formation', 'Water creation'],
          views: 2100,
          likes: ['user6', 'user7', 'user8', 'user9'],
          comments: [],
          culturalSignificance: 'high',
          readingTime: 12,
          createdAt: '2024-01-10T09:00:00Z',
          aiInsights: {
            themes: ['mythology', 'creation', 'nature', 'spirituality'],
            sentiment: 'positive',
            complexity: 0.8,
            recommendedAudience: ['all ages', 'cultural learners', 'mythology enthusiasts']
          }
        }
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleCreateStory = async (storyData: CreateStoryData, files: File[]) => {
    setIsSubmitting(true);
    try {
      // Mock API call to create story
      console.log('Creating story:', storyData, files);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would make an API call
      // const response = await fetch('/api/culture/stories', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(storyData)
      // });
      
      setShowCreateForm(false);
      fetchStories(); // Refresh stories list
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    try {
      // Mock API call to like/unlike story
      console.log('Toggling like for story:', storyId);
      
      // Update local state optimistically
      setStories(prev => prev.map(story => {
        if (story._id === storyId) {
          const isLiked = story.likes.includes(currentUserId);
          return {
            ...story,
            likes: isLiked 
              ? story.likes.filter(id => id !== currentUserId)
              : [...story.likes, currentUserId]
          };
        }
        return story;
      }));

      if (selectedStory && selectedStory._id === storyId) {
        const isLiked = selectedStory.likes.includes(currentUserId);
        setSelectedStory({
          ...selectedStory,
          likes: isLiked 
            ? selectedStory.likes.filter(id => id !== currentUserId)
            : [...selectedStory.likes, currentUserId]
        });
      }
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleComment = async (storyId: string, content: string) => {
    try {
      // Mock API call to add comment
      console.log('Adding comment to story:', storyId, content);
      
      const newComment = {
        _id: Date.now().toString(),
        author: {
          _id: currentUserId,
          name: 'Current User',
          profilePicture: '/api/placeholder/40/40'
        },
        content,
        createdAt: new Date().toISOString(),
        isApproved: true
      };

      // Update local state
      if (selectedStory && selectedStory._id === storyId) {
        setSelectedStory({
          ...selectedStory,
          comments: [...selectedStory.comments, newComment]
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleStoryClick = (storyId: string) => {
    const story = stories.find(s => s._id === storyId) || 
                  recommendations.find(s => s._id === storyId);
    if (story) {
      setSelectedStory(story);
    }
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'historical', label: 'Historical' },
    { value: 'personal', label: 'Personal' },
    { value: 'community', label: 'Community' },
    { value: 'legend', label: 'Legend' },
    { value: 'contemporary', label: 'Contemporary' }
  ];

  const regions = [
    { value: '', label: 'All Regions' },
    { value: 'New South Wales', label: 'New South Wales' },
    { value: 'Victoria', label: 'Victoria' },
    { value: 'Queensland', label: 'Queensland' },
    { value: 'Western Australia', label: 'Western Australia' },
    { value: 'South Australia', label: 'South Australia' },
    { value: 'Tasmania', label: 'Tasmania' },
    { value: 'Northern Territory', label: 'Northern Territory' },
    { value: 'Australian Capital Territory', label: 'ACT' }
  ];

  if (selectedStory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSelectedStory(null)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Stories
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CulturalStoryViewer
            story={selectedStory}
            currentUserId={currentUserId}
            onLike={handleLikeStory}
            onComment={handleComment}
            onStoryClick={handleStoryClick}
          />
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CulturalStoryForm
            onSubmit={handleCreateStory}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Cultural Heritage</h1>
              <span className="ml-2 text-sm text-gray-500">Share and discover stories</span>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Share Story
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'discover', label: 'Discover Stories', count: stories.length },
              { key: 'recommendations', label: 'For You', count: recommendations.length },
              { key: 'my-stories', label: 'My Stories', count: 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        {activeTab === 'discover' && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={filters.region || ''}
                  onChange={(e) => handleFilterChange({ region: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultural Significance
                </label>
                <select
                  value={filters.culturalSignificance || ''}
                  onChange={(e) => handleFilterChange({ culturalSignificance: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="high">High Significance</option>
                  <option value="medium">Medium Significance</option>
                  <option value="low">Low Significance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.searchQuery || ''}
                  onChange={(e) => handleFilterChange({ searchQuery: e.target.value || undefined })}
                  placeholder="Search stories..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'discover' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <CulturalStoryCard
                      key={story._id}
                      story={story}
                      onStoryClick={handleStoryClick}
                      onLike={handleLikeStory}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Recommended for You</h2>
                    <p className="text-gray-600">Stories we think you'll enjoy based on your interests and activity.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((story) => (
                      <CulturalStoryCard
                        key={story._id}
                        story={story}
                        onStoryClick={handleStoryClick}
                        onLike={handleLikeStory}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'my-stories' && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No stories yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by sharing your first cultural story.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Share Your First Story
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {activeTab === 'discover' && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};