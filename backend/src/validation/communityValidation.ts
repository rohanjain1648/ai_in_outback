import Joi from 'joi';

export const createCommunityMemberSchema = Joi.object({
  skills: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().min(1).max(100),
      level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').required(),
      yearsExperience: Joi.number().min(0).max(100).optional(),
      canTeach: Joi.boolean().required(),
      wantsToLearn: Joi.boolean().required(),
      category: Joi.string().valid(
        'agricultural', 'technical', 'creative', 'business', 
        'health', 'education', 'trades', 'other'
      ).required(),
    })
  ).min(1).required(),

  interests: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().min(1).max(100),
      category: Joi.string().valid(
        'agriculture', 'technology', 'arts', 'sports', 'community', 
        'environment', 'business', 'health', 'education', 'other'
      ).required(),
      intensity: Joi.string().valid('casual', 'moderate', 'passionate').default('moderate'),
    })
  ).min(1).required(),

  availability: Joi.object({
    timeSlots: Joi.array().items(
      Joi.object({
        day: Joi.string().valid(
          'monday', 'tuesday', 'wednesday', 'thursday', 
          'friday', 'saturday', 'sunday'
        ).required(),
        startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      })
    ).min(1).required(),
    timezone: Joi.string().required(),
    preferredMeetingTypes: Joi.array().items(
      Joi.string().valid('in-person', 'video-call', 'phone-call', 'text-chat')
    ).min(1).required(),
    maxTravelDistance: Joi.number().min(0).max(1000).optional(),
    responseTime: Joi.string().valid(
      'immediate', 'within-hour', 'within-day', 'within-week'
    ).default('within-day'),
  }).required(),

  matchingPreferences: Joi.object({
    ageRange: Joi.object({
      min: Joi.number().min(18).max(100).required(),
      max: Joi.number().min(18).max(100).required(),
    }).optional(),
    genderPreference: Joi.array().items(
      Joi.string().valid('male', 'female', 'other', 'any')
    ).optional(),
    maxDistance: Joi.number().min(1).max(1000).required(),
    preferredSkillLevels: Joi.array().items(
      Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert')
    ).min(1).required(),
    priorityCategories: Joi.array().items(Joi.string()).required(),
    excludeCategories: Joi.array().items(Joi.string()).optional(),
    requireMutualInterests: Joi.boolean().default(false),
    minimumSharedInterests: Joi.number().min(0).max(10).default(1),
  }).required(),
});

export const updateAvailabilitySchema = Joi.object({
  timeSlots: Joi.array().items(
    Joi.object({
      day: Joi.string().valid(
        'monday', 'tuesday', 'wednesday', 'thursday', 
        'friday', 'saturday', 'sunday'
      ).required(),
      startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    })
  ).min(1).required(),
  timezone: Joi.string().required(),
  preferredMeetingTypes: Joi.array().items(
    Joi.string().valid('in-person', 'video-call', 'phone-call', 'text-chat')
  ).min(1).required(),
  maxTravelDistance: Joi.number().min(0).max(1000).optional(),
  responseTime: Joi.string().valid(
    'immediate', 'within-hour', 'within-day', 'within-week'
  ).required(),
});

export const updateMatchingPreferencesSchema = Joi.object({
  ageRange: Joi.object({
    min: Joi.number().min(18).max(100).required(),
    max: Joi.number().min(18).max(100).required(),
  }).optional(),
  genderPreference: Joi.array().items(
    Joi.string().valid('male', 'female', 'other', 'any')
  ).optional(),
  maxDistance: Joi.number().min(1).max(1000).optional(),
  preferredSkillLevels: Joi.array().items(
    Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert')
  ).optional(),
  priorityCategories: Joi.array().items(Joi.string()).optional(),
  excludeCategories: Joi.array().items(Joi.string()).optional(),
  requireMutualInterests: Joi.boolean().optional(),
  minimumSharedInterests: Joi.number().min(0).max(10).optional(),
});

export const connectMemberSchema = Joi.object({
  connectionType: Joi.string().valid('matched', 'requested', 'mutual').default('requested'),
});

export const matchingFiltersSchema = Joi.object({
  maxDistance: Joi.number().min(1).max(1000).optional(),
  skillCategories: Joi.string().optional(), // Comma-separated string
  interestCategories: Joi.string().optional(), // Comma-separated string
  skillLevels: Joi.string().optional(), // Comma-separated string
  availabilityTypes: Joi.string().optional(), // Comma-separated string
  minAge: Joi.number().min(18).max(100).optional(),
  maxAge: Joi.number().min(18).max(100).optional(),
  genderPreference: Joi.string().optional(), // Comma-separated string
  communicationStyles: Joi.string().optional(), // Comma-separated string
  minMatchingScore: Joi.number().min(0).max(100).optional(),
  limit: Joi.number().min(1).max(50).default(20),
});

// Validation middleware
export const validateCommunityMember = (req: any, res: any, next: any) => {
  const { error } = createCommunityMemberSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  next();
};

export const validateAvailability = (req: any, res: any, next: any) => {
  const { error } = updateAvailabilitySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  next();
};

export const validateMatchingPreferences = (req: any, res: any, next: any) => {
  const { error } = updateMatchingPreferencesSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  next();
};

export const validateConnectMember = (req: any, res: any, next: any) => {
  const { error } = connectMemberSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  next();
};

export const validateMatchingFilters = (req: any, res: any, next: any) => {
  const { error } = matchingFiltersSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  next();
};