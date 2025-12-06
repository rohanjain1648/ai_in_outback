import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
// import locationRoutes from './location';
import communityRoutes from './community';
import resourceRoutes from './resources';
import agricultureRoutes from './agriculture';
import emergencyRoutes from './emergency';
import businessRoutes from './business';
import cultureRoutes from './culture';
import skillsRoutes from './skills';
import wellbeingRoutes from './wellbeing';
import healthRoutes from './health';
import chatRoutes from './chat';
import gigsRoutes from './gigs';
import servicesRoutes from './services';
import blockchainRoutes from './blockchain';
import avatarsRoutes from './avatars';

const router = Router();

// API version prefix
const API_VERSION = '/api/v1';

// Health check route (outside of API versioning)
router.use('/health', healthRoutes);

// Authentication routes
router.use(`${API_VERSION}/auth`, authRoutes);

// User management routes
router.use(`${API_VERSION}/users`, userRoutes);

// Location and geolocation routes
// router.use(`${API_VERSION}/location`, locationRoutes);

// Community matching and networking routes
router.use(`${API_VERSION}/community`, communityRoutes);

// Resource discovery routes
router.use(`${API_VERSION}/resources`, resourceRoutes);

// Agricultural intelligence routes
router.use(`${API_VERSION}/agriculture`, agricultureRoutes);

// Emergency alert and response routes
router.use(`${API_VERSION}/emergency`, emergencyRoutes);

// Local business directory routes
router.use(`${API_VERSION}/business`, businessRoutes);

// Cultural heritage and storytelling routes
router.use(`${API_VERSION}/culture`, cultureRoutes);

// Skills sharing and learning routes
router.use(`${API_VERSION}/skills`, skillsRoutes);

// Mental health and wellbeing routes
router.use(`${API_VERSION}/wellbeing`, wellbeingRoutes);

// Chat and messaging routes
router.use(`${API_VERSION}/chat`, chatRoutes);

// Gig economy micro-job routes
router.use(`${API_VERSION}/gigs`, gigsRoutes);

// Service directory routes
router.use(`${API_VERSION}/services`, servicesRoutes);

// Blockchain trust and credentials routes
router.use(`${API_VERSION}/blockchain`, blockchainRoutes);

// Spirit avatar generation routes
router.use(`${API_VERSION}/avatars`, avatarsRoutes);

// API documentation route
router.get(`${API_VERSION}`, (req, res) => {
  res.json({
    success: true,
    message: 'Rural Connect AI API v1',
    version: '1.0.0',
    endpoints: {
      auth: `${API_VERSION}/auth`,
      users: `${API_VERSION}/users`,
      location: `${API_VERSION}/location`,
      community: `${API_VERSION}/community`,
      resources: `${API_VERSION}/resources`,
      agriculture: `${API_VERSION}/agriculture`,
      emergency: `${API_VERSION}/emergency`,
      business: `${API_VERSION}/business`,
      culture: `${API_VERSION}/culture`,
      skills: `${API_VERSION}/skills`,
      wellbeing: `${API_VERSION}/wellbeing`,
      chat: `${API_VERSION}/chat`,
      gigs: `${API_VERSION}/gigs`,
      services: `${API_VERSION}/services`,
      blockchain: `${API_VERSION}/blockchain`,
      avatars: `${API_VERSION}/avatars`,
    },
    documentation: 'https://docs.ruralconnectai.com',
  });
});

// Catch-all route for undefined API endpoints
router.use(`${API_VERSION}/*`, (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

export default router;