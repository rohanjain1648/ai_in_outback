// @ts-nocheck
import { Router, Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { agriculturalService } from '../services/agriculturalService';
import { successResponse, errorResponse } from '../utils/response';
import Joi from 'joi';

const router = Router();

// Validation schemas
const farmSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.object({
    address: Joi.string().required(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required(),
    postcode: Joi.string().required(),
    state: Joi.string().required()
  }).required(),
  totalArea: Joi.number().min(0).required(),
  farmType: Joi.string().required(),
  crops: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    variety: Joi.string().required(),
    plantingDate: Joi.date().required(),
    expectedHarvestDate: Joi.date().required(),
    area: Joi.number().min(0).required(),
    status: Joi.string().valid('planted', 'growing', 'flowering', 'harvesting', 'harvested'),
    notes: Joi.string().optional()
  })).default([]),
  livestock: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    breed: Joi.string().required(),
    count: Joi.number().min(0).required(),
    age: Joi.string().optional(),
    healthStatus: Joi.string().valid('healthy', 'sick', 'recovering', 'quarantined').default('healthy'),
    notes: Joi.string().optional()
  })).default([]),
  equipment: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    model: Joi.string().optional(),
    purchaseDate: Joi.date().optional(),
    condition: Joi.string().valid('excellent', 'good', 'fair', 'poor', 'needs_repair').default('good'),
    maintenanceSchedule: Joi.date().optional(),
    notes: Joi.string().optional()
  })).default([]),
  soilType: Joi.string().optional(),
  irrigationType: Joi.string().optional(),
  organicCertified: Joi.boolean().default(false)
});

const cropAnalysisSchema = Joi.object({
  farmId: Joi.string().required(),
  cropName: Joi.string().required(),
  photoUrl: Joi.string().uri().required(),
  metadata: Joi.object({
    captureDate: Joi.date().optional(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    }).optional(),
    weather: Joi.object({
      temperature: Joi.number(),
      humidity: Joi.number(),
      rainfall: Joi.number()
    }).optional(),
    plantingDate: Joi.date().optional()
  }).default({})
});

// Get farm dashboard data
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dashboardData = await agriculturalService.getFarmDashboard(req.user!.id);
    res.json(successResponse(dashboardData, 'Farm dashboard data retrieved successfully'));
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json(errorResponse('Failed to retrieve farm dashboard data'));
  }
});

// Create or update farm profile
router.post('/farm', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = farmSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const farm = await agriculturalService.createOrUpdateFarm(req.user!.id, value);
    res.json(successResponse(farm, 'Farm profile saved successfully'));
  } catch (error) {
    console.error('Farm creation error:', error);
    res.status(500).json(errorResponse('Failed to save farm profile'));
  }
});

// Analyze crop photos
router.post('/analyze-crop', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = cropAnalysisSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const analysis = await agriculturalService.analyzeCropPhoto(
      value.farmId,
      value.cropName,
      value.photoUrl,
      value.metadata
    );

    res.json(successResponse(analysis, 'Crop analysis completed successfully'));
  } catch (error) {
    console.error('Crop analysis error:', error);
    res.status(500).json(errorResponse('Failed to analyze crop photo'));
  }
});

// Get crop analysis history
router.get('/crop-analysis/:farmId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmId } = req.params;
    const { cropName } = req.query;

    const history = await agriculturalService.getCropAnalysisHistory(
      farmId,
      cropName as string
    );

    res.json(successResponse(history, 'Crop analysis history retrieved successfully'));
  } catch (error) {
    console.error('Crop analysis history error:', error);
    res.status(500).json(errorResponse('Failed to retrieve crop analysis history'));
  }
});

// Get weather data
router.get('/weather', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json(errorResponse('Latitude and longitude are required'));
    }

    const weatherData = await agriculturalService.getWeatherData(
      parseFloat(latitude as string),
      parseFloat(longitude as string)
    );

    res.json(successResponse(weatherData, 'Weather data retrieved successfully'));
  } catch (error) {
    console.error('Weather data error:', error);
    res.status(500).json(errorResponse('Failed to retrieve weather data'));
  }
});

// Get market insights
router.get('/market/:farmId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmId } = req.params;
    const marketInsights = await agriculturalService.getMarketInsights(farmId);
    res.json(successResponse(marketInsights, 'Market insights retrieved successfully'));
  } catch (error) {
    console.error('Market insights error:', error);
    res.status(500).json(errorResponse('Failed to retrieve market insights'));
  }
});

// Get nearby farms
router.get('/nearby-farms', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json(errorResponse('Latitude and longitude are required'));
    }

    const farms = await agriculturalService.getFarmsByLocation(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      radius ? parseFloat(radius as string) : 50
    );

    res.json(successResponse(farms, 'Nearby farms retrieved successfully'));
  } catch (error) {
    console.error('Nearby farms error:', error);
    res.status(500).json(errorResponse('Failed to retrieve nearby farms'));
  }
});

export default router;