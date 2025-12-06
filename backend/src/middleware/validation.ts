// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export interface ValidationOptions {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

// Enhanced request validation middleware
export const validateRequest = (options: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate request body
    if (options.body && req.body) {
      const { error, value } = options.body.validate(req.body, {
        stripUnknown: options.stripUnknown ?? true,
        allowUnknown: options.allowUnknown ?? false,
        abortEarly: false
      });

      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      } else {
        req.body = value;
      }
    }

    // Validate query parameters
    if (options.query && req.query) {
      const { error, value } = options.query.validate(req.query, {
        stripUnknown: options.stripUnknown ?? true,
        allowUnknown: options.allowUnknown ?? false,
        abortEarly: false
      });

      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      } else {
        req.query = value;
      }
    }

    // Validate route parameters
    if (options.params && req.params) {
      const { error, value } = options.params.validate(req.params, {
        stripUnknown: options.stripUnknown ?? true,
        allowUnknown: options.allowUnknown ?? false,
        abortEarly: false
      });

      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      } else {
        req.params = value;
      }
    }

    // Validate headers
    if (options.headers && req.headers) {
      const { error } = options.headers.validate(req.headers, {
        stripUnknown: options.stripUnknown ?? true,
        allowUnknown: options.allowUnknown ?? true,
        abortEarly: false
      });

      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
      return;
    }

    next();
  };
};

// Advanced input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize route parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Input sanitization failed'
    });
  }
};

// Recursive object sanitization
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }

    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
}

// String sanitization with multiple layers of protection
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  // Remove null bytes
  str = str.replace(/\0/g, '');

  // HTML sanitization using DOMPurify
  str = DOMPurify.sanitize(str, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  // Additional XSS prevention
  str = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');

  // SQL injection prevention
  str = str
    .replace(/('|(\\')|(;)|(\\)|(--)|(\s*(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+))/gi, '');

  // NoSQL injection prevention
  str = str.replace(/(\$where|\$ne|\$in|\$nin|\$gt|\$gte|\$lt|\$lte|\$regex|\$exists)/gi, '');

  // Trim whitespace
  str = str.trim();

  return str;
}

// File upload validation
export const validateFileUpload = (options: {
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const files = req.files as Express.Multer.File[] | undefined;
    const file = req.file as Express.Multer.File | undefined;

    const filesToValidate = files || (file ? [file] : []);

    if (filesToValidate.length === 0) {
      next();
      return;
    }

    // Check number of files
    if (options.maxFiles && filesToValidate.length > options.maxFiles) {
      res.status(400).json({
        success: false,
        message: `Maximum ${options.maxFiles} files allowed`
      });
      return;
    }

    // Validate each file
    for (const uploadedFile of filesToValidate) {
      // Check file size
      if (options.maxFileSize && uploadedFile.size > options.maxFileSize) {
        res.status(400).json({
          success: false,
          message: `File size exceeds maximum allowed size of ${options.maxFileSize} bytes`
        });
        return;
      }

      // Check MIME type
      if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(uploadedFile.mimetype)) {
        res.status(400).json({
          success: false,
          message: `File type ${uploadedFile.mimetype} is not allowed`
        });
        return;
      }

      // Validate file name
      if (!isValidFileName(uploadedFile.originalname)) {
        res.status(400).json({
          success: false,
          message: 'Invalid file name'
        });
        return;
      }
    }

    next();
  };
};

// File name validation
function isValidFileName(filename: string): boolean {
  // Check for dangerous file extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh'
  ];

  const lowerFilename = filename.toLowerCase();

  for (const ext of dangerousExtensions) {
    if (lowerFilename.endsWith(ext)) {
      return false;
    }
  }

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Check for null bytes
  if (filename.includes('\0')) {
    return false;
  }

  return true;
}

// Email validation
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email) && !email.includes('<') && !email.includes('>');
};

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
};

// URL validation
export const validateURL = (url: string): boolean => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    allow_underscores: false
  });
};

// MongoDB ObjectId validation
export const validateObjectId = (id: string): boolean => {
  return validator.isMongoId(id);
};