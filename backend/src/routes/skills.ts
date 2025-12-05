// @ts-nocheck
import { Router, Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { skillsService } from '../services/skillsService';
import { skillValidation } from '../validation/skillsValidation';
import { successResponse, errorResponse } from '../utils/response';

const router = Router();

// Skills Management
router.get('/', async (req: Request, res: Response) => {
  try {
    const { error, value } = skillValidation.skillsQuery.validate(req.query);
    if (error) {
      return errorResponse(res, 'Invalid query parameters', 400, error.details);
    }

    const skills = await skillsService.getSkills(value);
    return successResponse(res, 'Skills retrieved successfully', skills);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve skills', 500, error);
  }
});

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = skillValidation.createSkill.validate(req.body);
    if (error) {
      return errorResponse(res, 'Invalid skill data', 400, error.details);
    }

    const skill = await skillsService.createSkill(value);
    return successResponse(res, 'Skill created successfully', skill, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create skill', 500, error);
  }
});

// User Skills Management
router.get('/user/:userId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const userSkills = await skillsService.getUserSkills(userId);
    return successResponse(res, 'User skills retrieved successfully', userSkills);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve user skills', 500, error);
  }
});

router.post('/user', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = skillValidation.addUserSkill.validate(req.body);
    if (error) {
      return errorResponse(res, 'Invalid user skill data', 400, error.details);
    }

    const userSkill = await skillsService.addUserSkill(req.user!.id, value);
    return successResponse(res, 'User skill added successfully', userSkill, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to add user skill', 500, error);
  }
});

router.put('/user/:skillId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { skillId } = req.params;
    const { error, value } = skillValidation.updateUserSkill.validate(req.body);
    if (error) {
      return errorResponse(res, 'Invalid update data', 400, error.details);
    }

    const userSkill = await skillsService.updateUserSkill(req.user!.id, skillId, value);
    if (!userSkill) {
      return errorResponse(res, 'User skill not found', 404);
    }

    return successResponse(res, 'User skill updated successfully', userSkill);
  } catch (error) {
    return errorResponse(res, 'Failed to update user skill', 500, error);
  }
});

// Skills Matching
router.get('/matches', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = skillValidation.matchQuery.validate(req.query);
    if (error) {
      return errorResponse(res, 'Invalid match query', 400, error.details);
    }

    const matches = await skillsService.findSkillMatches(req.user!.id, value.skillId, value.type);
    return successResponse(res, 'Skill matches found successfully', matches);
  } catch (error) {
    return errorResponse(res, 'Failed to find skill matches', 500, error);
  }
});

router.get('/exchange-matches', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = skillValidation.exchangeMatchQuery.validate(req.query);
    if (error) {
      return errorResponse(res, 'Invalid exchange match query', 400, error.details);
    }

    const matches = await skillsService.findSkillExchangeMatches(
      req.user!.id,
      value.offeredSkillId,
      value.requestedSkillId
    );
    return successResponse(res, 'Exchange matches found successfully', matches);
  } catch (error) {
    return errorResponse(res, 'Failed to find exchange matches', 500, error);
  }
});

// Endorsements
router.post('/endorsements', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = skillValidation.createEndorsement.validate(req.body);
    if (error) {
      return errorResponse(res, 'Invalid endorsement data', 400, error.details);
    }

    const endorsement = await skillsService.createEndorsement({
      ...value,
      endorserId: req.user!.id
    });
    return successResponse(res, 'Endorsement created successfully', endorsement, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create endorsement', 500, error);
  }
});

router.get('/endorsements/:userId/:skillId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, skillId } = req.params;
    const endorsements = await skillsService.getSkillEndorsements(userId, skillId);
    return successResponse(res, 'Endorsements retrieved successfully', endorsements);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve endorsements', 500, error);
  }
});

// Learning Sessions
router.post('/sessions', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = skillValidation.createLearningSession.validate(req.body);
    if (error) {
      return errorResponse(res, 'Invalid session data', 400, error.details);
    }

    const session = await skillsService.createLearningSession({
      ...value,
      teacherId: req.user!.id
    });
    return successResponse(res, 'Learning session created successfully', session, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create learning session', 500, error);
  }
});

router.get('/sessions', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.query.role as 'teacher' | 'learner' | 'both' || 'both';
    const sessions = await skillsService.getUserLearningSessions(req.user!.id, role);
    return successResponse(res, 'Learning sessions retrieved successfully', sessions);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve learning sessions', 500, error);
  }
});

router.put('/sessions/:sessionId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { error, value } = skillValidation.updateLearningSession.validate(req.body);
    if (error) {
      return errorResponse(res, 'Invalid update data', 400, error.details);
    }

    const session = await skillsService.updateLearningSession(sessionId, value);
    if (!session) {
      return errorResponse(res, 'Learning session not found', 404);
    }

    return successResponse(res, 'Learning session updated successfully', session);
  } catch (error) {
    return errorResponse(res, 'Failed to update learning session', 500, error);
  }
});

// Skill Exchanges
router.post('/exchanges', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error, value } = skillValidation.createSkillExchange.validate(req.body);
    if (error) {
      return errorResponse(res, 'Invalid exchange data', 400, error.details);
    }

    const exchange = await skillsService.createSkillExchange({
      ...value,
      participantA: req.user!.id
    });
    return successResponse(res, 'Skill exchange created successfully', exchange, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create skill exchange', 500, error);
  }
});

router.get('/exchanges', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const exchanges = await skillsService.getUserSkillExchanges(req.user!.id);
    return successResponse(res, 'Skill exchanges retrieved successfully', exchanges);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve skill exchanges', 500, error);
  }
});

router.put('/exchanges/:exchangeId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { exchangeId } = req.params;
    const { error, value } = skillValidation.updateSkillExchange.validate(req.body);
    if (error) {
      return errorResponse(res, 'Invalid update data', 400, error.details);
    }

    const exchange = await skillsService.updateSkillExchange(exchangeId, value);
    if (!exchange) {
      return errorResponse(res, 'Skill exchange not found', 404);
    }

    return successResponse(res, 'Skill exchange updated successfully', exchange);
  } catch (error) {
    return errorResponse(res, 'Failed to update skill exchange', 500, error);
  }
});

// Reputation and Analytics
router.get('/reputation/:userId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const reputation = await skillsService.getUserSkillReputation(userId);
    return successResponse(res, 'User reputation retrieved successfully', reputation);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve user reputation', 500, error);
  }
});

// Traditional Skills
router.get('/traditional', async (req: Request, res: Response) => {
  try {
    const traditionalSkills = await skillsService.getTraditionalSkills();
    return successResponse(res, 'Traditional skills retrieved successfully', traditionalSkills);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve traditional skills', 500, error);
  }
});

router.get('/traditional/experts', async (req: Request, res: Response) => {
  try {
    const experts = await skillsService.getTraditionalSkillExperts();
    return successResponse(res, 'Traditional skill experts retrieved successfully', experts);
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve traditional skill experts', 500, error);
  }
});

export default router;