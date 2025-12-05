// @ts-nocheck
import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import EmergencyAlert from '../models/EmergencyAlert';
import EmergencyService from '../services/emergencyService';
import Joi from 'joi';

const router = Router();

// Validation schemas
const alertQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  radius: Joi.number().min(1).max(500).default(50),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical'),
  type: Joi.string().valid('weather', 'fire', 'flood', 'medical', 'security', 'infrastructure', 'community'),
  limit: Joi.number().min(1).max(100).default(20)
});

const reportSchema = Joi.object({
  title: Joi.string().required().max(200),
  description: Joi.string().required().max(2000),
  type: Joi.string().required().valid('weather', 'fire', 'flood', 'medical', 'security', 'infrastructure', 'community'),
  severity: Joi.string().required().valid('low', 'medium', 'high', 'critical'),
  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    description: Joi.string().required().max(500)
  }).required(),
  images: Joi.array().items(Joi.string().uri())
});

const responseSchema = Joi.object({
  responseType: Joi.string().required().valid('acknowledged', 'safe', 'need_help', 'false_alarm'),
  message: Joi.string().max(500),
  location: Joi.array().items(Joi.number()).length(2)
});

// Get emergency alerts
router.get('/alerts', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = alertQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.details
      });
    }

    const { lat, lng, radius, severity, type, limit } = value;
    const emergencyService = req.app.locals.emergencyService as EmergencyService;

    let alerts;
    if (lat && lng) {
      // Get alerts for specific location
      alerts = await emergencyService.getActiveAlerts([lng, lat], radius);
    } else {
      // Get general alerts
      const query: any = { isActive: true, status: 'active' };
      if (severity) query.severity = severity;
      if (type) query.type = type;

      alerts = await EmergencyAlert.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit);
    }

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching emergency alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency alerts'
    });
  }
});

// Report emergency
router.post('/report', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = reportSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report data',
        errors: error.details
      });
    }

    const emergencyService = req.app.locals.emergencyService as EmergencyService;
    const alert = await emergencyService.reportEmergency(req.user!.id, value);

    res.status(201).json({
      success: true,
      message: 'Emergency report submitted successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error reporting emergency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit emergency report'
    });
  }
});

// Respond to alert
router.post('/alerts/:alertId/respond', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = responseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid response data',
        errors: error.details
      });
    }

    const emergencyService = req.app.locals.emergencyService as EmergencyService;
    await emergencyService.respondToAlert(req.params.alertId, req.user!.id, value);

    res.json({
      success: true,
      message: 'Response recorded successfully'
    });
  } catch (error) {
    console.error('Error responding to alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record response'
    });
  }
});

// Get emergency response coordination
router.get('/response/:alertId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const emergencyService = req.app.locals.emergencyService as EmergencyService;
    const coordination = await emergencyService.coordinateResponse(req.params.alertId);

    res.json({
      success: true,
      data: coordination
    });
  } catch (error) {
    console.error('Error getting emergency coordination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get emergency coordination'
    });
  }
});

// Get alert details
router.get('/alerts/:alertId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.alertId)
      .populate('source.reportedBy', 'name')
      .populate('responses.userId', 'name');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error fetching alert details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert details'
    });
  }
});

// Admin: Create official alert
router.post('/official', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // This would typically require admin permissions
    // For now, any authenticated user can create official alerts for testing
    
    const alertData = {
      ...req.body,
      source: {
        type: 'official',
        organization: req.body.organization || 'Local Authority',
        verificationStatus: 'verified'
      }
    };

    const emergencyService = req.app.locals.emergencyService as EmergencyService;
    const alert = await emergencyService.createAlert(alertData);

    res.status(201).json({
      success: true,
      message: 'Official alert created successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error creating official alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create official alert'
    });
  }
});

export default router;
