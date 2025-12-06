import Joi from 'joi';

export const issueCredentialSchema = Joi.object({
    credentialType: Joi.string()
        .valid('skill_verification', 'job_completion', 'community_contribution', 'emergency_response')
        .required()
        .messages({
            'any.required': 'Credential type is required',
            'any.only': 'Invalid credential type',
        }),
    metadata: Joi.object({
        title: Joi.string()
            .min(3)
            .max(100)
            .required()
            .messages({
                'string.min': 'Title must be at least 3 characters',
                'string.max': 'Title must not exceed 100 characters',
                'any.required': 'Title is required',
            }),
        description: Joi.string()
            .min(10)
            .max(500)
            .required()
            .messages({
                'string.min': 'Description must be at least 10 characters',
                'string.max': 'Description must not exceed 500 characters',
                'any.required': 'Description is required',
            }),
        imageUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Image URL must be a valid URI',
            }),
        attributes: Joi.array()
            .items(
                Joi.object({
                    trait_type: Joi.string().required(),
                    value: Joi.string().required(),
                })
            )
            .min(1)
            .required()
            .messages({
                'array.min': 'At least one attribute is required',
                'any.required': 'Attributes are required',
            }),
    }).required(),
    verifiedBy: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid verifier ID format',
        }),
});

export const credentialIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid credential ID format',
            'any.required': 'Credential ID is required',
        }),
});
