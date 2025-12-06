// @ts-nocheck
import { body, query } from 'express-validator';

export const wellbeingCheckInValidation = [
  body('moodScore')
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood score must be between 1 and 10'),
  
  body('stressLevel')
    .isInt({ min: 1, max: 10 })
    .withMessage('Stress level must be between 1 and 10'),
  
  body('sleepQuality')
    .isInt({ min: 1, max: 10 })
    .withMessage('Sleep quality must be between 1 and 10'),
  
  body('socialConnection')
    .isInt({ min: 1, max: 10 })
    .withMessage('Social connection must be between 1 and 10'),
  
  body('physicalActivity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Physical activity must be between 1 and 10'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
    .custom((value) => {
      // Basic content filtering for inappropriate content
      const inappropriateWords = ['suicide', 'kill myself', 'end it all', 'self harm'];
      const lowerValue = value.toLowerCase();
      
      // Flag but don't reject - this will be handled by AI analysis
      if (inappropriateWords.some(word => lowerValue.includes(word))) {
        // This will be caught by the AI analysis for crisis intervention
        return true;
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      if (tags && tags.some((tag: string) => tag.length > 50)) {
        throw new Error('Each tag must be less than 50 characters');
      }
      return true;
    }),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean')
];

export const supportConnectionValidation = [
  body('supporterId')
    .isMongoId()
    .withMessage('Valid supporter ID is required'),
  
  body('connectionType')
    .optional()
    .isIn(['peer_support', 'mentor', 'buddy', 'crisis_support'])
    .withMessage('Invalid connection type'),
  
  body('supportAreas')
    .optional()
    .isArray()
    .withMessage('Support areas must be an array')
    .custom((areas) => {
      if (areas && areas.length > 20) {
        throw new Error('Maximum 20 support areas allowed');
      }
      return true;
    })
];

export const peerChatValidation = [
  body('connectionId')
    .isMongoId()
    .withMessage('Valid connection ID is required'),
  
  body('chatType')
    .optional()
    .isIn(['one_on_one', 'group', 'crisis_support'])
    .withMessage('Invalid chat type')
];

export const messageValidation = [
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message must be less than 2000 characters')
    .custom((content) => {
      // Basic content filtering
      const spam = /(.)\1{10,}/; // Repeated characters
      if (spam.test(content)) {
        throw new Error('Message appears to be spam');
      }
      return true;
    }),
  
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'system'])
    .withMessage('Invalid message type')
];

export const resourceQueryValidation = [
  query('category')
    .optional()
    .isIn(['telehealth', 'crisis', 'support_group', 'self_help', 'professional', 'emergency'])
    .withMessage('Invalid resource category'),
  
  query('state')
    .optional()
    .isIn(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'])
    .withMessage('Invalid Australian state'),
  
  query('specialization')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Specialization must be between 2 and 50 characters')
];

export const dashboardQueryValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
