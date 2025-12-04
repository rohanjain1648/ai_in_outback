import Joi from 'joi';

export const gigValidation = {
    createGigJob: Joi.object({
        title: Joi.string().required().max(200).trim(),
        description: Joi.string().required().max(2000).trim(),
        category: Joi.string().required().valid('agriculture', 'construction', 'services', 'transport', 'other'),
        requiredSkills: Joi.array().items(
            Joi.object({
                skillId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
                minimumLevel: Joi.string().required().valid('beginner', 'intermediate', 'advanced', 'expert')
            })
        ).min(1).required(),
        location: Joi.object({
            coordinates: Joi.array().items(Joi.number()).length(2).required(),
            description: Joi.string().required().max(200),
            radius: Joi.number().required().min(0).max(500)
        }).required(),
        payment: Joi.object({
            amount: Joi.number().required().min(0),
            type: Joi.string().required().valid('fixed', 'hourly', 'negotiable'),
            escrowRequired: Joi.boolean().default(false)
        }).required(),
        duration: Joi.object({
            estimatedHours: Joi.number().required().min(0.5),
            startDate: Joi.date().optional(),
            deadline: Joi.date().optional()
        }).required()
    }),

    updateGigJob: Joi.object({
        title: Joi.string().max(200).trim(),
        description: Joi.string().max(2000).trim(),
        category: Joi.string().valid('agriculture', 'construction', 'services', 'transport', 'other'),
        requiredSkills: Joi.array().items(
            Joi.object({
                skillId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
                minimumLevel: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert')
            })
        ).min(1),
        location: Joi.object({
            coordinates: Joi.array().items(Joi.number()).length(2),
            description: Joi.string().max(200),
            radius: Joi.number().min(0).max(500)
        }),
        payment: Joi.object({
            amount: Joi.number().min(0),
            type: Joi.string().valid('fixed', 'hourly', 'negotiable'),
            escrowRequired: Joi.boolean()
        }),
        duration: Joi.object({
            estimatedHours: Joi.number().min(0.5),
            startDate: Joi.date(),
            deadline: Joi.date()
        })
    }).min(1),

    searchGigJobs: Joi.object({
        category: Joi.string().valid('agriculture', 'construction', 'services', 'transport', 'other'),
        minPayment: Joi.number().min(0),
        maxPayment: Joi.number().min(0),
        paymentType: Joi.string().valid('fixed', 'hourly', 'negotiable'),
        maxDistance: Joi.number().min(0).max(500),
        userLocation: Joi.array().items(Joi.number()).length(2),
        skillIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
        status: Joi.string().valid('open', 'in_progress', 'completed', 'cancelled', 'disputed'),
        limit: Joi.number().min(1).max(100).default(20),
        skip: Joi.number().min(0).default(0)
    }),

    applyForJob: Joi.object({
        message: Joi.string().required().max(1000).trim()
    }),

    selectWorker: Joi.object({
        workerId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
    }),

    rateJob: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        review: Joi.string().required().max(1000).trim(),
        raterRole: Joi.string().required().valid('poster', 'worker')
    })
};
