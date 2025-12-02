import Joi from 'joi';

// Registration validation schema
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  profile: Joi.object({
    firstName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'First name is required',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required',
      }),
    lastName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Last name is required',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required',
      }),
    displayName: Joi.string()
      .trim()
      .max(50)
      .optional(),
    bio: Joi.string()
      .max(500)
      .optional(),
    dateOfBirth: Joi.date()
      .max('now')
      .optional(),
    gender: Joi.string()
      .valid('male', 'female', 'other', 'prefer-not-to-say')
      .optional(),
    occupation: Joi.string()
      .max(100)
      .optional(),
    farmType: Joi.string()
      .max(100)
      .optional(),
    businessType: Joi.string()
      .max(100)
      .optional(),
    yearsInArea: Joi.number()
      .min(0)
      .max(100)
      .optional(),
    familySize: Joi.number()
      .min(0)
      .max(20)
      .optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      relationship: Joi.string().required(),
    }).optional(),
  }).required(),
  location: Joi.object({
    coordinates: Joi.array()
      .items(Joi.number())
      .length(2)
      .required(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    postcode: Joi.string().optional(),
    region: Joi.string().optional(),
  }).optional(),
});

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// Profile update validation schema
export const updateProfileSchema = Joi.object({
  profile: Joi.object({
    firstName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional(),
    lastName: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional(),
    displayName: Joi.string()
      .trim()
      .max(50)
      .optional(),
    bio: Joi.string()
      .max(500)
      .optional(),
    avatar: Joi.string()
      .uri()
      .optional(),
    dateOfBirth: Joi.date()
      .max('now')
      .optional(),
    gender: Joi.string()
      .valid('male', 'female', 'other', 'prefer-not-to-say')
      .optional(),
    occupation: Joi.string()
      .max(100)
      .optional(),
    farmType: Joi.string()
      .max(100)
      .optional(),
    businessType: Joi.string()
      .max(100)
      .optional(),
    yearsInArea: Joi.number()
      .min(0)
      .max(100)
      .optional(),
    familySize: Joi.number()
      .min(0)
      .max(20)
      .optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      relationship: Joi.string().required(),
    }).optional(),
  }).optional(),
  location: Joi.object({
    coordinates: Joi.array()
      .items(Joi.number())
      .length(2)
      .required(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    postcode: Joi.string().optional(),
    region: Joi.string().optional(),
  }).optional(),
  preferences: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      emergency: Joi.boolean().optional(),
      community: Joi.boolean().optional(),
      agricultural: Joi.boolean().optional(),
      business: Joi.boolean().optional(),
      cultural: Joi.boolean().optional(),
      skills: Joi.boolean().optional(),
      wellbeing: Joi.boolean().optional(),
    }).optional(),
    privacy: Joi.object({
      showLocation: Joi.boolean().optional(),
      showProfile: Joi.boolean().optional(),
      allowMatching: Joi.boolean().optional(),
      shareSkills: Joi.boolean().optional(),
    }).optional(),
    interests: Joi.array()
      .items(Joi.string())
      .optional(),
    skills: Joi.array()
      .items(Joi.string())
      .optional(),
    languages: Joi.array()
      .items(Joi.string())
      .optional(),
    accessibility: Joi.object({
      screenReader: Joi.boolean().optional(),
      highContrast: Joi.boolean().optional(),
      largeText: Joi.boolean().optional(),
      reducedMotion: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
});

// Password change validation schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

// Password reset request validation schema
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

// Password reset validation schema
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required',
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
});

// Email verification validation schema
export const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Verification token is required',
    }),
});