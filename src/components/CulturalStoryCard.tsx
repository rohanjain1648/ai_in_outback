import React from 'react';
import { motion } from 'framer-motion';

interface MediaItem {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  filename: string;
  caption?: string;
  thumbnailUrl?: string;
}

interface CulturalStory {
  _id: string;
  title: string;
  summary: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  category: 'traditional' | 'historical' | 'personal' | 'community' | 'legend' | 'contemporary';
  tags: string[];
  location: {
    region: string;
    specificPlace?: string;
  };
  timeframe?: {
    period?: string;
    specificDate?: string;
  };
  media: MediaItem[];
  featuredImage?: string;
  views: number;
  likes: string[];
  culturalSignificance: 'high' | 'medium' | 'low';
  readingTime: number;
  createdAt: string;
}

interface CulturalStoryCardProps {
  story: CulturalStory;
  onStoryClick: (storyId: string) => void;
  onLike?: (storyId: string) => void;
  currentUserId?: string;
  className?: string;
}

const categoryColors = {
  traditional: 'bg-amber-100 text-amber-800',
  historical: 'bg-blue-100 text-blue-800',
  personal: 'bg-green-100 text-green-800',
  community: 'bg-purple-100 text-purple-800',
  legend: 'bg-red-100 text-red-800',
  contemporary: 'bg-gray-100 text-gray-800'
};

const significanceIcons = {
  high: '⭐⭐⭐',
  medium: '⭐⭐',
  low: '⭐'
};

export const CulturalStoryCard: React.FC<CulturalStoryCardProps> = ({
  story,
  onStoryClick,
  onLike,
  currentUserId,
  className = ''
}) => {
  const isLiked = currentUserId && story.likes.includes(currentUserId);
  const featuredMedia = story.featuredImage || story.media.find(m => m.type === 'image');

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(story._id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden ${className}`}
      whileHover={{ y: -2 }}
      onClick={() => onStoryClick(story._id)}
    >
      {/* Featured Image */}
      {featuredMedia && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={featuredMedia.thumbnailUrl || featuredMedia.url}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[story.category]}`}>
              {story.category}
            </span>
          </div>
          {story.culturalSignificance === 'high' && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              {significanceIcons[story.culturalSignificance]}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {story.title}
          </h3>
          {onLike && (
            <button
              onClick={handleLike}
              className={`ml-2 p-1 rounded-full transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Summary */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {story.summary}
        </p>

        {/* Author and Location */}
        <div className="flex items-center mb-3">
          {story.author.profilePicture ? (
            <img
              src={story.author.profilePicture}
              alt={story.author.name}
              className="w-6 h-6 rounded-full mr-2"
            />
          ) : (
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
              <span className="text-xs text-gray-600">
                {story.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-700 mr-2">{story.author.name}</span>
          <span className="text-sm text-gray-500">• {story.location.region}</span>
        </div>

        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {story.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {story.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{story.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Timeframe */}
        {story.timeframe?.period && (
          <div className="text-sm text-gray-500 mb-3">
            <span className="inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {story.timeframe.period}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {story.views}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {story.likes.length}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {story.readingTime} min read
            </span>
          </div>
          <span>{formatDate(story.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
};