import Joi from 'joi';

export const createStorySchema = Joi.object({
  title: Joi.string().required().min(3).max(200).messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 200 characters'
  }),
  
  content: Joi.string().required().min(50).messages({
    'string.empty': 'Story content is required',
    'string.min': 'Story content must be at least 50 characters long'
  }),
  
  summary: Joi.string().max(500).messages({
    'string.max': 'Summary cannot exceed 500 characters'
  }),
  
  category: Joi.string()
    .valid('traditional', 'historical', 'personal', 'community', 'legend', 'contemporary')
    .required()
    .messages({
      'any.only': 'Category must be one of: traditional, historical, personal, community, legend, contemporary',
      'any.required': 'Category is required'
    }),
  
  tags: Joi.array().items(
    Joi.string().max(50).pattern(/^[a-zA-Z0-9\s\-_]+$/).messages({
      'string.max': 'Each tag cannot exceed 50 characters',
      'string.pattern.base': 'Tags can only contain letters, numbers, spaces, hyphens, and underscores'
    })
  ).max(20).messages({
    'array.max': 'Cannot have more than 20 tags'
  }),
  
  location: Joi.object({
    coordinates: Joi.array()
      .items(Joi.number().min(-180).max(180))
      .length(2)
      .required()
      .messages({
        'array.length': 'Coordinates must contain exactly 2 numbers [longitude, latitude]',
        'number.min': 'Coordinates must be between -180 and 180',
        'number.max': 'Coordinates must be between -180 and 180'
      }),
    region: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Region is required',
      'string.min': 'Region must be at least 2 characters long',
      'string.max': 'Region cannot exceed 100 characters'
    }),
    specificPlace: Joi.string().max(200).messages({
      'string.max': 'Specific place cannot exceed 200 characters'
    })
  }).required(),
  
  timeframe: Joi.object({
    period: Joi.string().max(100).messages({
      'string.max': 'Period cannot exceed 100 characters'
    }),
    specificDate: Joi.date().max('now').messages({
      'date.max': 'Specific date cannot be in the future'
    }),
    isOngoing: Joi.boolean()
  }),
  
  relatedPeople: Joi.array().items(
    Joi.string().max(100).messages({
      'string.max': 'Person name cannot exceed 100 characters'
    })
  ).max(50).messages({
    'array.max': 'Cannot have more than 50 related people'
  }),
  
  relatedEvents: Joi.array().items(
    Joi.string().max(200).messages({
      'string.max': 'Event name cannot exceed 200 characters'
    })
  ).max(20).messages({
    'array.max': 'Cannot have more than 20 related events'
  }),
  
  visibility: Joi.string()
    .valid('public', 'community', 'private')
    .default('public')
    .messages({
      'any.only': 'Visibility must be one of: public, community, private'
    }),
  
  culturalSignificance: Joi.string()
    .valid('high', 'medium', 'low')
    .default('medium')
    .messages({
      'any.only': 'Cultural significance must be one of: high, medium, low'
    })
});

export const updateStorySchema = Joi.object({
  title: Joi.string().min(3).max(200).messages({
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 200 characters'
  }),
  
  content: Joi.string().min(50).messages({
    'string.min': 'Story content must be at least 50 characters long'
  }),
  
  summary: Joi.string().max(500).messages({
    'string.max': 'Summary cannot exceed 500 characters'
  }),
  
  category: Joi.string()
    .valid('traditional', 'historical', 'personal', 'community', 'legend', 'contemporary')
    .messages({
      'any.only': 'Category must be one of: traditional, historical, personal, community, legend, contemporary'
    }),
  
  tags: Joi.array().items(
    Joi.string().max(50).pattern(/^[a-zA-Z0-9\s\-_]+$/).messages({
      'string.max': 'Each tag cannot exceed 50 characters',
      'string.pattern.base': 'Tags can only contain letters, numbers, spaces, hyphens, and underscores'
    })
  ).max(20).messages({
    'array.max': 'Cannot have more than 20 tags'
  }),
  
  timeframe: Joi.object({
    period: Joi.string().max(100).messages({
      'string.max': 'Period cannot exceed 100 characters'
    }),
    specificDate: Joi.date().max('now').messages({
      'date.max': 'Specific date cannot be in the future'
    }),
    isOngoing: Joi.boolean()
  }),
  
  relatedPeople: Joi.array().items(
    Joi.string().max(100).messages({
      'string.max': 'Person name cannot exceed 100 characters'
    })
  ).max(50).messages({
    'array.max': 'Cannot have more than 50 related people'
  }),
  
  relatedEvents: Joi.array().items(
    Joi.string().max(200).messages({
      'string.max': 'Event name cannot exceed 200 characters'
    })
  ).max(20).messages({
    'array.max': 'Cannot have more than 20 related events'
  }),
  
  visibility: Joi.string()
    .valid('public', 'community', 'private')
    .messages({
      'any.only': 'Visibility must be one of: public, community, private'
    }),
  
  culturalSignificance: Joi.string()
    .valid('high', 'medium', 'low')
    .messages({
      'any.only': 'Cultural significance must be one of: high, medium, low'
    })
});

export const commentSchema = Joi.object({
  content: Joi.string().required().min(1).max(1000).messages({
    'string.empty': 'Comment content is required',
    'string.min': 'Comment cannot be empty',
    'string.max': 'Comment cannot exceed 1000 characters'
  })
});

export const connectionSchema = Joi.object({
  storyId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.empty': 'Story ID is required',
    'string.pattern.base': 'Invalid story ID format'
  }),
  
  connectionType: Joi.string()
    .valid('related', 'sequel', 'prequel', 'reference', 'location', 'family')
    .required()
    .messages({
      'any.only': 'Connection type must be one of: related, sequel, prequel, reference, location, family',
      'any.required': 'Connection type is required'
    }),
  
  description: Joi.string().max(500).messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  
  strength: Joi.number().min(0).max(1).default(0.5).messages({
    'number.min': 'Strength must be between 0 and 1',
    'number.max': 'Strength must be between 0 and 1'
  })
});

export const searchQuerySchema = Joi.object({
  q: Joi.string().required().min(1).max(200).messages({
    'string.empty': 'Search query is required',
    'string.min': 'Search query cannot be empty',
    'string.max': 'Search query cannot exceed 200 characters'
  }),
  
  page: Joi.number().integer().min(1).default(1).messages({
    'number.min': 'Page must be at least 1'
  }),
  
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  
  category: Joi.string().valid('traditional', 'historical', 'personal', 'community', 'legend', 'contemporary'),
  
  region: Joi.string().max(100),
  
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  
  culturalSignificance: Joi.string().valid('high', 'medium', 'low'),
  
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  radius: Joi.number().min(0.1).max(1000), // km
  
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref('startDate'))
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.min': 'Page must be at least 1'
  }),
  
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

export const mediaUploadSchema = Joi.object({
  captions: Joi.string().custom((value, helpers) => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        return helpers.error('any.invalid');
      }
      return parsed;
    } catch {
      return helpers.error('any.invalid');
    }
  }).messages({
    'any.invalid': 'Captions must be a valid JSON array'
  })
});