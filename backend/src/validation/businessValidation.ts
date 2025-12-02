import Joi from 'joi';

export const createBusinessSchema = Joi.object({
  name: Joi.string().required().min(2).max(100).trim(),
  description: Joi.string().required().min(10).max(1000),
  category: Joi.string().required().valid(
    'Agriculture',
    'Food & Beverage',
    'Healthcare',
    'Education',
    'Technology',
    'Construction',
    'Transport',
    'Tourism',
    'Retail',
    'Professional Services',
    'Manufacturing',
    'Energy',
    'Finance',
    'Other'
  ),
  subcategory: Joi.string().required().min(2).max(50),
  services: Joi.array().items(Joi.string().trim().max(50)).min(1).max(20),
  capabilities: Joi.array().items(Joi.string().trim().max(50)).max(20),
  location: Joi.object({
    address: Joi.string().required().min(5).max(200),
    suburb: Joi.string().required().min(2).max(50),
    state: Joi.string().required().valid('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'),
    postcode: Joi.string().required().pattern(/^\d{4}$/),
    coordinates: Joi.object({
      latitude: Joi.number().required().min(-90).max(90),
      longitude: Joi.number().required().min(-180).max(180)
    }).required()
  }).required(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^(\+61|0)[2-9]\d{8}$/),
    email: Joi.string().email(),
    website: Joi.string().uri(),
    socialMedia: Joi.object({
      facebook: Joi.string().uri(),
      instagram: Joi.string().uri(),
      linkedin: Joi.string().uri()
    })
  }),
  businessHours: Joi.object({
    monday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    tuesday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    wednesday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    thursday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    friday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    saturday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    sunday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    })
  }),
  economicData: Joi.object({
    employeeCount: Joi.number().integer().min(0).max(10000),
    annualRevenue: Joi.string().valid(
      'under-50k',
      '50k-100k',
      '100k-250k',
      '250k-500k',
      '500k-1m',
      '1m-5m',
      'over-5m'
    ),
    establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
    businessType: Joi.string().required().valid('sole-trader', 'partnership', 'company', 'trust')
  }).required(),
  verification: Joi.object({
    abn: Joi.string().pattern(/^\d{11}$/),
    acn: Joi.string().pattern(/^\d{9}$/)
  }),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10)
});

export const updateBusinessSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  description: Joi.string().min(10).max(1000),
  category: Joi.string().valid(
    'Agriculture',
    'Food & Beverage',
    'Healthcare',
    'Education',
    'Technology',
    'Construction',
    'Transport',
    'Tourism',
    'Retail',
    'Professional Services',
    'Manufacturing',
    'Energy',
    'Finance',
    'Other'
  ),
  subcategory: Joi.string().min(2).max(50),
  services: Joi.array().items(Joi.string().trim().max(50)).min(1).max(20),
  capabilities: Joi.array().items(Joi.string().trim().max(50)).max(20),
  location: Joi.object({
    address: Joi.string().min(5).max(200),
    suburb: Joi.string().min(2).max(50),
    state: Joi.string().valid('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'),
    postcode: Joi.string().pattern(/^\d{4}$/),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    })
  }),
  contact: Joi.object({
    phone: Joi.string().pattern(/^(\+61|0)[2-9]\d{8}$/),
    email: Joi.string().email(),
    website: Joi.string().uri(),
    socialMedia: Joi.object({
      facebook: Joi.string().uri(),
      instagram: Joi.string().uri(),
      linkedin: Joi.string().uri()
    })
  }),
  businessHours: Joi.object({
    monday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    tuesday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    wednesday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    thursday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    friday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    saturday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    }),
    sunday: Joi.object({
      open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      closed: Joi.boolean()
    })
  }),
  economicData: Joi.object({
    employeeCount: Joi.number().integer().min(0).max(10000),
    annualRevenue: Joi.string().valid(
      'under-50k',
      '50k-100k',
      '100k-250k',
      '250k-500k',
      '500k-1m',
      '1m-5m',
      'over-5m'
    ),
    establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
    businessType: Joi.string().valid('sole-trader', 'partnership', 'company', 'trust')
  }),
  verification: Joi.object({
    abn: Joi.string().pattern(/^\d{11}$/),
    acn: Joi.string().pattern(/^\d{9}$/)
  }),
  tags: Joi.array().items(Joi.string().trim().max(30)).max(10)
});

export const businessSearchSchema = Joi.object({
  category: Joi.string(),
  subcategory: Joi.string(),
  services: Joi.array().items(Joi.string()),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    radius: Joi.number().min(1).max(500)
  }),
  rating: Joi.number().min(1).max(5),
  verified: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
  businessType: Joi.string().valid('sole-trader', 'partnership', 'company', 'trust'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20)
});

export const businessReviewSchema = Joi.object({
  business: Joi.string().required(),
  rating: Joi.number().required().min(1).max(5),
  title: Joi.string().required().min(5).max(100).trim(),
  comment: Joi.string().required().min(10).max(1000)
});

export const businessMatchingSchema = Joi.object({
  businessId: Joi.string().required(),
  lookingFor: Joi.array().items(Joi.string().trim()).min(1).max(10).required(),
  offering: Joi.array().items(Joi.string().trim()).min(1).max(10).required(),
  preferredLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    radius: Joi.number().min(1).max(500)
  })
});