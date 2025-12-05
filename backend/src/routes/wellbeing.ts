// @ts-nocheck
import { Router, Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import wellbeingService from '../services/wellbeingService';
import WellbeingCheckIn from '../models/WellbeingCheckIn';
import MentalHealthResource from '../models/MentalHealthResource';
import SupportConnection from '../models/SupportConnection';
import PeerSupportChat from '../models/PeerSupportChat';
import { body, validationResult, query } from 'express-validator';
import { successResponse, errorResponse } from '../utils/response';

const router = Router();

// Validation middleware
const checkInValidation = [
  body('moodScore').isInt({ min: 1, max: 10 }).withMessage('Mood score must be between 1 and 10'),
  body('stressLevel').isInt({ min: 1, max: 10 }).withMessage('Stress level must be between 1 and 10'),
  body('sleepQuality').isInt({ min: 1, max: 10 }).withMessage('Sleep quality must be between 1 and 10'),
  body('socialConnection').isInt({ min: 1, max: 10 }).withMessage('Social connection must be between 1 and 10'),
  body('physicalActivity').isInt({ min: 1, max: 10 }).withMessage('Physical activity must be between 1 and 10'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean')
];

// Get wellbeing dashboard
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 30;
    
    const dashboard = await wellbeingService.getWellbeingDashboard(userId, days);
    
    res.json(successResponse(dashboard, 'Wellbeing dashboard retrieved successfully'));
  } catch (error) {
    console.error('Error getting wellbeing dashboard:', error);
    res.status(500).json(errorResponse('Failed to retrieve wellbeing dashboard'));
  }
});

// Submit wellbeing check-in
router.post('/checkin', authenticate, checkInValidation, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errorResponse('Validation failed', errors.array()));
    }

    const userId = req.user!.id;
    const checkIn = await wellbeingService.createWellbeingCheckIn(userId, req.body);
    
    res.status(201).json(successResponse(checkIn, 'Wellbeing check-in submitted successfully'));
  } catch (error) {
    console.error('Error creating wellbeing check-in:', error);
    res.status(500).json(errorResponse('Failed to submit wellbeing check-in'));
  }
});

// Get wellbeing check-in history
router.get('/checkins', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const checkIns = await WellbeingCheckIn.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WellbeingCheckIn.countDocuments({ userId });

    res.json(successResponse({
      checkIns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Check-in history retrieved successfully'));
  } catch (error) {
    console.error('Error getting check-in history:', error);
    res.status(500).json(errorResponse('Failed to retrieve check-in history'));
  }
});

// Get support resources
router.get('/resources', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const category = req.query.category as string;
    const state = req.query.state as string;
    
    let resources;
    if (category || state) {
      const query: any = { isVerified: true };
      if (category) query.category = category;
      if (state) {
        query.$or = [
          { 'location.state': state },
          { 'location.isNational': true }
        ];
      }
      resources = await MentalHealthResource.find(query)
        .sort({ rating: -1, reviewCount: -1 })
        .limit(20);
    } else {
      resources = await wellbeingService.getRecommendedResources(userId, state);
    }
    
    res.json(successResponse(resources, 'Mental health resources retrieved successfully'));
  } catch (error) {
    console.error('Error getting mental health resources:', error);
    res.status(500).json(errorResponse('Failed to retrieve mental health resources'));
  }
});

// Find support matches
router.get('/support-matches', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const supportType = req.query.type as 'peer_support' | 'mentor' | 'buddy' || 'peer_support';
    
    const matches = await wellbeingService.findSupportMatches(userId, supportType);
    
    res.json(successResponse(matches, 'Support matches found successfully'));
  } catch (error) {
    console.error('Error finding support matches:', error);
    res.status(500).json(errorResponse('Failed to find support matches'));
  }
});

// Create support connection
router.post('/support-connection', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { supporterId, connectionType, supportAreas } = req.body;
    const supporteeId = req.user!.id;

    const connection = new SupportConnection({
      supporterId,
      supporteeId,
      connectionType: connectionType || 'peer_support',
      supportAreas: supportAreas || [],
      matchingScore: 0.8, // Would be calculated properly
      matchingFactors: {
        locationProximity: 0.8,
        experienceSimilarity: 0.7,
        availabilityMatch: 0.9,
        personalityMatch: 0.6,
        supportNeedsAlignment: 0.9
      }
    });

    await connection.save();
    
    res.status(201).json(successResponse(connection, 'Support connection created successfully'));
  } catch (error) {
    console.error('Error creating support connection:', error);
    res.status(500).json(errorResponse('Failed to create support connection'));
  }
});

// Get user's support connections
router.get('/support-connections', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const connections = await SupportConnection.find({
      $or: [{ supporterId: userId }, { supporteeId: userId }],
      status: { $in: ['pending', 'active'] }
    }).populate('supporterId supporteeId', 'firstName lastName');
    
    res.json(successResponse(connections, 'Support connections retrieved successfully'));
  } catch (error) {
    console.error('Error getting support connections:', error);
    res.status(500).json(errorResponse('Failed to retrieve support connections'));
  }
});

// Update support connection status
router.patch('/support-connection/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    const connection = await SupportConnection.findOne({
      _id: id,
      $or: [{ supporterId: userId }, { supporteeId: userId }]
    });

    if (!connection) {
      return res.status(404).json(errorResponse('Support connection not found'));
    }

    connection.status = status;
    await connection.save();
    
    res.json(successResponse(connection, 'Support connection updated successfully'));
  } catch (error) {
    console.error('Error updating support connection:', error);
    res.status(500).json(errorResponse('Failed to update support connection'));
  }
});

// Get peer support chats
router.get('/peer-chats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const chats = await PeerSupportChat.find({
      'participants.userId': userId,
      isActive: true
    }).sort({ lastActivity: -1 });
    
    res.json(successResponse(chats, 'Peer support chats retrieved successfully'));
  } catch (error) {
    console.error('Error getting peer support chats:', error);
    res.status(500).json(errorResponse('Failed to retrieve peer support chats'));
  }
});

// Create peer support chat
router.post('/peer-chat', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { connectionId, chatType } = req.body;
    const userId = req.user!.id;

    // Verify user is part of the connection
    const connection = await SupportConnection.findOne({
      _id: connectionId,
      $or: [{ supporterId: userId }, { supporteeId: userId }],
      status: 'active'
    });

    if (!connection) {
      return res.status(404).json(errorResponse('Support connection not found or not active'));
    }

    const chat = new PeerSupportChat({
      connectionId,
      participants: [
        {
          userId: connection.supporterId,
          alias: connection.anonymousIds?.supporterAlias || 'Supporter',
          joinedAt: new Date(),
          lastSeen: new Date(),
          isActive: true
        },
        {
          userId: connection.supporteeId,
          alias: connection.anonymousIds?.supporteeAlias || 'Member',
          joinedAt: new Date(),
          lastSeen: new Date(),
          isActive: true
        }
      ],
      chatType: chatType || 'one_on_one',
      isAnonymous: connection.isAnonymous
    });

    await chat.save();
    
    res.status(201).json(successResponse(chat, 'Peer support chat created successfully'));
  } catch (error) {
    console.error('Error creating peer support chat:', error);
    res.status(500).json(errorResponse('Failed to create peer support chat'));
  }
});

// Get crisis resources (immediate access, no auth required for emergency)
router.get('/crisis-resources', async (req: Request, res: Response) => {
  try {
    const state = req.query.state as string || 'NSW';
    
    const crisisResources = await MentalHealthResource.find({
      category: 'crisis',
      $or: [
        { 'location.state': state },
        { 'location.isNational': true }
      ],
      'availability.is24x7': true
    }).sort({ rating: -1 }).limit(10);
    
    res.json(successResponse(crisisResources, 'Crisis resources retrieved successfully'));
  } catch (error) {
    console.error('Error getting crisis resources:', error);
    res.status(500).json(errorResponse('Failed to retrieve crisis resources'));
  }
});

export default router;
