/**
 * Input Validation and Sanitization Utilities
 * Provides comprehensive validation and sanitization for all form inputs
 */

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    email?: boolean;
    url?: boolean;
    phone?: boolean;
    postcode?: boolean;
    custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    sanitizedValue?: any;
}

/**
 * Validate a single value against rules
 */
export function validateValue(
    value: any,
    rules: ValidationRule,
    fieldName: string = 'Field'
): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = value;

    // Required check
    if (rules.required && (value === null || value === undefined || value === '')) {
        errors.push(`${fieldName} is required`);
        return { isValid: false, errors };
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === null || value === undefined || value === '')) {
        return { isValid: true, errors: [], sanitizedValue: value };
    }

    // String validations
    if (typeof value === 'string') {
        sanitizedValue = sanitizeString(value);

        if (rules.minLength && sanitizedValue.length < rules.minLength) {
            errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
            errors.push(`${fieldName} must not exceed ${rules.maxLength} characters`);
        }

        if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
            errors.push(`${fieldName} format is invalid`);
        }

        if (rules.email && !isValidEmail(sanitizedValue)) {
            errors.push(`${fieldName} must be a valid email address`);
        }

        if (rules.url && !isValidUrl(sanitizedValue)) {
            errors.push(`${fieldName} must be a valid URL`);
        }

        if (rules.phone && !isValidAustralianPhone(sanitizedValue)) {
            errors.push(`${fieldName} must be a valid Australian phone number`);
        }

        if (rules.postcode && !isValidAustralianPostcode(sanitizedValue)) {
            errors.push(`${fieldName} must be a valid Australian postcode`);
        }
    }

    // Number validations
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
        const numValue = typeof value === 'number' ? value : Number(value);

        if (rules.min !== undefined && numValue < rules.min) {
            errors.push(`${fieldName} must be at least ${rules.min}`);
        }

        if (rules.max !== undefined && numValue > rules.max) {
            errors.push(`${fieldName} must not exceed ${rules.max}`);
        }

        sanitizedValue = numValue;
    }

    // Custom validation
    if (rules.custom) {
        const customResult = rules.custom(sanitizedValue);
        if (customResult !== true) {
            errors.push(typeof customResult === 'string' ? customResult : `${fieldName} is invalid`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue
    };
}

/**
 * Validate multiple fields
 */
export function validateForm(
    data: Record<string, any>,
    rules: Record<string, ValidationRule>
): { isValid: boolean; errors: Record<string, string[]>; sanitizedData: Record<string, any> } {
    const errors: Record<string, string[]> = {};
    const sanitizedData: Record<string, any> = {};
    let isValid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
        const result = validateValue(data[field], fieldRules, field);

        if (!result.isValid) {
            errors[field] = result.errors;
            isValid = false;
        }

        sanitizedData[field] = result.sanitizedValue;
    }

    return { isValid, errors, sanitizedData };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate Australian phone number
 */
export function isValidAustralianPhone(phone: string): boolean {
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Australian phone patterns:
    // Mobile: 04XX XXX XXX (10 digits starting with 04)
    // Landline: 0X XXXX XXXX (10 digits starting with 02, 03, 07, 08)
    // International: +61 X XXXX XXXX
    const patterns = [
        /^04\d{8}$/, // Mobile
        /^0[2378]\d{8}$/, // Landline
        /^\+614\d{8}$/, // International mobile
        /^\+61[2378]\d{8}$/ // International landline
    ];

    return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Validate Australian postcode
 */
export function isValidAustralianPostcode(postcode: string): boolean {
    const cleaned = postcode.trim();
    return /^\d{4}$/.test(cleaned);
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180 &&
        !isNaN(lat) &&
        !isNaN(lng)
    );
}

/**
 * Validate Australian coordinates
 */
export function isValidAustralianCoordinates(lat: number, lng: number): boolean {
    return (
        isValidCoordinates(lat, lng) &&
        lat >= -44 &&
        lat <= -10 &&
        lng >= 113 &&
        lng <= 154
    );
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 255);
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
        if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return file.type.startsWith(category + '/');
        }
        return file.type === type;
    });
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
}

/**
 * Sanitize object for API submission
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
            continue;
        }

        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'string' ? sanitizeString(item) :
                    typeof item === 'object' ? sanitizeObject(item) :
                        item
            );
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Escape special characters for regex
 */
export function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Password should be at least 8 characters');

    if (password.length >= 12) score++;

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Include special characters');

    return {
        isStrong: score >= 4,
        score,
        feedback
    };
}

/**
 * Check for SQL injection patterns
 */
export function containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(--|;|\/\*|\*\/)/,
        /(\bOR\b.*=.*)/i,
        /(\bAND\b.*=.*)/i,
        /(UNION.*SELECT)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
export function containsXss(input: string): boolean {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
}

export default {
    validateValue,
    validateForm,
    sanitizeString,
    sanitizeHtml,
    sanitizeObject,
    isValidEmail,
    isValidUrl,
    isValidAustralianPhone,
    isValidAustralianPostcode,
    isValidCoordinates,
    isValidAustralianCoordinates,
    sanitizeFilename,
    isValidFileType,
    isValidFileSize,
    validatePasswordStrength,
    containsSqlInjection,
    containsXss,
    escapeRegex
};
